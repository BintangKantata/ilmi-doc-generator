<script>
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import Topbar from '$lib/components/Topbar.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { t } from '$lib/i18n';
	import { getProject } from '$lib/services/projects.js';
	import { listenSections, saveSectionContent, addSection } from '$lib/services/sections.js';
	import { listenSources, deleteSource } from '$lib/services/sources.js';
	import { generateFullPaper, expandText, condenseText } from '$lib/services/llm.js';

	const projectId = $page.params.id;

	let project = null;
	let sections = [];
	let library = [];
	let activeId = null;
	let editorContent = '';
	let saveStatus = ''; // '' | 'saving' | 'saved'
	let showExport = false;
	let saveTimer;

	let generatingPaper = false;
	let autoTriggerAttempted = false;
	let sectionAction = null; // null | 'expand' | 'condense'
	let aiError = '';

	let unsubSections = () => {};
	let unsubSources = () => {};

	getProject(projectId).then((p) => {
		project = p;
		maybeAutoGenerate();
	});

	unsubSections = listenSections(projectId, (data) => {
		sections = data;
		if (!activeId && data.length) activeId = data[0].id;
		const active = data.find((s) => s.id === activeId);
		if (active && document.activeElement?.id !== 'editor') {
			editorContent = active.content ?? '';
		}
	});

	unsubSources = listenSources(projectId, (data) => (library = data));

	onDestroy(() => {
		unsubSections();
		unsubSources();
	});

	$: active = sections.find((s) => s.id === activeId);
	$: hasAnyDraft = sections.some((s) => s.status === 'draft');

	function maybeAutoGenerate() {
		if (autoTriggerAttempted || !project) return;
		if (project.paperGenerated) return;
		if (!project.researchContext) return;
		autoTriggerAttempted = true;
		handleGenerateFullPaper({ silent: true });
	}

	function selectSection(id) {
		activeId = id;
		const s = sections.find((x) => x.id === id);
		editorContent = s?.content ?? '';
		aiError = '';
	}

	function handleInput() {
		saveStatus = 'saving';
		clearTimeout(saveTimer);
		saveTimer = setTimeout(async () => {
			await saveSectionContent(projectId, activeId, editorContent);
			saveStatus = 'saved';
			setTimeout(() => (saveStatus = ''), 1500);
		}, 800);
	}

	async function handleAddSection() {
		const label = prompt($t.workspace.addSectionPrompt);
		if (!label) return;
		await addSection(projectId, label, sections.length);
	}

	function statusColor(status) {
		if (status === 'draft') return 'bg-brand-50 text-brand-600 dark:bg-brand-500/[0.12] dark:text-brand-400';
		return 'bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-gray-400';
	}

	async function persistAndSet(newContent) {
		editorContent = newContent;
		saveStatus = 'saving';
		await saveSectionContent(projectId, activeId, editorContent);
		saveStatus = 'saved';
		setTimeout(() => (saveStatus = ''), 1500);
	}

	async function handleGenerateFullPaper(options = {}) {
		if (!project) return;
		if (!project.researchContext) {
			aiError = $t.workspace.errors.noContext;
			return;
		}
		if (!options.silent && hasAnyDraft) {
			const confirmed = confirm($t.workspace.overwriteConfirm);
			if (!confirmed) return;
		}
		aiError = '';
		generatingPaper = true;
		try {
			await generateFullPaper(projectId);
			project = { ...project, paperGenerated: true };
			const refreshed = sections.find((s) => s.id === activeId);
			if (refreshed) editorContent = refreshed.content ?? editorContent;
		} catch (e) {
			aiError = e.message || $t.workspace.errors.generateFailed;
		} finally {
			generatingPaper = false;
		}
	}

	async function handleExpand() {
		if (!editorContent.trim()) {
			aiError = $t.workspace.errors.noExpandContent;
			return;
		}
		aiError = '';
		sectionAction = 'expand';
		try {
			const result = await expandText(editorContent, library);
			await persistAndSet(result.content);
		} catch (e) {
			aiError = e.message || $t.workspace.errors.expandFailed;
		} finally {
			sectionAction = null;
		}
	}

	async function handleCondense() {
		if (!editorContent.trim()) {
			aiError = $t.workspace.errors.noCondenseContent;
			return;
		}
		aiError = '';
		sectionAction = 'condense';
		try {
			const result = await condenseText(editorContent);
			await persistAndSet(result.content);
		} catch (e) {
			aiError = e.message || $t.workspace.errors.condenseFailed;
		} finally {
			sectionAction = null;
		}
	}
</script>

<Topbar title={project?.title ?? $t.workspace.loadingProject} breadcrumb={[$t.common.dashboard, $t.workspace.breadcrumb]}>
	<svelte:fragment slot="actions">
		<div class="flex items-center gap-2">
			<button class="btn-secondary-outline-md" disabled={generatingPaper} on:click={() => handleGenerateFullPaper()}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.6 4L14 6.6 10 8.2 8.4 12 6.8 8.2 3 6.6 6.8 5 8 1z" fill="currentColor" /></svg>
				{generatingPaper ? $t.workspace.generating : hasAnyDraft ? $t.workspace.regeneratePaper : $t.workspace.generateFullPaper}
			</button>
			<button class="btn-secondary-outline-md" on:click={() => (showExport = true)}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M4.5 6.5L8 10l3.5-3.5M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
				{$t.workspace.export}
			</button>
		</div>
	</svelte:fragment>
</Topbar>

