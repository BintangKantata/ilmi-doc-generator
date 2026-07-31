<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth.js';
	import { logoutUser } from '$lib/services/auth.js';

	const PUBLIC_ROUTES = ['/login'];

	$: isPublic = PUBLIC_ROUTES.includes($page.url.pathname);

	// $user bisa: undefined (belum dicek Firebase), false (tidak login), objek (login)
	$: if ($user === false && !isPublic) {
		goto('/login');
	}
	$: if ($user && $page.url.pathname === '/login') {
		goto('/');
	}

	async function handleLogout() {
		await logoutUser();
	}
</script>

{#if $user === undefined && !isPublic}
	<!-- Still waiting for Firebase to check login status -->
	<div class="flex h-screen items-center justify-center">
		<p class="text-sm text-gray-400">Loading...</p>
	</div>
{:else}
	{#if $user && !isPublic}
		<div class="flex items-center justify-end gap-3 border-b border-gray-100 bg-white px-6 py-2 text-theme-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
			<span>{$user.email}</span>
			<button class="text-brand-500 hover:underline" on:click={handleLogout}>Log out</button>
		</div>
	{/if}
	<slot />
{/if}
