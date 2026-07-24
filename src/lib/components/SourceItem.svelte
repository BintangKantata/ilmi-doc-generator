<script>
	export let source;
	export let selected = false;
	export let onToggle = () => {};
</script>

<button
	type="button"
	on:click={() => onToggle(source)}
	class="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors duration-150 {selected
		? 'border-brand-300 bg-brand-25 dark:border-brand-800 dark:bg-brand-500/[0.08]'
		: 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]'}"
>
	<span
		class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border {selected
			? 'border-brand-500 bg-brand-500'
			: 'border-gray-300 dark:border-gray-700'}"
	>
		{#if selected}
			<svg width="12" height="9" viewBox="0 0 12 9" fill="none">
				<path d="M1 4.5L4.2 7.5L11 1" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		{/if}
	</span>
	<span class="min-w-0 flex-1">
		<span class="block truncate text-sm font-medium text-gray-800 dark:text-white/90">{source.title}</span>
		<span class="mt-0.5 block truncate text-theme-xs text-gray-500 dark:text-gray-400">{source.authors} · {source.year}</span>
		<span class="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-theme-xs font-medium text-gray-600 dark:bg-white/[0.05] dark:text-gray-400">
			{source.venue}
		</span>
	</span>
</button>