{#if generatingPaper}
	<div class="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
		<svg class="animate-spin text-brand-500" width="32" height="32" viewBox="0 0 32 32" fill="none">
			<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="20" stroke-linecap="round" />
		</svg>
		<p class="text-theme-sm font-medium text-gray-700 dark:text-gray-300">{$t.workspace.generatingPaperTitle}</p>
		<p class="max-w-sm text-theme-xs text-gray-400">{$t.workspace.generatingPaperHint}</p>
	</div>
{:else}
	<div class="mx-auto max-w-[1400px] px-6 pt-4">
		<BackButton fallback="/" />
		{#if aiError}
			<div class="mb-2 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-theme-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/[0.08] dark:text-error-400">
				{aiError}
			</div>
		{/if}
	</div>

	<div class="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[240px_1fr_320px]">
		<aside class="border-r border-gray-200 px-4 py-6 dark:border-gray-800 lg:h-[calc(100vh-73px)] lg:overflow-auto">
			<p class="mb-3 px-2 text-theme-xs font-semibold uppercase tracking-wide text-gray-400">{$t.workspace.paperStructure}</p>
			<nav class="space-y-1">
				{#each sections as s}
					<button type="button" class="menu-item w-full {activeId === s.id ? 'menu-item-active' : 'menu-item-inactive'}" on:click={() => selectSection(s.id)}>
						<span class="flex-1 text-left">{s.label}</span>
						<span class="rounded-full px-2 py-0.5 text-theme-xs font-medium {statusColor(s.status)}">
							{s.status === 'draft' ? s.wordCount ?? 0 : '—'}
						</span>
					</button>
				{/each}
			</nav>

			<button class="btn-secondary-outline-md mt-4 w-full justify-center text-theme-sm" on:click={handleAddSection}>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
				{$t.workspace.addSection}
			</button>
		</aside>

		<main class="flex flex-col px-6 py-6">
			{#if active}
				<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
					<h2 class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{active.label}</h2>
					<div class="flex items-center gap-3">
						<span class="text-theme-xs text-gray-400">
							{saveStatus === 'saving' ? $t.common.saving : saveStatus === 'saved' ? $t.common.saved : ''}
						</span>
						<div class="flex flex-wrap gap-2">
							<button class="btn-primary-outline-sm" disabled={sectionAction !== null} on:click={handleExpand}>
								{sectionAction === 'expand' ? $t.workspace.expanding : $t.workspace.expand}
							</button>
							<button class="btn-primary-outline-sm" disabled={sectionAction !== null} on:click={handleCondense}>
								{sectionAction === 'condense' ? $t.workspace.condensing : $t.workspace.condense}
							</button>
						</div>
					</div>
				</div>

				<div class="flex-1 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
					<textarea
						id="editor"
						class="h-full min-h-[420px] w-full resize-none border-0 bg-transparent text-sm leading-7 text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-300"
						placeholder={$t.workspace.editorPlaceholder}
						bind:value={editorContent}
						on:input={handleInput}
					></textarea>
				</div>

				<p class="mt-2 text-theme-xs text-gray-400">{$t.workspace.autosaveHint}</p>
			{:else}
				<p class="text-theme-sm text-gray-400">{$t.workspace.loadingSections}</p>
			{/if}
		</main>

		<aside class="border-l border-gray-200 px-4 py-6 dark:border-gray-800 lg:h-[calc(100vh-73px)] lg:overflow-auto">
			<p class="mb-3 px-2 text-theme-xs font-semibold uppercase tracking-wide text-gray-400">{$t.workspace.sourcesTitle} ({library.length})</p>
			{#if library.length === 0}
				<p class="text-theme-sm text-gray-400">{$t.workspace.noSources}</p>
			{:else}
				<ul class="space-y-2">
					{#each library as s}
						<li class="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
							<p class="text-theme-sm font-medium text-gray-800 dark:text-white/90">{s.title}</p>
							<p class="mt-0.5 text-theme-xs text-gray-400">{s.authors} · {s.year}</p>
							{#if s.fileUrl}
								<a href={s.fileUrl} target="_blank" rel="noreferrer" class="mt-2 inline-block text-theme-xs text-brand-500 hover:underline">{$t.workspace.viewFile}</a>
							{:else if s.externalUrl}
								<a href={s.externalUrl} target="_blank" rel="noreferrer" class="mt-2 inline-block text-theme-xs text-brand-500 hover:underline">{$t.workspace.openLink}</a>
							{/if}
							<button class="ml-3 mt-2 inline-block text-theme-xs text-error-500 hover:underline" on:click={() => deleteSource(projectId, s)}>{$t.common.delete}</button>
						</li>
					{/each}
				</ul>
			{/if}
		</aside>
	</div>
{/if}

{#if showExport}
	<div class="fixed inset-0 z-999 flex items-center justify-center bg-gray-900/50 px-4" on:click|self={() => (showExport = false)}>
		<div class="w-full max-w-md rounded-xl bg-white p-6 shadow-theme-lg dark:bg-gray-900">
			<h3 class="mb-1 text-theme-lg font-semibold text-gray-800 dark:text-white/90">{$t.workspace.exportTitle}</h3>
			<p class="mb-5 text-theme-sm text-gray-400">{$t.workspace.exportDesc}</p>
			<div class="flex justify-end">
				<button class="btn-secondary-outline-md" on:click={() => (showExport = false)}>{$t.common.close}</button>
			</div>
		</div>
	</div>
{/if}
