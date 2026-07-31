<script>
	import { loginUser, registerUser } from '$lib/services/auth.js';

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
			'auth/email-already-in-use': 'This email is already registered.',
			'auth/invalid-email': 'Invalid email format.',
			'auth/weak-password': 'Password must be at least 6 characters.',
			'auth/invalid-credential': 'Incorrect email or password.',
			'auth/user-not-found': 'Incorrect email or password.',
			'auth/wrong-password': 'Incorrect email or password.'
		};
		return map[code] || 'Something went wrong, please try again.';
	}
</script>

<main class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
	<div class="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
		<h1 class="mb-1 text-theme-lg font-semibold text-gray-800 dark:text-white/90">
			{mode === 'login' ? 'Sign In' : 'Create Account'}
		</h1>
		<p class="mb-5 text-theme-sm text-gray-400">AI Paper Generator</p>

		<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
			<div class="form-groups">
				<label class="form-label" for="email">Email</label>
				<input id="email" type="email" required class="text-input" bind:value={email} placeholder="name@email.com" />
			</div>
			<div class="form-groups">
				<label class="form-label" for="password">Password</label>
				<input id="password" type="password" required minlength="6" class="text-input" bind:value={password} placeholder="At least 6 characters" />
			</div>

			{#if error}
				<p class="text-theme-xs text-error-500">{error}</p>
			{/if}

			<button type="submit" class="btn-primary-md w-full justify-center" disabled={loading}>
				{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
			</button>
		</form>

		<p class="mt-5 text-center text-theme-sm text-gray-400">
			{#if mode === 'login'}
				Don't have an account?
				<button class="font-medium text-brand-500 hover:underline" on:click={() => (mode = 'register')}>Sign Up</button>
			{:else}
				Already have an account?
				<button class="font-medium text-brand-500 hover:underline" on:click={() => (mode = 'login')}>Sign In</button>
			{/if}
		</p>
	</div>
</main>
