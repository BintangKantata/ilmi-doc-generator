<script>
	import { onDestroy } from 'svelte';
	import Topbar from '$lib/components/Topbar.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import PlanCard from '$lib/components/PlanCard.svelte';
	import { user } from '$lib/stores/auth.js';
	import { listenPlans, listenSubscription, startCheckout } from '$lib/services/subscriptions.js';

	let plans = [];
	let subscription = null;
	let loadingPlanId = null;
	let banner = null; // { type: 'success' | 'pending' | 'error', message: string }

	let unsubPlans = listenPlans((data) => (plans = data));
	let unsubSub = () => {};

	$: if ($user) {
		unsubSub();
		unsubSub = listenSubscription($user.uid, (data) => (subscription = data));
	}

	onDestroy(() => {
		unsubPlans();
		unsubSub();
	});

	async function handleSubscribe(plan) {
		banner = null;
		loadingPlanId = plan.id;
		try {
			await startCheckout(plan.id, {
				onSuccess: () => {
					banner = { type: 'success', message: 'Payment successful! Your plan will update shortly.' };
				},
				onPending: () => {
					banner = { type: 'pending', message: 'Payment is pending. Complete it to activate your plan.' };
				},
				onError: () => {
					banner = { type: 'error', message: 'Payment failed. Please try again.' };
				},
				onClose: () => {
					loadingPlanId = null;
				}
			});
		} catch (e) {
			banner = { type: 'error', message: e.message || 'Something went wrong starting checkout.' };
		} finally {
			loadingPlanId = null;
		}
	}
</script>

<Topbar title="Pricing" breadcrumb={['Dashboard', 'Pricing']} />

<main class="mx-auto max-w-5xl px-6 py-8">
	<BackButton fallback="/" />

	<div class="mb-8 text-center">
		<h2 class="text-theme-xl font-semibold text-gray-800 dark:text-white/90">Choose your plan</h2>
		<p class="mt-1 text-theme-sm text-gray-400">Upgrade anytime. Payments are processed securely via Midtrans.</p>
	</div>

	{#if banner}
		<div
			class="mb-6 rounded-lg border px-4 py-3 text-theme-sm {banner.type === 'success'
				? 'border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/[0.08] dark:text-success-400'
				: banner.type === 'pending'
					? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/[0.08] dark:text-orange-400'
					: 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/[0.08] dark:text-error-400'}"
		>
			{banner.message}
		</div>
	{/if}

	{#if plans.length === 0}
		<p class="py-16 text-center text-theme-sm text-gray-400">Loading plans...</p>
	{:else}
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each plans as plan}
				<PlanCard
					{plan}
					isCurrent={subscription?.status === 'active' && subscription?.planId === plan.id}
					loading={loadingPlanId === plan.id}
					onSubscribe={handleSubscribe}
				/>
			{/each}
		</div>
	{/if}

	<p class="mt-8 text-center text-theme-xs text-gray-400">
		Need to manage your current subscription? Go to <a href="/billing" class="text-brand-500 hover:underline">Billing</a>.
	</p>
</main>
