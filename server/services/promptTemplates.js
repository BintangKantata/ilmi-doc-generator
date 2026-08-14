const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Default fallback dipakai kalau dokumen promptTemplates untuk docType
 * tertentu belum ada di Firestore -- supaya generation tidak pernah gagal
 * total cuma karena data prompt belum di-seed untuk tipe itu.
 */
const FALLBACK_TEMPLATE = {
	systemInstruction: 'You are an academic writing assistant helping draft a complete research paper.',
	consistencyRules: `
Critical rules you MUST follow:
- Use ONLY the facts, figures, and terms given in the context below. Do NOT invent new numbers, statistics, or claims not present in the context.
- Reuse the exact same numbers/terminology across every section for consistency (e.g. if accuracy is 94.2% in one section, it must be 94.2% everywhere it's mentioned, never a different number).
- Do not fabricate citations, DOIs, or references to external papers that were not provided.
- If a section needs information not present in the context, write in general terms appropriate for an academic paper rather than inventing specifics.
`,
	sectionWordRange: { min: 150, max: 350 }
};

/**
 * Ubah docType ("Academic Journal") jadi document ID Firestore yang aman
 * ("academic-journal") -- lowercase, spasi/slash jadi tanda hubung.
 */
function slugifyDocType(docType) {
	return (docType || 'default')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

/**
 * Ambil template prompt sesuai docType project. Kalau belum ada di
 * Firestore untuk docType itu, pakai FALLBACK_TEMPLATE supaya generation
 * tetap jalan.
 */
async function getPromptTemplate(docType) {
	const id = slugifyDocType(docType);
	const snap = await db.doc(`promptTemplates/${id}`).get();
	if (snap.exists) {
		return { id, ...FALLBACK_TEMPLATE, ...snap.data() };
	}
	return { id, docType, ...FALLBACK_TEMPLATE };
}

module.exports = { getPromptTemplate, slugifyDocType, FALLBACK_TEMPLATE };
