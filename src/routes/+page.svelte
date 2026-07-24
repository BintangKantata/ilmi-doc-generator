<script>
	import { onMount, onDestroy } from 'svelte';
	import Topbar from '$lib/components/Topbar.svelte';
	import { user } from '$lib/stores/auth.js';
	import { listenProjects } from '$lib/services/projects.js';

	let search = '';
	let projects = [];
	let loading = true;
	let unsubscribe = () => {};

	// Tunggu sampai user siap (dari layout), baru pasang listener Firestore
	$: if ($user) {
		unsubscribe();
		loading = true;
		unsubscribe = listenProjects($user.uid, (data) => {
			projects = data;
			loading = false;
		});
	}

	onDestroy(() => unsubscribe());

	$: filtered = projects.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()));

	function progressColor(v) {
		if (v >= 100) return 'bg-success-500';
		if (v >= 50) return 'bg-brand-500';
		return 'bg-orange-400';
	}

	function formatDate(ts) {
		if (!ts?.toDate) return '';
		return ts.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
	}
</script>

<Topbar title="My Paper" breadcrumb={['Dashboard']}>
	<svelte:fragment slot="actions">
		<a href="/new" class="btn-primary-md">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
			New Paper
		</a>
	</svelte:fragment>
</Topbar>

<main class="mx-auto max-w-6xl px-6 py-8">
	<div class="mb-6 w-full sm:max-w-xs">
		<div class="form-groups">
			<div class="relative">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 18 18" fill="none">
					<circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.5" />
					<path d="M16 16L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
				<input class="text-input pl-11" placeholder="Search paper..." bind:value={search} />
			</div>
		</div>
	</div>

	{#if loading}
		<p class="py-16 text-center text-theme-sm text-gray-400">Loading paper...</p>
	{:else if filtered.length === 0}
		<div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
			<p class="text-sm font-medium text-gray-700 dark:text-gray-300">No paper yet</p>
			<p class="mt-1 text-theme-sm text-gray-400">Click on "New Paper" to start.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each filtered as p}
				<a
					href={`/project/${p.id}`}
					class="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs transition-shadow hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
				>
					<div class="mb-3 flex items-center justify-between">
						<span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-theme-xs font-medium text-brand-600 dark:bg-brand-500/[0.12] dark:text-brand-400">{p.docType}</span>
						<span class="text-theme-xs text-gray-400">{formatDate(p.updatedAt)}</span>
					</div>
					<h3 class="mb-4 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-brand-600 dark:text-white/90">{p.title}</h3>

					<div class="mt-auto space-y-3">
						<div>
							<div class="mb-1 flex items-center justify-between text-theme-xs text-gray-500 dark:text-gray-400">
								<span>Draft progress</span>
								<span>{p.progress ?? 0}%</span>
							</div>
							<div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
								<div class="h-full rounded-full {progressColor(p.progress ?? 0)}" style="width: {p.progress ?? 0}%"></div>
							</div>
						</div>
						<div class="flex items-center justify-between text-theme-xs text-gray-500 dark:text-gray-400">
							<span>{p.citationStyle}</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</main>
