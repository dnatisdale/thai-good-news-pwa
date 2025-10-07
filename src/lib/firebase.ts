// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth, isSignInWithEmailLink, sendSignInLinkToEmail,
  signInWithEmailLink, onAuthStateChanged, signOut, type User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ✅ YOUR CONFIG (kept exactly, as requested)
const firebaseConfig = {
  apiKey: "AIzaSyBFWl2gVtpoZL3AQuZHfBnoO27TMxDnPLE",
  authDomain: "thai-good-news-pwa.firebaseapp.com",
  projectId: "thai-good-news-pwa",
  storageBucket: "thai-good-news-pwa.firebasestorage.app",
  messagingSenderId: "318419662095",
  appId: "1:318419662095:web:3728c21df20917963e7a7a",
  measurementId: "G-NS886JY8F4"
};

// Init core SDKs
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Keep Analytics, but only load it when supported (avoids dev errors)
export async function initAnalytics() {
  if (typeof window === 'undefined') return;
  const { isSupported, getAnalytics } = await import('firebase/analytics');
  if (await isSupported()) getAnalytics(app);
}

// Email-link auth helpers
export async function startEmailLinkSignIn(email: string) {
  const actionCodeSettings = {
    url: `${window.location.origin}/settings`,
    handleCodeInApp: true
  };
  localStorage.setItem('pendingEmail', email);
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
}

export async function finishEmailLinkSignInIfNeeded() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = localStorage.getItem('pendingEmail') ?? '';
    if (!email) email = window.prompt('Confirm your email for sign-in') || '';
    if (!email) return;
    await signInWithEmailLink(auth, email, window.location.href);
    localStorage.removeItem('pendingEmail');
    // Clean URL after sign-in
    window.history.replaceState({}, document.title, '/settings');
  }
}

export function onAuth(cb: (u: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function signOutNow() {
  await signOut(auth);
}
