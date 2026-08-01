<script>
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import Topbar from '$lib/components/Topbar.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { getProject } from '$lib/services/projects.js';
	import { listenSections, saveSectionContent, addSection } from '$lib/services/sections.js';
	import { listenSources, deleteSource } from '$lib/services/sources.js';

	const projectId = $page.params.id;

	let project = null;
	let sections = [];
	let library = [];
	let activeId = null;
	let editorContent = '';
	let saveStatus = ''; // '' | 'saving' | 'saved'
	let showExport = false;
	let saveTimer;

	let unsubSections = () => {};
	let unsubSources = () => {};

	getProject(projectId).then((p) => (project = p));

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

	function selectSection(id) {
		activeId = id;
		const s = sections.find((x) => x.id === id);
		editorContent = s?.content ?? '';
	}

	// Autosave with an 800ms debounce so we don't write to Firestore on every keystroke
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
		const label = prompt('New section name:');
		if (!label) return;
		await addSection(projectId, label, sections.length);
	}

	function statusColor(status) {
		if (status === 'draft') return 'bg-brand-50 text-brand-600 dark:bg-brand-500/[0.12] dark:text-brand-400';
		return 'bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-gray-400';
	}
</script>

<Topbar title={project?.title ?? 'Loading...'} breadcrumb={['Dashboard', 'Editor']}>
	<svelte:fragment slot="actions">
		<button class="btn-secondary-outline-md" on:click={() => (showExport = true)}>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M4.5 6.5L8 10l3.5-3.5M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
			Export
		</button>
	</svelte:fragment>
</Topbar>

<div class="mx-auto max-w-[1400px] px-6 pt-4">
	<BackButton fallback="/" />
</div>

<div class="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[240px_1fr_320px]">
	<aside class="border-r border-gray-200 px-4 py-6 dark:border-gray-800 lg:h-[calc(100vh-73px)] lg:overflow-auto">
		<p class="mb-3 px-2 text-theme-xs font-semibold uppercase tracking-wide text-gray-400">Paper Structure</p>
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
			Add Section
		</button>
	</aside>

	<main class="flex flex-col px-6 py-6">
		{#if active}
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
				<h2 class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{active.label}</h2>
				<div class="flex items-center gap-3">
					<span class="text-theme-xs text-gray-400">
						{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : ''}
					</span>
					<div class="flex flex-wrap gap-2" title="Enabled once LLM integration is added">
						<button class="btn-primary-sm" disabled>
							<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1l1.4 3.6L12.5 6l-3.6 1.4L7.5 11l-1.4-3.6L2.5 6l3.6-1.4L7.5 1z" fill="currentColor" /></svg>
							Generate Draft (AI)
						</button>
						<button class="btn-primary-outline-sm" disabled>Expand</button>
						<button class="btn-primary-outline-sm" disabled>Condense</button>
					</div>
				</div>
			</div>

			<div class="flex-1 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
				<textarea
					id="editor"
					class="h-full min-h-[420px] w-full resize-none border-0 bg-transparent text-sm leading-7 text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-300"
					placeholder="Write this section's draft manually. The automatic Generate Draft feature will be enabled once the LLM is integrated."
					bind:value={editorContent}
					on:input={handleInput}
				></textarea>
			</div>

			<p class="mt-2 text-theme-xs text-gray-400">Changes are automatically saved to Firestore shortly after you stop typing.</p>
		{:else}
			<p class="text-theme-sm text-gray-400">Loading paper sections...</p>
		{/if}
	</main>

	<aside class="border-l border-gray-200 px-4 py-6 dark:border-gray-800 lg:h-[calc(100vh-73px)] lg:overflow-auto">
		<p class="mb-3 px-2 text-theme-xs font-semibold uppercase tracking-wide text-gray-400">Sources ({library.length})</p>
		{#if library.length === 0}
			<p class="text-theme-sm text-gray-400">No sources yet. Add some from the "New Paper" page, or extend this feature to add them directly here.</p>
		{:else}
			<ul class="space-y-2">
				{#each library as s}
					<li class="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
						<p class="text-theme-sm font-medium text-gray-800 dark:text-white/90">{s.title}</p>
						<p class="mt-0.5 text-theme-xs text-gray-400">{s.authors} · {s.year}</p>
						{#if s.fileUrl}
							<a href={s.fileUrl} target="_blank" rel="noreferrer" class="mt-2 inline-block text-theme-xs text-brand-500 hover:underline">View file</a>
						{:else if s.externalUrl}
							<a href={s.externalUrl} target="_blank" rel="noreferrer" class="mt-2 inline-block text-theme-xs text-brand-500 hover:underline">Open link</a>
						{/if}
						<button class="ml-3 mt-2 inline-block text-theme-xs text-error-500 hover:underline" on:click={() => deleteSource(projectId, s)}>Delete</button>
					</li>
				{/each}
			</ul>
		{/if}
	</aside>
</div>

{#if showExport}
	<div class="fixed inset-0 z-999 flex items-center justify-center bg-gray-900/50 px-4" on:click|self={() => (showExport = false)}>
		<div class="w-full max-w-md rounded-xl bg-white p-6 shadow-theme-lg dark:bg-gray-900">
			<h3 class="mb-1 text-theme-lg font-semibold text-gray-800 dark:text-white/90">Export Paper</h3>
			<p class="mb-5 text-theme-sm text-gray-400">Export functionality will be built once the section data structure is finalized.</p>
			<div class="flex justify-end">
				<button class="btn-secondary-outline-md" on:click={() => (showExport = false)}>Close</button>
			</div>
		</div>
	</div>
{/if}
