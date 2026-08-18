<script>
	import { locale } from '$lib/stores/locale.js';
	import { t } from '$lib/i18n';

	export let plan;
	export let isCurrent = false;
	export let loading = false;
	export let onSubscribe = () => {};

	function formatPrice(amount, currency) {
		if (!amount) return $t.pricing.free;
		return new Intl.NumberFormat($locale === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: currency || 'IDR', maximumFractionDigits: 0 }).format(amount);
	}
</script>

<div class="flex flex-col rounded-xl border p-6 {isCurrent ? 'border-brand-500 shadow-theme-md' : 'border-gray-200 dark:border-gray-800'} bg-white dark:bg-gray-900">
	{#if isCurrent}
		<span class="mb-3 inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-theme-xs font-medium text-brand-600 dark:bg-brand-500/[0.12] dark:text-brand-400">
			{$t.pricing.currentPlan}
		</span>
	{/if}

	<h3 class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{plan.name}</h3>
	<p class="mt-1 text-theme-sm text-gray-400">{plan.description}</p>

	<div class="mt-4">
		<span class="text-2xl font-bold text-gray-800 dark:text-white/90">{formatPrice(plan.price, plan.currency)}</span>
		{#if plan.price}
			<span class="text-theme-sm text-gray-400">{plan.interval === 'year' ? $t.pricing.perYear : $t.pricing.perMonth}</span>
		{/if}
	</div>

	<ul class="my-6 flex-1 space-y-2.5">
		{#each plan.features ?? [] as feature}
			<li class="flex items-start gap-2 text-theme-sm text-gray-600 dark:text-gray-400">
				<svg class="mt-0.5 flex-shrink-0 text-success-500" width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M13.5 4.5L6 12l-3.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				{feature}
			</li>
		{/each}
	</ul>

	{#if isCurrent}
		<button class="btn-secondary-outline-md w-full justify-center" disabled>{$t.pricing.active}</button>
	{:else if plan.price === 0}
		<button class="btn-secondary-outline-md w-full justify-center" disabled>{$t.pricing.defaultPlan}</button>
	{:else}
		<button class="btn-primary-md w-full justify-center" disabled={loading} on:click={() => onSubscribe(plan)}>
			{loading ? $t.pricing.processing : $t.pricing.subscribe}
		</button>
	{/if}
</div>
