<script>
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';

	// Where to go if there's no browser history to go back to
	// (e.g. user landed directly on this page via a bookmark/refresh)
	export let fallback = '/';

	function handleBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
		} else {
			goto(fallback);
		}
	}
</script>

<button
	type="button"
	on:click={handleBack}
	class="mb-4 inline-flex items-center gap-1.5 text-theme-sm font-medium text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
>
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
	{$t.common.back}
</button>
