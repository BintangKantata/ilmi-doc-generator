<script>
	import { goto } from '$app/navigation';
	import Topbar from '$lib/components/Topbar.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { user } from '$lib/stores/auth.js';
	import { t } from '$lib/i18n';
	import { createProject } from '$lib/services/projects.js';
	import { addSource } from '$lib/services/sources.js';

	let creating = false;

	// ---- Research Context (required -- this is the AI's consistency anchor) ----
	let ctx = {
		domain: '',
		problem: '',
		existing_solution: '',
		limitation: '',
		proposed_solution: '',
		method: '',
		dataset: '',
		evaluation_metric: '',
		baseline: '',
		result: '',
		contribution: ''
	};

	// Field order + English placeholders (illustrative examples -- kept in
	// English regardless of UI language, since they're just examples).
	// Labels come from $t.newProject.contextFields at render time.
	const CONTEXT_FIELD_KEYS = [
		{ key: 'domain', placeholder: 'e.g. deep learning-based agricultural image classification', wide: true },
		{ key: 'problem', placeholder: 'e.g. unstable disease classification under visual variation', wide: true },
		{ key: 'existing_solution', placeholder: 'e.g. simple 3-layer CNN and transfer learning without fine-tuning' },
		{ key: 'limitation', placeholder: 'e.g. prediction quality and efficiency not evaluated uniformly' },
		{ key: 'proposed_solution', placeholder: 'e.g. comparative classification pipeline' },
		{ key: 'method', placeholder: 'e.g. MobileNetV2 and ResNet50' },
		{ key: 'dataset', placeholder: 'e.g. 2,400 synthetic leaf images across 4 balanced classes' },
		{ key: 'evaluation_metric', placeholder: 'e.g. accuracy as the primary metric' },
		{ key: 'baseline', placeholder: 'e.g. simple 3-layer CNN with 78.0% accuracy' },
		{ key: 'result', placeholder: 'e.g. accuracy improved from 78.0% to 94.2% with ResNet50' },
		{ key: 'contribution', placeholder: 'e.g. comparative evaluation of accuracy and efficiency' }
	];

	$: contextComplete = CONTEXT_FIELD_KEYS.every((f) => ctx[f.key].trim());

	// ---- Settings ----
	let docType = 'Academic Journal';
	let citationStyle = 'APA 7th';
	let language = 'English';

	// ---- Details (optional) -- labels stay in English (advanced/optional
	// fields); group titles are translated via $t.newProject.detailGroups ----
	let details = {
		novelty: '', method_detail: '', training_configuration: '', research_goal: '', research_object: '', contribution_detail: '',
		existing_condition: '', challenge: '', main_problem: '', problem_impact: '', prior_solution: '', prior_strength: '', prior_limitation: '', proposed_solution_detail: '', improved_aspect: '',
		research_result: '', result_improvement: '', previous_method: '', conclusion: '',
		application_domain: '', surprising_statistic: '', study_field: '', application_context: '', specific_aspect: '',
		research_type: '', evaluated_variable: '', data_collection_method: '', instrument: '', dataset_summary: '', preprocessing_summary: '', system_goal: '',
		metric_name: '', evaluation_metrics: '', evaluated_aspect: '', primary_result_aspect: '', result_percentage: '', result_trend: '', metric_result: '',
		statistical_result: '', statistical_variable_1: '', statistical_variable_2: '', p_value: '', significance_level: '', discussion_improvement: '', hypothesis: '',
		practical_application: '', limitation_detail: '', future_work: '',
		impact_domain: '', impact_technology: '', practical_impact: '', impact_service_availability: '', impact_problem_evidence: '', impact_limitation: '', impact_result: '', accessibility_impact: '', target_users: ''
	};

	const DETAIL_KEY_MAP = {
		method_detail: 'method',
		contribution_detail: 'contribution',
		proposed_solution_detail: 'proposed_solution',
		limitation_detail: 'limitation'
	};

	const DETAIL_GROUPS = [
		{
			titleKey: 'novelty',
			fields: [
				{ key: 'novelty', label: 'Novelty', placeholder: 'e.g. Comparison of Lightweight and Residual Architectures' },
				{ key: 'method_detail', label: 'Method (detailed)', placeholder: 'e.g. MobileNetV2 and ResNet50' },
				{ key: 'training_configuration', label: 'Training configuration', placeholder: 'e.g. Adam optimizer, learning rate 0.0001, batch size 32, 20 epochs' },
				{ key: 'research_goal', label: 'Research goal', placeholder: 'e.g. classify rice leaf diseases' },
				{ key: 'research_object', label: 'Research object', placeholder: 'e.g. synthetic images' },
				{ key: 'contribution_detail', label: 'Contribution (detailed)', placeholder: 'e.g. accuracy and efficiency' }
			]
		},
		{
			titleKey: 'problem',
			fields: [
				{ key: 'existing_condition', label: 'Existing condition', placeholder: 'e.g. disease identification still relies on visual observation' },
				{ key: 'challenge', label: 'Challenge', placeholder: 'e.g. leaf color variation, symptom similarity, lighting changes' },
				{ key: 'main_problem', label: 'Main problem', placeholder: 'e.g. classification instability under visual variation' },
				{ key: 'problem_impact', label: 'Problem impact', placeholder: 'e.g. delayed identification and mistargeted treatment' },
				{ key: 'prior_solution', label: 'Prior solution', placeholder: 'e.g. simple 3-layer CNN as synthetic baseline' },
				{ key: 'prior_strength', label: 'Prior solution strength', placeholder: 'e.g. can learn basic visual patterns with a simple procedure' },
				{ key: 'prior_limitation', label: 'Prior solution limitation', placeholder: 'e.g. prediction quality and efficiency not evaluated uniformly' },
				{ key: 'proposed_solution_detail', label: 'Proposed solution (detailed)', placeholder: 'e.g. comparative classification pipeline' },
				{ key: 'improved_aspect', label: 'Improved aspect', placeholder: 'e.g. classification accuracy and computational efficiency' }
			]
		},
		{
			titleKey: 'results',
			fields: [
				{ key: 'research_result', label: 'Research result', placeholder: 'e.g. ResNet50 reached 94.2%, MobileNetV2 92.5% accuracy' },
				{ key: 'result_improvement', label: 'Result improvement', placeholder: 'e.g. 16.2 points for ResNet50, 14.5 points for MobileNetV2' },
				{ key: 'previous_method', label: 'Previous method', placeholder: 'e.g. baseline 3-layer CNN with 78.0% accuracy' },
				{ key: 'conclusion', label: 'Conclusion', placeholder: 'e.g. ResNet50 gives the highest accuracy, MobileNetV2 is smaller and faster' }
			]
		},
		{
			titleKey: 'application',
			fields: [
				{ key: 'application_domain', label: 'Application domain', placeholder: 'e.g. mobile-based plant disease identification support system' },
				{ key: 'surprising_statistic', label: 'Surprising statistic', placeholder: 'e.g. 18% of images showed symptoms in an annual monitoring simulation' },
				{ key: 'study_field', label: 'Study field', placeholder: 'e.g. deep learning-based agricultural image classification' },
				{ key: 'application_context', label: 'Application context', placeholder: 'e.g. identifying four leaf conditions from digital images' },
				{ key: 'specific_aspect', label: 'Specific aspect', placeholder: 'e.g. symptom identification consistency and processing speed' }
			]
		},
		{
			titleKey: 'design',
			fields: [
				{ key: 'research_type', label: 'Research type', placeholder: 'e.g. controlled comparative experiment using synthetic data' },
				{ key: 'evaluated_variable', label: 'Evaluated variable', placeholder: 'e.g. classification performance, model size, inference time' },
				{ key: 'data_collection_method', label: 'Data collection method', placeholder: 'e.g. synthetic dataset construction with 4 balanced labels' },
				{ key: 'instrument', label: 'Instrument', placeholder: 'e.g. Google Colab with T4 GPU and TensorFlow' },
				{ key: 'dataset_summary', label: 'Dataset summary', placeholder: 'e.g. 2,400 images, 4 classes, 70/15/15 split' },
				{ key: 'preprocessing_summary', label: 'Preprocessing summary', placeholder: 'e.g. resize to 224x224, normalization, rotation, flip, zoom' },
				{ key: 'system_goal', label: 'System goal', placeholder: 'e.g. balance between accuracy and computational efficiency' }
			]
		},
		{
			titleKey: 'metrics',
			fields: [
				{ key: 'metric_name', label: 'Metric name', placeholder: 'e.g. accuracy' },
				{ key: 'evaluation_metrics', label: 'Evaluation metrics', placeholder: 'e.g. accuracy, macro precision/recall/F1, confusion matrix' },
				{ key: 'evaluated_aspect', label: 'Evaluated aspect', placeholder: 'e.g. prediction quality across 4 classes and computational cost' },
				{ key: 'primary_result_aspect', label: 'Primary result aspect', placeholder: 'e.g. classification accuracy' },
				{ key: 'result_percentage', label: 'Result percentage', placeholder: 'e.g. 94.2% ResNet50, 92.5% MobileNetV2' },
				{ key: 'result_trend', label: 'Result trend', placeholder: 'e.g. stable validation loss decline until epoch 16' },
				{ key: 'metric_result', label: 'Metric result', placeholder: 'e.g. accuracy 94.2%, precision 94.3%, recall 94.2%, F1 94.1%' }
			]
		},
		{
			titleKey: 'statistics',
			fields: [
				{ key: 'statistical_result', label: 'Statistical result', placeholder: 'e.g. difference confirmed significant by paired t-test' },
				{ key: 'statistical_variable_1', label: 'Statistical variable 1', placeholder: 'e.g. MobileNetV2 accuracy' },
				{ key: 'statistical_variable_2', label: 'Statistical variable 2', placeholder: 'e.g. ResNet50 accuracy' },
				{ key: 'p_value', label: 'p-value', placeholder: 'e.g. 0.018' },
				{ key: 'significance_level', label: 'Significance level', placeholder: 'e.g. 0.05' },
				{ key: 'discussion_improvement', label: 'Discussion improvement', placeholder: 'e.g. 16.2%' },
				{ key: 'hypothesis', label: 'Hypothesis', placeholder: 'e.g. transfer learning and fine-tuning improve performance over baseline' }
			]
		},
		{
			titleKey: 'practical',
			fields: [
				{ key: 'practical_application', label: 'Practical application', placeholder: 'e.g. early screening of leaf images before expert review' },
				{ key: 'limitation_detail', label: 'Limitation (detailed)', placeholder: 'e.g. balanced synthetic dataset, single inference environment' },
				{ key: 'future_work', label: 'Future work', placeholder: 'e.g. field validation across locations, devices, imbalanced classes' }
			]
		},
		{
			titleKey: 'impact',
			fields: [
				{ key: 'impact_domain', label: 'Impact domain', placeholder: 'e.g. decision support system for rice plant monitoring' },
				{ key: 'impact_technology', label: 'Impact technology', placeholder: 'e.g. deep learning-based image classification system' },
				{ key: 'practical_impact', label: 'Practical impact', placeholder: 'e.g. reduces initial screening burden on experts' },
				{ key: 'impact_service_availability', label: 'Impact service availability', placeholder: 'e.g. offers continuous image processing support' },
				{ key: 'impact_problem_evidence', label: 'Impact problem evidence', placeholder: 'e.g. baseline CNN simulation showed 78.0% accuracy' },
				{ key: 'impact_limitation', label: 'Impact limitation', placeholder: 'e.g. low classification accuracy and lengthy initial screening' },
				{ key: 'impact_result', label: 'Impact result', placeholder: 'e.g. accuracy improved from 78.0% to 94.2% with ResNet50' },
				{ key: 'accessibility_impact', label: 'Accessibility impact', placeholder: 'e.g. mobile-based alternative for limited expert access' },
				{ key: 'target_users', label: 'Target users', placeholder: 'e.g. agricultural researchers, app developers, monitoring officers' }
			]
		}
	];

	// ---- Sources (optional) ----
	let manualTitle = '';
	let manualAuthors = '';
	let manualYear = '';
	let manualVenue = '';
	let manualLink = '';
	let addedSources = [];

	function buildTemplateValues() {
		const result = {};
		for (const [key, value] of Object.entries(details)) {
			if (!value.trim()) continue;
			const outputKey = DETAIL_KEY_MAP[key] || key;
			result[outputKey] = value.trim();
		}
		return Object.keys(result).length ? result : null;
	}

	async function handleCreate() {
		if (!contextComplete || !$user) return;
		creating = true;
		try {
			const topic = `${ctx.domain} -- ${ctx.problem}`;
			const projectId = await createProject($user.uid, {
				topic,
				docType,
				citationStyle,
				language,
				researchContext: ctx,
				templateValues: buildTemplateValues()
			});

			for (const s of addedSources) {
				await addSource(projectId, s);
			}

			goto(`/project/${projectId}`);
		} catch (e) {
			alert($t.newProject.createFailed + e.message);
			creating = false;
		}
	}

	function addManualSource() {
		if (!manualTitle.trim()) return;
		addedSources = [
			...addedSources,
			{
				title: manualTitle,
				authors: manualAuthors || '—',
				year: manualYear || '—',
				venue: manualVenue || '—',
				externalUrl: manualLink || null
			}
		];
		manualTitle = manualAuthors = manualYear = manualVenue = manualLink = '';
	}
