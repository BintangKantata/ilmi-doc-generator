import { collection, doc, updateDoc, query, orderBy, onSnapshot, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '$lib/firebase.js';

/**
 * Dengerin semua bagian (sections) dari satu project secara real-time,
 * terurut sesuai field `order`.
 */
export function listenSections(projectId, callback) {
	const q = query(collection(db, 'projects', projectId, 'sections'), orderBy('order', 'asc'));

	return onSnapshot(q, (snapshot) => {
		const sections = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
		callback(sections);
	});
}

/**
 * Simpan isi draf untuk satu bagian. Dipanggil dengan debounce dari editor
 * supaya tidak nulis ke Firestore di setiap ketukan keyboard.
 */
export async function saveSectionContent(projectId, sectionId, content) {
	const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
	await updateDoc(doc(db, 'projects', projectId, 'sections', sectionId), {
		content,
		wordCount,
		status: content.trim() ? 'draf' : 'kosong',
		updatedAt: serverTimestamp()
	});
}

/**
 * Tambah bagian baru di luar 7 bagian default (misal "Ucapan Terima Kasih").
 */
export async function addSection(projectId, label, order) {
	await addDoc(collection(db, 'projects', projectId, 'sections'), {
		label,
		order,
		status: 'kosong',
		content: '',
		updatedAt: serverTimestamp()
	});
}
