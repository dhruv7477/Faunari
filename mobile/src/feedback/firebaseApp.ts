// Firebase app init from EXPO_PUBLIC_FIREBASE_* env (see .env.local.example). These values are not
// secret — Firebase web configs are meant to be embedded; access is controlled by security rules.
// When unset, isFirebaseConfigured() is false and the app stays local-only (no upload attempted).
import { FirebaseApp, getApps, initializeApp } from "firebase/app";

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.storageBucket && config.appId);
}

export function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApps()[0] : initializeApp(config);
}
