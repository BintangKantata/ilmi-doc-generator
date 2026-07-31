import { collection, doc, addDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '$lib/firebase.js';

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
 * Tambah sumber lewat metadata manual (judul, penulis, tahun, venue),
 * boleh disertai link eksternal (DOI/URL) tanpa upload file.
 */
export async function addSource(projectId, { title, authors, year, venue, externalUrl = null }) {
	await addDoc(collection(db, 'projects', projectId, 'sources'), {
		title,
		authors,
		year,
		venue,
		externalUrl,
		fileUrl: null,
		addedAt: serverTimestamp()
	});
}

/**
 * Upload file PDF ke Firebase Storage, lalu simpan metadata + download URL
 * ke Firestore. Butuh Blaze plan aktif.
 * Path storage: projects/{projectId}/sources/{timestamp}_{filename}
 */
export async function uploadSourceFile(projectId, uid, file) {
	const path = `projects/${projectId}/sources/${Date.now()}_${file.name}`;
	const storageRef = ref(storage, path);

	await uploadBytes(storageRef, file, { customMetadata: { uploadedBy: uid } });
	const fileUrl = await getDownloadURL(storageRef);

	await addDoc(collection(db, 'projects', projectId, 'sources'), {
		title: file.name,
		authors: 'Diunggah sendiri',
		year: '—',
		venue: 'PDF',
		externalUrl: null,
		fileUrl,
		storagePath: path,
		addedAt: serverTimestamp()
	});

	return fileUrl;
}

export async function deleteSource(projectId, source) {
	if (source.storagePath) {
		await deleteObject(ref(storage, source.storagePath)).catch(() => {});
	}
	await deleteDoc(doc(db, 'projects', projectId, 'sources', source.id));
}
