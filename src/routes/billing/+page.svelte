<script>
	import { onDestroy } from 'svelte';
	import Topbar from '$lib/components/Topbar.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { user } from '$lib/stores/auth.js';
	import { locale } from '$lib/stores/locale.js';
	import { t } from '$lib/i18n';
	import { listenSubscription } from '$lib/services/subscriptions.js';

	let subscription = null;
	let unsubscribe = () => {};

	$: if ($user) {
		unsubscribe();
		unsubscribe = listenSubscription($user.uid, (data) => (subscription = data));
	}

	onDestroy(() => unsubscribe());

	$: isActive = subscription?.status === 'active';

	function formatDate(ts) {
		if (!ts?.toDate) return '—';
		return ts.toDate().toLocaleDateString($locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<Topbar title={$t.billing.title} breadcrumb={[$t.common.dashboard, $t.billing.breadcrumb]} />

<main class="mx-auto max-w-2xl px-6 py-8">
	<BackButton fallback="/" />

	<div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
		<div class="mb-5 flex items-center justify-between">
			<h2 class="text-theme-lg font-semibold text-gray-800 dark:text-white/90">{$t.billing.currentSubscription}</h2>
			<span
				class="rounded-full px-2.5 py-0.5 text-theme-xs font-medium {isActive
					? 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400'
					: 'bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-gray-400'}"
			>
				{subscription?.status ?? 'inactive'}
			</span>
		</div>

		{#if !subscription || subscription.status !== 'active'}
			<p class="text-theme-sm text-gray-500 dark:text-gray-400">{$t.billing.freePlanNotice}</p>
			<a href="/pricing" class="btn-primary-md mt-5 w-fit">{$t.billing.viewPlans}</a>
		{:else}
			<dl class="space-y-3 text-theme-sm">
				<div class="flex justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
					<dt class="text-gray-400">{$t.billing.plan}</dt>
					<dd class="font-medium text-gray-800 dark:text-white/90">{subscription.planName ?? subscription.planId}</dd>
				</div>
				<div class="flex justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
					<dt class="text-gray-400">{$t.billing.renewsOn}</dt>
					<dd class="font-medium text-gray-800 dark:text-white/90">{formatDate(subscription.currentPeriodEnd)}</dd>
				</div>
				<div class="flex justify-between pb-1">
					<dt class="text-gray-400">{$t.billing.lastOrderId}</dt>
					<dd class="font-mono text-theme-xs text-gray-500 dark:text-gray-400">{subscription.midtransOrderId ?? '—'}</dd>
				</div>
			</dl>

			<div class="mt-6 flex gap-3">
				<a href="/pricing" class="btn-secondary-outline-md">{$t.billing.changePlan}</a>
			</div>

			<p class="mt-4 text-theme-xs text-gray-400">{$t.billing.cancelHint}</p>
		{/if}
	</div>
</main>
