<script>
	import { loginUser, registerUser } from '$lib/services/auth.js';
	import { t } from '$lib/i18n';

	let mode = 'login'; // 'login' | 'register'
	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleSubmit() {
		error = '';
		loading = true;
		try {
			if (mode === 'login') {
				await loginUser(email, password);
			} else {
				await registerUser(email, password);
			}
			// redirect is handled automatically by +layout.svelte via the auth store
		} catch (e) {
			error = mapError(e.code);
		} finally {
			loading = false;
		}
	}

	function mapError(code) {
		const map = {
			'auth/email-already-in-use': $t.login.errors.emailInUse,
			'auth/invalid-email': $t.login.errors.invalidEmail,
			'auth/weak-password': $t.login.errors.weakPassword,
			'auth/invalid-credential': $t.login.errors.wrongCredentials,
			'auth/user-not-found': $t.login.errors.wrongCredentials,
			'auth/wrong-password': $t.login.errors.wrongCredentials
		};
		return map[code] || $t.login.errors.generic;
	}
</script>

<main class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
	<div class="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
		<h1 class="mb-1 text-theme-lg font-semibold text-gray-800 dark:text-white/90">
			{mode === 'login' ? $t.login.signIn : $t.login.createAccount}
		</h1>
		<p class="mb-5 text-theme-sm text-gray-400">{$t.login.tagline}</p>

		<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
			<div class="form-groups">
				<label class="form-label" for="email">{$t.login.email}</label>
				<input id="email" type="email" required class="text-input" bind:value={email} placeholder={$t.login.emailPlaceholder} />
			</div>
			<div class="form-groups">
				<label class="form-label" for="password">{$t.login.password}</label>
				<input id="password" type="password" required minlength="6" class="text-input" bind:value={password} placeholder={$t.login.passwordPlaceholder} />
			</div>

			{#if error}
				<p class="text-theme-xs text-error-500">{error}</p>
			{/if}

			<button type="submit" class="btn-primary-md w-full justify-center" disabled={loading}>
				{loading ? $t.login.processing : mode === 'login' ? $t.login.signIn : $t.login.signUp}
			</button>
		</form>

		<p class="mt-5 text-center text-theme-sm text-gray-400">
			{#if mode === 'login'}
				{$t.login.noAccount}
				<button class="font-medium text-brand-500 hover:underline" on:click={() => (mode = 'register')}>{$t.login.signUp}</button>
			{:else}
				{$t.login.haveAccount}
				<button class="font-medium text-brand-500 hover:underline" on:click={() => (mode = 'login')}>{$t.login.signIn}</button>
			{/if}
		</p>
	</div>
</main>
