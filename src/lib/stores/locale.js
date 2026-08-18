import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'ui-locale';

function createLocaleStore() {
	const initial = browser ? localStorage.getItem(STORAGE_KEY) || 'en' : 'en';
	const { subscribe, set } = writable(initial);

	return {
		subscribe,
		set(value) {
			if (browser) localStorage.setItem(STORAGE_KEY, value);
			set(value);
		}
	};
}

// 'en' | 'id' -- this ONLY controls the app's own UI text (buttons, labels,
// headers). It is completely separate from `project.language`, which is
// the language Gemini writes the generated paper in (chosen per-project in
// the Research Context form). Never read this store to decide generation
// language.
export const locale = createLocaleStore();