</script>

<Topbar title={$t.newProject.title} breadcrumb={[$t.common.dashboard, $t.newProject.breadcrumb]} />

<main class="mx-auto max-w-4xl px-6 py-8">
	<BackButton fallback="/" />

	<!-- ============ Research Context (required) ============ -->
	<div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
		<p class="mb-1 text-theme-lg font-semibold text-gray-800 dark:text-white/90">{$t.newProject.researchContextTitle}</p>
		<p class="mb-5 text-theme-sm text-gray-400">{$t.newProject.researchContextDesc}</p>

		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
			{#each CONTEXT_FIELD_KEYS as f}
				<div class="form-groups {f.wide ? 'sm:col-span-2' : ''}">
					<label class="form-label" for={f.key}>{$t.newProject.contextFields[f.key]}</label>
					<textarea id={f.key} rows="2" class="text-input h-auto resize-none py-2.5" placeholder={f.placeholder} bind:value={ctx[f.key]}></textarea>
				</div>
			{/each}
		</div>

		<div class="mt-6 grid grid-cols-1 gap-5 border-t border-gray-100 pt-6 dark:border-gray-800 sm:grid-cols-3">
			<div class="form-groups">
				<label class="form-label" for="docType">{$t.newProject.docType}</label>
				<select id="docType" class="select-input" bind:value={docType}>
					<option>Academic Journal</option>
					<option>Thesis / Dissertation</option>
					<option>Literature Review</option>
					<option>Research Report</option>
					<option>IEEE Transactions Journal</option>
				</select>
			</div>
			<div class="form-groups">
				<label class="form-label" for="style">{$t.newProject.citationStyle}</label>
				<select id="style" class="select-input" bind:value={citationStyle}>
					<option>APA 7th</option>
					<option>MLA 9th</option>
					<option>IEEE</option>
					<option>Chicago</option>
					<option>Harvard</option>
				</select>
			</div>
			<div class="form-groups">
				<label class="form-label" for="lang">{$t.newProject.writingLanguage}</label>
				<select id="lang" class="select-input" bind:value={language}>
					<option>English</option>
					<option>Indonesian</option>
				</select>
			</div>
		</div>
		<p class="mt-3 text-theme-xs text-gray-400">{$t.newProject.writingLanguageHint}</p>
	</div>

	<!-- ============ Details (optional) ============ -->
	<div class="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
		<p class="mb-1 text-theme-lg font-semibold text-gray-800 dark:text-white/90">{$t.newProject.detailsTitle} <span class="font-normal text-gray-400">({$t.common.optional})</span></p>
		<p class="mb-5 text-theme-sm text-gray-400">{$t.newProject.detailsDesc}</p>

		<div class="space-y-2">
			{#each DETAIL_GROUPS as group}
				<details class="group rounded-lg border border-gray-200 dark:border-gray-800">
					<summary class="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
						{$t.newProject.detailGroups[group.titleKey]}
						<svg class="text-gray-400 transition-transform group-open:rotate-180" width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</summary>
					<div class="grid grid-cols-1 gap-4 border-t border-gray-100 p-4 dark:border-gray-800 sm:grid-cols-2">
						{#each group.fields as f}
							<div class="form-groups">
								<label class="form-label" for={f.key}>{f.label}</label>
								<input id={f.key} class="text-input" placeholder={f.placeholder} bind:value={details[f.key]} />
							</div>
						{/each}
					</div>
				</details>
			{/each}
		</div>
	</div>

	<!-- ============ Sources (optional) ============ -->
	<div class="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
		<p class="mb-1 text-theme-lg font-semibold text-gray-800 dark:text-white/90">{$t.newProject.sourcesTitle} <span class="font-normal text-gray-400">({$t.common.optional})</span></p>
		<p class="mb-5 text-theme-sm text-gray-400">{$t.newProject.sourcesDesc}</p>

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<input class="text-input" placeholder={$t.newProject.sourceTitlePlaceholder} bind:value={manualTitle} />
			<input class="text-input" placeholder={$t.newProject.authorsPlaceholder} bind:value={manualAuthors} />
			<input class="text-input" placeholder={$t.newProject.yearPlaceholder} bind:value={manualYear} />
			<input class="text-input" placeholder={$t.newProject.venuePlaceholder} bind:value={manualVenue} />
			<input class="text-input sm:col-span-2" placeholder={$t.newProject.linkPlaceholder} bind:value={manualLink} />
		</div>
		<button class="btn-primary-outline-sm mt-3 w-full justify-center" on:click={addManualSource} disabled={!manualTitle.trim()}>
			{$t.newProject.addSource}
		</button>

		{#if addedSources.length > 0}
			<ul class="mt-4 space-y-1 border-t border-gray-100 pt-3 dark:border-gray-800">
				{#each addedSources as s}
					<li class="truncate text-theme-sm text-gray-600 dark:text-gray-400">{s.title}</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="mt-6 flex justify-end">
		<button class="btn-primary-md" disabled={!contextComplete || creating} on:click={handleCreate}>
			{creating ? $t.newProject.creating : $t.newProject.createPaper}
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
		</button>
	</div>
</main>
