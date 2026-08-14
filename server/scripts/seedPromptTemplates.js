/**
 * Script sekali-jalan untuk mengisi collection `promptTemplates` di
 * Firestore, satu dokumen per docType yang ada di dropdown New Project.
 *
 * Jalankan dari folder server/:
 *   node scripts/seedPromptTemplates.js
 *
 * Aman dijalankan berkali-kali (pakai `set`, jadi menimpa/update, bukan
 * duplikat) -- cocok dipakai juga saat mau update wording prompt nanti.
 */
const admin = require('firebase-admin');
const path = require('path');

admin.initializeApp({
	credential: admin.credential.cert(require(path.join(__dirname, '..', 'service-account.json')))
});

const db = admin.firestore();

const COMMON_CONSISTENCY_RULES = `
Critical rules you MUST follow:
- Use ONLY the facts, figures, and terms given in the context below. Do NOT invent new numbers, statistics, or claims not present in the context.
- Reuse the exact same numbers/terminology across every section for consistency (e.g. if accuracy is 94.2% in one section, it must be 94.2% everywhere it's mentioned, never a different number).
- Do not fabricate citations, DOIs, or references to external papers that were not provided.
- If a section needs information not present in the context, write in general terms appropriate for an academic paper rather than inventing specifics.
`;

const templates = [
	{
		id: 'academic-journal',
		docType: 'Academic Journal',
		systemInstruction:
			'You are an academic writing assistant helping draft a journal article. Use a formal, concise, peer-review-ready tone typical of published journal papers. Prefer precise, technical phrasing over narrative storytelling.',
		consistencyRules: COMMON_CONSISTENCY_RULES,
		sectionWordRange: { min: 150, max: 350 }
	},
	{
		id: 'thesis-dissertation',
		docType: 'Thesis / Dissertation',
		systemInstruction:
			'You are an academic writing assistant helping draft a section of a thesis/dissertation. Use a more thorough, explanatory academic tone than a short journal paper -- elaborate on reasoning and context more, as expected in a thesis chapter, while still being precise and well-structured.',
		consistencyRules: COMMON_CONSISTENCY_RULES,
		sectionWordRange: { min: 250, max: 450 }
	},
	{
		id: 'literature-review',
		docType: 'Literature Review',
		systemInstruction:
			'You are an academic writing assistant helping draft a literature review. Emphasize synthesis and comparison of existing approaches, gaps, and how the proposed work relates to prior work. Keep a scholarly, evaluative tone.',
		consistencyRules: COMMON_CONSISTENCY_RULES,
		sectionWordRange: { min: 200, max: 400 }
	},
	{
		id: 'research-report',
		docType: 'Research Report',
		systemInstruction:
			'You are an academic writing assistant helping draft a research report. Use a clear, direct, results-oriented tone suitable for an internal or applied research report rather than a formal journal submission.',
		consistencyRules: COMMON_CONSISTENCY_RULES,
		sectionWordRange: { min: 150, max: 300 }
	}
];

async function seed() {
	for (const t of templates) {
		const { id, ...data } = t;
		await db.doc(`promptTemplates/${id}`).set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
		console.log(`Seeded promptTemplates/${id}`);
	}
	console.log('Done.');
	process.exit(0);
}

seed().catch((err) => {
	console.error('Seeding failed:', err);
	process.exit(1);
});
