import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut
} from 'firebase/auth';
import { auth } from '$lib/firebase.js';

export async function registerUser(email, password) {
	const cred = await createUserWithEmailAndPassword(auth, email, password);
	return cred.user;
}

export async function loginUser(email, password) {
	const cred = await signInWithEmailAndPassword(auth, email, password);
	return cred.user;
}

export async function logoutUser() {
	await signOut(auth);
}
