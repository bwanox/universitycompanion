import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCWaSI5sUP1b6ZelS354R_9rnFmFk7ZiA0",
  authDomain: "unifriend-9d408.firebaseapp.com",
  projectId: "unifriend-9d408",
  storageBucket: "unifriend-9d408.appspot.com", // Fixed typo
  messagingSenderId: "154989551978",
  appId: "1:154989551978:web:9b578b2faa407b0d674513",
  measurementId: "G-T8G8TXGWK7",
};

// ✅ Prevent Firebase from initializing multiple times
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Debugging logs
console.log("🔥 Firebase App Initialized:", getApps().length > 0);
console.log("🔥 Firebase Auth Object:", auth);
console.log("🔥 Firebase Firestore Object:", db);

export { auth, db };
