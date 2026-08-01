<script>
	export let title = 'Dashboard';
	export let breadcrumb = [];
</script>

<header class="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
	<div>
		<h1 class="text-theme-xl font-semibold text-gray-800 dark:text-white/90">{title}</h1>
		{#if breadcrumb.length}
			<div class="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
				{#each breadcrumb as crumb, i}
					{#if crumb === 'Dashboard'}
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
	<slot name="actions" />
</header>