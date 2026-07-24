<script>
	import { goto } from '$app/navigation';
	import Topbar from '$lib/components/Topbar.svelte';
	import { user } from '$lib/stores/auth.js';
	import { createProject } from '$lib/services/projects.js';
	import { addSource } from '$lib/services/sources.js';

	let step = 1;
	let creating = false;

	// Step 1
	let topic = '';
	let docType = 'Scientific Journal';
	let citationStyle = 'APA 7th';
	let language = 'English';
	let projectId = null;

	// Step 2 — tambah sumber manual (metadata saja, tanpa file fisik,
	// supaya tetap di Firebase plan gratis / Spark tanpa Storage).
	// Pencarian literatur otomatis akan disambungkan nanti bersamaan
	// dengan integrasi LLM.
	let manualTitle = '';
	let manualAuthors = '';
	let manualYear = '';
	let manualVenue = '';
	let manualLink = '';
	let addedSources = [];

	async function goToStep2() {
		if (!topic.trim() || !$user) return;
		creating = true;
		try {
			projectId = await createProject($user.uid, { topic, docType, citationStyle, language });
			step = 2;
		} catch (e) {
			alert('Failed to create project: ' + e.message);
		} finally {
			creating = false;
		}
	}

	async function addManualSource() {
		if (!manualTitle.trim() || !projectId) return;
		await addSource(projectId, {
			title: manualTitle,
			authors: manualAuthors || '—',
			year: manualYear || '—',
			venue: manualVenue || '—',
			externalUrl: manualLink || null
		});
		addedSources = [...addedSources, { title: manualTitle }];
		manualTitle = manualAuthors = manualYear = manualVenue = manualLink = '';
	}

	function finish() {
		goto(`/project/${projectId}`);
	}
</script>

<Topbar title="Create New Paper" breadcrumb={['Dashboard', 'New Paper']} />

<main class="mx-auto max-w-4xl px-6 py-8">
	<div class="mb-8 flex items-center gap-4">
		{#each [{ n: 1, label: 'Topic & Settings' }, { n: 2, label: 'Add Sources' }] as s}
			<div class="flex items-center gap-2">
				<span
					class="flex h-7 w-7 items-center justify-center rounded-full text-theme-xs font-semibold {step === s.n
						? 'bg-brand-500 text-white'
						: step > s.n
							? 'bg-success-500 text-white'
							: 'bg-gray-100 text-gray-400 dark:bg-white/[0.05]'}"
				>
					{step > s.n ? '✓' : s.n}
				</span>
				<span class="text-sm font-medium {step === s.n ? 'text-gray-800 dark:text-white/90' : 'text-gray-400'}">{s.label}</span>
			</div>
			{#if s.n < 2}
				<div class="h-px w-10 bg-gray-200 dark:bg-gray-800"></div>
			{/if}
		{/each}
	</div>

	{#if step === 1}
		<div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
			<div class="form-groups mb-5">
				<label class="form-label" for="topic">Topic or reasearch questions</label>
				<textarea id="topic" rows="3" class="text-input h-auto resize-none py-3" placeholder="Example: How does RAG affect citation accuracy in AI-assisted scientific writing?" bind:value={topic}></textarea>
			</div>

			<div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
				<div class="form-groups">
					<label class="form-label" for="docType">Document type</label>
					<select id="docType" class="select-input" bind:value={docType}>
						<option>Scientific Journal</option>
						<option>Thesis</option>
						<option>Literature Review</option>
						<option>Research Report</option>
					</select>
				</div>
				<div class="form-groups">
					<label class="form-label" for="style">Citation style</label>
					<select id="style" class="select-input" bind:value={citationStyle}>
						<option>APA 7th</option>
						<option>MLA 9th</option>
						<option>IEEE</option>
						<option>Chicago</option>
						<option>Harvard</option>
					</select>
				</div>
				<div class="form-groups">
					<label class="form-label" for="lang">Writing Language</label>
					<select id="lang" class="select-input" bind:value={language}>
						<option>Bahasa Indonesia</option>
						<option>English</option>
					</select>
				</div>
			</div>

			<div class="mt-6 flex justify-end">
				<button class="btn-primary-md" disabled={!topic.trim() || creating} on:click={goToStep2}>
					{creating ? 'Saving...' : 'Continue to Sources'}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
				</button>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
				<p class="form-label mb-3">Add sources manually</p>
				<div class="space-y-3">
					<input class="text-input" placeholder="Source title" bind:value={manualTitle} />
					<input class="text-input" placeholder="Author" bind:value={manualAuthors} />
					<div class="flex gap-3">
						<input class="text-input" placeholder="Year" bind:value={manualYear} />
						<input class="text-input" placeholder="Venue/Journal" bind:value={manualVenue} />
					</div>
					<input class="text-input" placeholder="Source link (optional)" bind:value={manualLink} />
					<button class="btn-primary-outline-sm w-full justify-center" on:click={addManualSource} disabled={!manualTitle.trim()}>
						Add Sources
					</button>
				</div>
				<p class="mt-3 text-theme-xs text-gray-400">
					Belum ada LLM, jadi sementara manual dulu.
				</p>
			</div>

			<div class="rounded-xl border border-dashed border-gray-300 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
				<svg class="mx-auto mb-2 text-gray-400" width="28" height="28" viewBox="0 0 24 24" fill="none">
					<path d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				<p class="text-center text-sm font-medium text-gray-700 dark:text-gray-300">Upload file PDF belum ada</p>
				<p class="mt-2 text-theme-xs text-gray-400">
				</p>
			</div>
		</div>

		<div class="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
			<p class="form-label mb-3">Saved sources ({addedSources.length})</p>
			{#if addedSources.length === 0}
				<p class="text-theme-sm text-gray-400">No source saved yet, you can skip this and add source in editor page.</p>
			{:else}
				<ul class="space-y-1">
					{#each addedSources as s}
						<li class="truncate text-theme-sm text-gray-600 dark:text-gray-400">{s.title}</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="mt-6 flex justify-between">
			<button class="btn-secondary-outline-md" on:click={() => (step = 1)}>Back</button>
			<button class="btn-primary-md" on:click={finish}>
				Open Editor
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
			</button>
		</div>
	{/if}
</main>
