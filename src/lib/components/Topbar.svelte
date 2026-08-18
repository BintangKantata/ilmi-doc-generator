<script>
	import { locale } from '$lib/stores/locale.js';
	import { t } from '$lib/i18n';

	export let title = 'Dashboard';
	export let breadcrumb = [];

	let switcherOpen = false;

	function selectLocale(value) {
		locale.set(value);
		switcherOpen = false;
	}

	function handleClickOutside(e) {
		if (!e.target.closest('[data-lang-switcher]')) switcherOpen = false;
	}
</script>

<svelte:window on:click={handleClickOutside} />

<header class="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
	<div>
		<h1 class="text-theme-xl font-semibold text-gray-800 dark:text-white/90">{title}</h1>
		{#if breadcrumb.length}
			<div class="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
				{#each breadcrumb as crumb, i}
					{#if crumb === $t.common.dashboard}
						<a href="/" class="hover:text-brand-500 hover:underline" class:text-gray-800={i === breadcrumb.length - 1} class:dark:text-white={i === breadcrumb.length - 1}>{crumb}</a>
					{:else}
						<span class:text-gray-800={i === breadcrumb.length - 1} class:dark:text-white={i === breadcrumb.length - 1}>{crumb}</span>
					{/if}
					{#if i < breadcrumb.length - 1}
						<span>/</span>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex items-center gap-3">
		<div class="relative" data-lang-switcher>
			<button
				type="button"
				class="btn-secondary-icon-sm !h-9 !w-auto gap-1.5 px-3 text-theme-sm font-medium"
				on:click|stopPropagation={() => (switcherOpen = !switcherOpen)}
				title={$t.languageSwitcher.label}
			>
				<svg width="15" height="15" viewBox="0 0 15 15" fill="none">
					<circle cx="7.5" cy="7.5" r="6" stroke="currentColor" stroke-width="1.3" />
					<path d="M1.5 7.5h12M7.5 1.5c1.8 1.7 1.8 10.3 0 12M7.5 1.5c-1.8 1.7-1.8 10.3 0 12" stroke="currentColor" stroke-width="1.3" />
				</svg>
				{$locale.toUpperCase()}
			</button>

			{#if switcherOpen}
				<div class="dropdown min-w-40 !p-1.5">
					<button
						type="button"
						class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-theme-sm hover:bg-gray-50 dark:hover:bg-white/[0.03] {$locale === 'en' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}"
						on:click={() => selectLocale('en')}
					>
						{$t.languageSwitcher.en}
						{#if $locale === 'en'}
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
						{/if}
					</button>
					<button
						type="button"
						class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-theme-sm hover:bg-gray-50 dark:hover:bg-white/[0.03] {$locale === 'id' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}"
						on:click={() => selectLocale('id')}
					>
						{$t.languageSwitcher.id}
						{#if $locale === 'id'}
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
						{/if}
					</button>
				</div>
			{/if}
		</div>

		<slot name="actions" />
	</div>
</header>
