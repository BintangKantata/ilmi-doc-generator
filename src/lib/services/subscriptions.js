import { collection, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '$lib/firebase.js';

const SNAP_SRC = {
	sandbox: 'https://app.sandbox.midtrans.com/snap/snap.js',
	production: 'https://app.midtrans.com/snap/snap.js'
};

const API_BASE = import.meta.env.VITE_LLM_API_BASE || '/api';

export function listenPlans(callback) {
	const q = query(collection(db, 'plans'), orderBy('order', 'asc'));
	return onSnapshot(q, (snapshot) => {
		callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
	});
}

export function listenSubscription(uid, callback) {
	return onSnapshot(doc(db, 'subscriptions', uid), (snap) => {
		callback(snap.exists() ? { id: snap.id, ...snap.data() } : { id: uid, planId: null, status: 'inactive' });
	});
}

function loadSnapScript(clientKey, env = 'sandbox') {
	return new Promise((resolve, reject) => {
		if (window.snap) return resolve(window.snap);
		const script = document.createElement('script');
		script.src = SNAP_SRC[env];
		script.setAttribute('data-client-key', clientKey);
		script.onload = () => resolve(window.snap);
		script.onerror = () => reject(new Error('Failed to load Midtrans Snap script'));
		document.head.appendChild(script);
	});
}

/**
 * Alur checkout:
 * 1. Panggil endpoint Express /api/midtrans/create-transaction (server bikin
 *    order + minta Snap Token ke Midtrans pakai Server Key)
 * 2. Muat Snap.js kalau belum ada
 * 3. Buka popup pembayaran Midtrans (snap.pay)
 *
 * Status final (active/expired/dll) di Firestore diupdate oleh endpoint
 * /api/midtrans/webhook yang dipanggil Midtrans langsung, bukan oleh
 * callback di bawah ini -- callback di sini cuma untuk UX.
 */
export async function startCheckout(planId, { onSuccess, onPending, onError, onClose } = {}) {
	if (!auth.currentUser) {
		throw new Error('You must be logged in.');
	}
	const idToken = await auth.currentUser.getIdToken();

	const res = await fetch(`${API_BASE}/midtrans/create-transaction`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${idToken}`
		},
		body: JSON.stringify({ planId })
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || `Request failed (${res.status})`);
	}

	const snap = await loadSnapScript(data.clientKey, data.env || 'sandbox');

	snap.pay(data.token, {
		onSuccess: (result) => onSuccess?.(result),
		onPending: (result) => onPending?.(result),
		onError: (result) => onError?.(result),
		onClose: () => onClose?.()
	});
}
