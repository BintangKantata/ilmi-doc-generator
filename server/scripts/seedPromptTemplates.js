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
	},
	{
		id: 'ieee-transactions-journal',
		docType: 'IEEE Transactions Journal',
		systemInstruction:
			'You are an academic writing assistant filling in a FIXED IEEE Transactions journal sentence template. Every section below is a near-complete paragraph with {{placeholder}} slots. You must copy every word OUTSIDE the {{...}} markers EXACTLY as given -- do not rephrase, reorder, shorten, or paraphrase the template sentences in any way. Your only job is to replace each {{placeholder}} with a short, natural phrase drawn from the research context, making small grammatical adjustments only where needed for the sentence to read fluently (e.g. articles, pluralization, verb agreement) immediately around the inserted phrase.',
		consistencyRules: COMMON_CONSISTENCY_RULES,
		sectionWordRange: { min: 150, max: 300 },
		// Kalimat template IEEE (sudah diterjemahkan ke Inggris), kalimat
		// tetap wajib dipertahankan persis -- cuma {{placeholder}} yang
		// diisi. Nama placeholder sengaja dibuat mirip/identik dengan key
		// di researchContext/templateValues supaya gampang dipetakan model.
		sectionTemplates: {
			abstract:
				'This research aims to {{research_goal}}. Currently, {{existing_condition}} still faces challenges in {{challenge}}. The main problem in this research is {{main_problem}}, which causes {{problem_impact}}. Previous research has proposed {{prior_solution}} to address {{main_problem}}, which showed {{prior_strength}}, but still has limitations in {{prior_limitation}}. This research proposes {{proposed_solution}} using {{method}} to address {{main_problem}}, which is expected to improve {{improved_aspect}}. This research produces {{research_result}}, showing an improvement in {{result_improvement}} compared to {{previous_method}}. This research concludes that {{conclusion}}, which can contribute to {{application_domain}}.',
			intro:
				'Every year, {{surprising_statistic}} shows a significant increase in {{main_problem}}, directly impacting {{study_field}}. In recent years, advances in {{study_field}} have brought significant change to {{application_context}}, opening new opportunities while also introducing challenges in {{main_problem}}. This problem carries high significance in {{study_field}} because of its impact on {{specific_aspect}}, which increasingly demands a more effective and innovative solution. {{main_problem}} remains a significant obstacle in {{study_field}}, requiring a more effective solution. This research aims to develop {{proposed_solution}} that is more effective at addressing {{main_problem}} in the field of {{study_field}}. Research in {{study_field}} has advanced rapidly, with prior studies focusing on {{specific_aspect}} using {{existing_solution}}. Although various approaches have been proposed in prior research, limitations in {{prior_limitation}} remain a challenge that needs to be addressed. This research contributes by developing {{proposed_solution}}, which is superior to previous approaches in improving {{improved_aspect}}. This paper is organized into several sections to provide a systematic overview of the research conducted.',
			method:
				'This research was conducted by applying {{method}} to ensure the accuracy and reliability of the results, with every step designed to be systematically replicable. This research is designed as {{research_type}}, aiming to evaluate {{evaluated_variable}} through a series of systematic stages. Data in this research were obtained through {{data_collection_method}}, using {{instrument}} to ensure accuracy and reliability of the results. The data preprocessing process begins with an initial exploration of the dataset to identify patterns, distributions, and potential anomalies in the data. This research proposes a system architecture based on {{method}}, designed to improve {{system_goal}} through a more efficient and structured approach. Evaluation in this research is conducted using the {{metric_name}} metric, used to measure {{evaluated_aspect}} based on the experimental results obtained.',
			result:
				'The results show that the proposed method is able to improve {{primary_result_aspect}} by {{result_percentage}}, compared to the conventional approach. The results show a consistent improvement pattern in {{primary_result_aspect}}, with a stable growth trend across all experiments conducted. The empirical evaluation results show that the proposed approach is able to improve {{evaluation_metrics}} by {{result_percentage}} based on a series of experiments conducted. The statistical analysis results show that there is a significant difference between {{statistical_variable_1}} and {{statistical_variable_2}}, as evidenced by a p-value of {{p_value}}, which is below the significance threshold of {{significance_level}}.',
			discussion:
				'The results show that the proposed method achieves a performance improvement of {{discussion_improvement}} compared to the previous approach, reflecting the advantage of the strategy applied in improving {{evaluated_aspect}}. The results consistently show that the proposed approach supports the initial hypothesis, as evidenced by the significant performance improvement in {{evaluation_metrics}} compared to the previous method. These results open opportunities for wider application in {{impact_domain}}, particularly in improving the efficiency and effectiveness of {{practical_application}} in real-world settings. This research has limitations in the scope of data used, so future studies could consider a broader and more diverse dataset to improve the generalizability of the findings.'
		},
		// Bukan template isi-kosong seperti di atas -- di file aslinya ini
		// contoh paragraf utuh yang berfungsi sebagai POLA gaya, bukan
		// kalimat wajib. Disimpan terpisah supaya backend tau harus
		// diperlakukan beda (free-form mengikuti pola, bukan fill-in-blank).
		impactStatementGuidance:
			'Write an Impact Statement (max 150 words) following this pattern: (1) briefly state the common/current technology or approach in this field, (2) mention its known benefit, (3) cite a concrete limitation or problem with it (a statistic if available in the context), (4) explain how this research overcomes that limitation, (5) state the resulting improvement with a concrete figure from the context, (6) briefly note real-world applications or domains that could benefit. Do not copy any example wording -- write original sentences following only this structure.'
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
