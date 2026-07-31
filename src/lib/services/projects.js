import {
	collection,
	doc,
	addDoc,
	getDoc,
	setDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	onSnapshot,
	serverTimestamp
} from 'firebase/firestore';
import { db } from '$lib/firebase.js';

const DEFAULT_SECTIONS = [
	{ id: 'abstract', label: 'Abstract', order: 0 },
	{ id: 'intro', label: 'Introduction', order: 1 },
	{ id: 'litreview', label: 'Literature Review', order: 2 },
	{ id: 'method', label: 'Methodology', order: 3 },
	{ id: 'result', label: 'Results', order: 4 },
	{ id: 'discussion', label: 'Discussion', order: 5 },
	{ id: 'conclusion', label: 'Conclusion', order: 6 }
];

/**
 * Dengerin daftar project milik user tertentu secara real-time.
 * callback dipanggil setiap kali ada perubahan data.
 * Return: fungsi unsubscribe (panggil saat komponen di-destroy).
 */
export function listenProjects(uid, callback) {
	const q = query(collection(db, 'projects'), where('ownerId', '==', uid), orderBy('updatedAt', 'desc'));

	return onSnapshot(q, (snapshot) => {
		const projects = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
		callback(projects);
	});
}

/**
 * Bikin project baru + otomatis seed 7 bagian outline default.
 * Return: id project yang baru dibuat.
 */
export async function createProject(uid, { topic, title, docType, citationStyle, language }) {
	const projectRef = await addDoc(collection(db, 'projects'), {
		ownerId: uid,
		title: title || topic.slice(0, 80),
		topic,
		docType,
		citationStyle,
		language,
		progress: 0,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});

	// Seed default outline sections sebagai subcollection
	await Promise.all(
		DEFAULT_SECTIONS.map((s) =>
			setDoc(doc(db, 'projects', projectRef.id, 'sections', s.id), {
				label: s.label,
				order: s.order,
				status: 'empty',
				content: '',
				updatedAt: serverTimestamp()
			})
		)
	);

	return projectRef.id;
}

export async function getProject(projectId) {
	const snap = await getDoc(doc(db, 'projects', projectId));
	if (!snap.exists()) return null;
	return { id: snap.id, ...snap.data() };
}

export async function deleteProject(projectId) {
	await deleteDoc(doc(db, 'projects', projectId));
	// Catatan: ini tidak otomatis menghapus subcollection (sections/sources).
	// Untuk produksi, hapus subcollection lewat Cloud Function trigger onDelete.
}
