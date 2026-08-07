require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// service-account.json didapat dari Firebase Console -> Project Settings
// -> Service Accounts -> Generate new private key. JANGAN commit file ini.
admin.initializeApp({
	credential: admin.credential.cert(require('./service-account.json'))
});

const llmRoutes = require('./routes/llm');
const midtransRoutes = require('./routes/midtrans');

const app = express();
app.use(express.json({ limit: '1mb' }));

// Hanya izinkan request dari domain/IP frontend-mu. Tambahkan origin lain
// di sini kalau nanti pakai custom domain.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(
	cors({
		origin: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : true // true = allow all (dev only, ganti untuk production)
	})
);

app.use('/api', llmRoutes);
app.use('/api/midtrans', midtransRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend server listening on port ${PORT}`));
