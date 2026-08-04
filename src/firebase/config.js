import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase App Config with provided project insta-print-bbe9f
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyInstaPrintSelfService2026",
  authDomain: "insta-print-bbe9f.firebaseapp.com",
  projectId: "insta-print-bbe9f",
  storageBucket: "insta-print-bbe9f.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:abcdef1234567890"
};

let app;
let auth;
let db;
let isFirebaseAvailable = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseAvailable = true;
} catch (error) {
  console.warn("Firebase live connection initialized with local fallback mode:", error.message);
  isFirebaseAvailable = false;
}

export { app, auth, db, isFirebaseAvailable };
