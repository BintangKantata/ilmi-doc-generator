import { auth } from '$lib/firebase.js';

// URL server Express yang jalan di EC2, di-proxy lewat Nginx path /api/
// (lihat konfigurasi Nginx di dokumentasi setup). Di lokal (npm run dev),
// arahkan ke server lokal kalau kamu jalankan server ini juga di lokal.
const API_BASE = import.meta.env.VITE_LLM_API_BASE || '/api';

async function callApi(path, body) {
	if (!auth.currentUser) {
		throw new Error('You must be logged in.');
	}
	const idToken = await auth.currentUser.getIdToken();

	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${idToken}`
		},
		body: JSON.stringify(body)
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || `Request failed (${res.status})`);
	}
	return data;
}

function toSourcePayload(sources) {
	return (sources || []).map((s) => ({
		title: s.title,
		authors: s.authors,
		year: s.year,
		venue: s.venue
	}));
}

/**
 * Generate draf awal untuk satu bagian paper.
 * Return: { content, citationsUsed }
 */
export async function generateDraft({ sectionLabel, topic, citationStyle, language, sources }) {
	return callApi('/generate-draft', {
		sectionLabel,
		topic,
		citationStyle,
		language,
		sources: toSourcePayload(sources)
	});
}

/**
 * Perluas teks yang sudah ada di editor.
 * Return: { content }
 */
export async function expandText(currentContent, sources) {
	return callApi('/expand', {
		currentContent,
		sources: toSourcePayload(sources)
	});
}

/**
 * Ringkas teks yang sudah ada di editor.
 * Return: { content }
 */
export async function condenseText(currentContent) {
	return callApi('/condense', { currentContent });
}
