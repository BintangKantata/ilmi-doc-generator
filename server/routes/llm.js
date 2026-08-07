const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

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

function formatSourcesForPrompt(sources) {
	if (!sources || sources.length === 0) return '(No sources provided.)';
	return sources
		.map((s, i) => `[${i + 1}] ${s.title} - ${s.authors} (${s.year})${s.venue ? `, ${s.venue}` : ''}`)
		.join('\n');
}

const CITATION_SAFETY_RULES = `
Critical rules you MUST follow:
- You are only given the TITLE, AUTHORS, YEAR, and VENUE of each source below -- not their full text.
- Do NOT invent specific findings, statistics, quotes, or claims and attribute them to a source unless it is a widely known, general fact about that topic.
- You may reference a source's general subject matter (based on its title) to support a general statement, citing it as [n].
- NEVER invent a citation number that is not in the provided source list.
- If you cannot support a claim with the given sources or general knowledge, write it without a citation rather than fabricating one, or omit the claim entirely.
- Do not fabricate DOIs, page numbers, or direct quotes.
`;

router.post('/generate-draft', requireAuth, async (req, res) => {
	const { sectionLabel, topic, citationStyle, language, sources } = req.body;
	if (!sectionLabel || !topic) {
		return res.status(400).json({ error: 'sectionLabel and topic are required.' });
	}

	const prompt = `You are an academic writing assistant helping draft a section of a research paper.

Section: "${sectionLabel}"
Paper topic / research question: "${topic}"
Citation style: ${citationStyle || 'APA 7th'}
Write in: ${language || 'English'}

Available sources (cite using [n] matching the number below):
${formatSourcesForPrompt(sources)}

${CITATION_SAFETY_RULES}

Write a well-structured academic paragraph (150-300 words) for this section. Respond ONLY with valid JSON, no markdown fences, in this exact shape:
{"content": "the paragraph text with [n] citation markers", "citationsUsed": [1, 2]}`;

	try {
		const result = await getModel().generateContent(prompt);
		const parsed = parseJsonResponse(result.response.text());
		res.json({ content: parsed.content || '', citationsUsed: parsed.citationsUsed || [] });
	} catch (err) {
		console.error('generate-draft error:', err);
		res.status(500).json({ error: 'Failed to generate draft.' });
	}
});

router.post('/expand', requireAuth, async (req, res) => {
	const { currentContent, sources } = req.body;
	if (!currentContent || !currentContent.trim()) {
		return res.status(400).json({ error: 'currentContent is required.' });
	}

	const prompt = `You are an academic writing assistant. Expand the following paragraph with more detail and depth, without changing its core meaning or removing any existing [n] citations.

Available sources (for any NEW citations you add, cite using [n] matching the number below):
${formatSourcesForPrompt(sources)}

${CITATION_SAFETY_RULES}

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

	const prompt = `You are an academic writing assistant. Condense the following paragraph to be more concise, while preserving its core meaning and KEEPING every [n] citation marker that appears in the original text -- do not remove any citation.

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
