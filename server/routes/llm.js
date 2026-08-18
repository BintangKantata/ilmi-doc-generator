const express = require('express');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { requireAuth } = require('../middleware/auth');
const { getPromptTemplate } = require('../services/promptTemplates');

const router = express.Router();
const db = admin.firestore();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';

function getModel() {
	if (!GEMINI_API_KEY) {
		throw new Error('GEMINI_API_KEY is not set on the server.');
	}
	const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
	return genAI.getGenerativeModel({ model: MODEL_NAME });
}

function parseJsonResponse(text) {
	const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
	return JSON.parse(cleaned);
}

/**
 * Format researchContext + templateValues jadi blok teks yang jelas
 * untuk dimasukkan ke prompt. Setiap key/value ditulis apa adanya --
 * inilah "anchor" yang wajib dipakai konsisten di semua bagian paper.
 */
function formatContextForPrompt(researchContext, templateValues) {
	const contextLines = Object.entries(researchContext || {})
		.map(([k, v]) => `- ${k}: ${v}`)
		.join('\n');
	const templateLines = Object.entries(templateValues || {})
		.map(([k, v]) => `- ${k}: ${v}`)
		.join('\n');

	return `RESEARCH CONTEXT (canonical facts -- reuse these exact figures/terms consistently across every section):
${contextLines}

${templateLines ? `ADDITIONAL DETAIL VARIABLES (use where relevant for the matching section):\n${templateLines}` : ''}`;
}

/**
 * generatePaper -- generate SELURUH bagian paper sekaligus dalam satu
 * pemanggilan Gemini, berdasarkan researchContext + templateValues yang
 * disimpan di project, DAN prompt template sesuai docType project
 * (dari collection Firestore `promptTemplates`). Hasilnya langsung
 * ditulis ke Firestore (projects/{id}/sections/{sectionId}) lewat Admin
 * SDK, supaya frontend cukup dengerin realtime listener yang sudah ada.
 *
 * Input:  { projectId }
 * Output: { sections: [{ id, label, wordCount }] }
 */
