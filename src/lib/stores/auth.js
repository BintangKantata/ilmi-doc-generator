import { writable } from 'svelte/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '$lib/firebase.js';

// user = null (belum dicek) | false (tidak login) | objek user (login)
export const user = writable(undefined);

onAuthStateChanged(auth, (firebaseUser) => {
	user.set(firebaseUser ?? false);
});
