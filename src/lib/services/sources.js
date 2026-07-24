import { collection, doc, addDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase.js';

/**
 * Dengerin semua sumber (sources) dari satu project secara real-time.
 */
export function listenSources(projectId, callback) {
	const q = query(collection(db, 'projects', projectId, 'sources'), orderBy('addedAt', 'desc'));

	return onSnapshot(q, (snapshot) => {
		const sources = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
		callback(sources);
	});
}

/**
 * Tambah sumber (metadata saja — judul, penulis, tahun, venue).
 * Storage file fisik sengaja tidak dipakai supaya tetap di Firebase plan
 * gratis (Spark). Kalau butuh simpan file PDF, host di layanan terpisah
 * (misal Cloudinary/Supabase Storage free tier) lalu isi `externalUrl`.
 */
export async function addSource(projectId, { title, authors, year, venue, externalUrl = null }) {
	await addDoc(collection(db, 'projects', projectId, 'sources'), {
		title,
		authors,
		year,
		venue,
		externalUrl,
		addedAt: serverTimestamp()
	});
}

export async function deleteSource(projectId, sourceId) {
	await deleteDoc(doc(db, 'projects', projectId, 'sources', sourceId));
}
