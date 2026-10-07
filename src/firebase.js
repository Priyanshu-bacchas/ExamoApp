import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

/*
  Firebase Console:
  Project Settings
  → General
  → Your apps
  → Web App
  → Firebase SDK configuration
*/

const firebaseConfig = {
  apiKey: "PASTE_YOUR_ACTUAL_API_KEY_HERE",
  authDomain: "PASTE_YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "PASTE_YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_ACTUAL_SENDER_ID",
  appId: "PASTE_YOUR_ACTUAL_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export async function googlePopup() {
  return signInWithPopup(
    firebaseAuth,
    googleProvider
  );
}