router.post('/generate-paper', requireAuth, async (req, res) => {
	const { projectId } = req.body;
	if (!projectId) {
		return res.status(400).json({ error: 'projectId is required.' });
	}

	const projectSnap = await db.doc(`projects/${projectId}`).get();
	if (!projectSnap.exists) {
		return res.status(404).json({ error: 'Project not found.' });
	}
	const project = projectSnap.data();

	if (project.ownerId !== req.uid) {
		return res.status(403).json({ error: 'You do not have access to this project.' });
	}

	if (!project.researchContext) {
		return res.status(400).json({ error: 'This project has no research context set. Fill it in before generating.' });
	}

	const sectionsSnap = await db.collection(`projects/${projectId}/sections`).orderBy('order', 'asc').get();
	const sections = sectionsSnap.docs.map((d) => ({ id: d.id, label: d.data().label }));

	if (sections.length === 0) {
		return res.status(400).json({ error: 'This project has no sections defined.' });
	}

	const template = await getPromptTemplate(project.docType);
	const wordRange = template.sectionWordRange || { min: 150, max: 350 };
	const sectionTemplates = template.sectionTemplates || {};

	// Untuk tiap section, tentukan instruksinya: kalau ada sectionTemplates
	// (kalimat wajib IEEE dengan {{placeholder}}), suruh model ISI
	// placeholder-nya saja tanpa mengubah kalimat di luar itu. Kalau tidak
	// ada, tetap free-form seperti sebelumnya.
	const sectionInstructions = sections
		.map((s) => {
			if (sectionTemplates[s.id]) {
				return `- "${s.id}" (${s.label}): Use EXACTLY this sentence template, filling only the {{...}} placeholders based on the research context. Do not alter any text outside the {{...}} markers:\n  """\n  ${sectionTemplates[s.id]}\n  """`;
			}
			return `- "${s.id}" (${s.label}): Write a free-form academic paragraph (${wordRange.min}-${wordRange.max} words) for this section.`;
		})
		.join('\n\n');

	const impactNote = template.impactStatementGuidance ? `\nIf a section is named or clearly corresponds to an "Impact Statement", follow this guidance instead of the rules above: ${template.impactStatementGuidance}\n` : '';

	const prompt = `${template.systemInstruction}

Write a COMPLETE research paper draft, based STRICTLY on the research context below.

${formatContextForPrompt(project.researchContext, project.templateValues)}

Paper settings:
- Document type: ${project.docType || 'Academic Journal'}
- Citation style: ${project.citationStyle || 'APA 7th'}
- Write in: ${project.language || 'English'}

${template.consistencyRules}
${impactNote}
Now write each of the following sections:

${sectionInstructions}

Respond ONLY with valid JSON, no markdown fences, where each key is the exact section id given above and each value is that section's final text (with placeholders already filled in, if it had a template). Example shape:
{"abstract": "...", "intro": "..."}`;

	let parsed;
	try {
		const result = await getModel().generateContent(prompt);
		parsed = parseJsonResponse(result.response.text());
	} catch (err) {
		console.error('generate-paper error:', err);
		return res.status(500).json({ error: 'Failed to generate the paper from Gemini.' });
	}

	const batch = db.batch();
	const updatedSections = [];

	for (const s of sections) {
		const content = parsed[s.id];
		if (!content) continue;
		const wordCount = content.trim().split(/\s+/).length;
		batch.set(
			db.doc(`projects/${projectId}/sections/${s.id}`),
			{
				content,
				wordCount,
				status: 'draft',
				updatedAt: admin.firestore.FieldValue.serverTimestamp()
			},
			{ merge: true }
		);
		updatedSections.push({ id: s.id, label: s.label, wordCount });
	}

	const progress = Math.round((updatedSections.length / sections.length) * 100);
	batch.set(
		db.doc(`projects/${projectId}`),
		{ progress, paperGenerated: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
		{ merge: true }
	);

	await batch.commit();

	res.json({ sections: updatedSections });
});

router.post('/expand', requireAuth, async (req, res) => {
	const { currentContent, sources } = req.body;
	if (!currentContent || !currentContent.trim()) {
		return res.status(400).json({ error: 'currentContent is required.' });
	}

	const sourceList =
		sources && sources.length
			? sources.map((s, i) => `[${i + 1}] ${s.title} - ${s.authors} (${s.year})${s.venue ? `, ${s.venue}` : ''}`).join('\n')
			: '(No sources provided.)';

	const prompt = `You are an academic writing assistant. Expand the following paragraph with more detail and depth, without changing its core meaning or removing any existing [n] citations or figures.

Available sources (for any NEW citations you add, cite using [n] matching the number below):
${sourceList}

Do NOT invent new statistics or facts not implied by the text or sources above.

Current paragraph:
"""
${currentContent}
"""

Respond ONLY with valid JSON, no markdown fences, in this exact shape:
{"content": "the expanded paragraph text"}`;

	try {
		const result = await getModel().generateContent(prompt);
		const parsed = parseJsonResponse(result.response.text());
		res.json({ content: parsed.content || currentContent });
	} catch (err) {
		console.error('expand error:', err);
		res.status(500).json({ error: 'Failed to expand text.' });
	}
});

router.post('/condense', requireAuth, async (req, res) => {
	const { currentContent } = req.body;
	if (!currentContent || !currentContent.trim()) {
		return res.status(400).json({ error: 'currentContent is required.' });
	}

	const prompt = `You are an academic writing assistant. Condense the following paragraph to be more concise, while preserving its core meaning and KEEPING every [n] citation marker and every figure/number that appears in the original text -- do not remove or alter any of them.

Current paragraph:
"""
${currentContent}
"""

Respond ONLY with valid JSON, no markdown fences, in this exact shape:
{"content": "the condensed paragraph text"}`;

	try {
		const result = await getModel().generateContent(prompt);
		const parsed = parseJsonResponse(result.response.text());
		res.json({ content: parsed.content || currentContent });
	} catch (err) {
		console.error('condense error:', err);
		res.status(500).json({ error: 'Failed to condense text.' });
	}
});

module.exports = router;
