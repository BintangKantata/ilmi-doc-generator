import { derived } from 'svelte/store';
import { locale } from '$lib/stores/locale.js';
import { translations } from './translations.js';

/**
 * Reactive translation object. Usage in a .svelte file:
 *
 *   import { t } from '$lib/i18n';
 *   ...
 *   <h1>{$t.dashboard.title}</h1>
 *
 * Because it's a derived store, $t automatically updates (and re-renders
 * any component using it) whenever `locale` changes -- no page reload
 * needed when the user switches language.
 */
export const t = derived(locale, ($locale) => translations[$locale] || translations.en);
