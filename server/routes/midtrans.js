const express = require('express');
const admin = require('firebase-admin');
const midtransClient = require('midtrans-client');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const db = admin.firestore();

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

function getSnapClient() {
	return new midtransClient.Snap({
		isProduction: MIDTRANS_IS_PRODUCTION,
		serverKey: MIDTRANS_SERVER_KEY,
		clientKey: MIDTRANS_CLIENT_KEY
	});
}

function getCoreApiClient() {
	return new midtransClient.CoreApi({
		isProduction: MIDTRANS_IS_PRODUCTION,
		serverKey: MIDTRANS_SERVER_KEY,
		clientKey: MIDTRANS_CLIENT_KEY
	});
}

function computePeriodEnd(interval) {
	const now = new Date();
	if (interval === 'year') {
		now.setFullYear(now.getFullYear() + 1);
	} else {
		now.setMonth(now.getMonth() + 1);
	}
	return admin.firestore.Timestamp.fromDate(now);
}

/**
 * Dipanggil dari frontend saat user klik "Subscribe".
 * Input:  { planId }
 * Output: { token, orderId, clientKey, env }
 */
router.post('/create-transaction', requireAuth, async (req, res) => {
	if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
		return res.status(412).json({ error: 'Midtrans keys are not configured on the server.' });
	}

	const { planId } = req.body;
	if (!planId) {
		return res.status(400).json({ error: 'planId is required.' });
	}

	const uid = req.uid;
	const email = req.email || 'no-email@example.com';

	const planSnap = await db.doc(`plans/${planId}`).get();
	if (!planSnap.exists) {
		return res.status(404).json({ error: `Plan "${planId}" not found.` });
	}
	const plan = planSnap.data();

	if (!plan.price || plan.price <= 0) {
		return res.status(400).json({ error: 'This plan cannot be checked out (free plan).' });
	}

	const orderId = `${uid}_${Date.now()}`;

	let transaction;
	try {
		transaction = await getSnapClient().createTransaction({
			transaction_details: { order_id: orderId, gross_amount: plan.price },
			customer_details: { email },
			item_details: [{ id: planId, price: plan.price, quantity: 1, name: plan.name }]
		});
	} catch (err) {
		console.error('Midtrans createTransaction failed', err);
		return res.status(500).json({ error: 'Failed to create Midtrans transaction.' });
	}

	await db.doc(`subscriptions/${uid}`).set(
		{
			planId,
			planName: plan.name,
			status: 'pending',
			midtransOrderId: orderId,
			updatedAt: admin.firestore.FieldValue.serverTimestamp()
		},
		{ merge: true }
	);

	res.json({
		token: transaction.token,
		orderId,
		clientKey: MIDTRANS_CLIENT_KEY,
		env: MIDTRANS_IS_PRODUCTION ? 'production' : 'sandbox'
	});
});

/**
 * Didaftarkan sebagai "Payment Notification URL" di Midtrans Dashboard.
 * TIDAK pakai requireAuth -- Midtrans yang manggil ini, bukan user browser.
 */
router.post('/webhook', async (req, res) => {
	try {
		const statusResponse = await getCoreApiClient().transaction.notification(req.body);
		const orderId = statusResponse.order_id;
		const transactionStatus = statusResponse.transaction_status;
		const fraudStatus = statusResponse.fraud_status;

		const uid = orderId.split('_')[0];
		if (!uid) {
			console.warn('Could not extract uid from orderId', orderId);
			return res.status(200).send('OK');
		}

		let status = 'pending';
		if (transactionStatus === 'capture') {
			status = fraudStatus === 'accept' ? 'active' : 'pending';
		} else if (transactionStatus === 'settlement') {
			status = 'active';
		} else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
			status = 'expired';
		}

		const updateData = {
			status,
			midtransOrderId: orderId,
			updatedAt: admin.firestore.FieldValue.serverTimestamp()
		};

		if (status === 'active') {
			const subDoc = await db.doc(`subscriptions/${uid}`).get();
			const planId = subDoc.data()?.planId;
			const planSnap = planId ? await db.doc(`plans/${planId}`).get() : null;
			const interval = planSnap?.data()?.interval || 'month';
			updateData.currentPeriodEnd = computePeriodEnd(interval);
		}

		await db.doc(`subscriptions/${uid}`).set(updateData, { merge: true });
		console.log(`Subscription for ${uid} updated to status=${status} (order ${orderId})`);
		res.status(200).send('OK');
	} catch (err) {
		console.error('midtrans webhook error', err);
		res.status(500).send('Error processing notification');
	}
});

module.exports = router;
