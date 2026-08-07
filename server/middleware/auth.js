const admin = require('firebase-admin');

/**
 * Cek header "Authorization: Bearer <idToken>" yang dikirim frontend
 * (idToken didapat dari `auth.currentUser.getIdToken()` di Svelte).
 * Ini memastikan cuma user yang sudah login di aplikasi yang bisa
 * memanggil endpoint ini -- bukan sembarang orang yang tau URL server.
 */
async function requireAuth(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

	if (!idToken) {
		return res.status(401).json({ error: 'Missing Authorization header.' });
	}

	try {
		const decoded = await admin.auth().verifyIdToken(idToken);
		req.uid = decoded.uid;
		req.email = decoded.email;
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token.' });
	}
}

module.exports = { requireAuth };
