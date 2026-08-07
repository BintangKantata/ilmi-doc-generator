<script>
	import { onDestroy } from 'svelte';
	import { user } from '$lib/stores/auth.js';
	import { listenSubscription } from '$lib/services/subscriptions.js';

	let subscription = null;
	let unsubscribe = () => {};

	$: if ($user) {
		unsubscribe();
		unsubscribe = listenSubscription($user.uid, (data) => (subscription = data));
	}

	onDestroy(() => unsubscribe());

	$: isActive = subscription?.status === 'active';
	$: label = isActive ? subscription.planName ?? 'Pro' : 'Free plan';
</script>

<a
	href="/billing"
	class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-theme-xs font-medium transition-colors {isActive
		? 'bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/[0.12] dark:text-brand-400'
		: 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-400'}"
>
	{#if isActive}
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.4 3.6L11 6l-3.6 1.4L6 11l-1.4-3.6L1 6l3.6-1.4L6 1z" fill="currentColor" /></svg>
	{/if}
	{label}
</a>
