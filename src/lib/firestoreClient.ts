import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID?.trim(),
  storageBucket: `${process.env.NEXT_PUBLIC_FB_PROJECT_ID?.trim()}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_APP_ID?.trim().split(':')[1], // Extract from app ID
  appId: process.env.NEXT_PUBLIC_FB_APP_ID?.trim(),
  databaseURL: process.env.NEXT_PUBLIC_FB_DATABASE_URL?.trim(),
};

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

// Initialize Firebase only on client side
function initializeFirebase() {
  if (typeof window === 'undefined') return null;

  // Validate config before initialization
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    console.error('Firebase config is missing required fields:', config);
    return null;
  }

  if (!firebaseApp) {
    try {
      firebaseApp = getApps().length ? getApps()[0] : initializeApp(config);
      auth = getAuth(firebaseApp);
      db = getFirestore(firebaseApp);
      rtdb = getDatabase(firebaseApp);
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return null;
    }
  }

  return { firebaseApp, auth, db, rtdb };
}

// Export functions that return initialized instances
export function getFirebaseAuth() {
  const firebase = initializeFirebase();
  return firebase?.auth || null;
}

export function getFirebaseDb() {
  const firebase = initializeFirebase();
  return firebase?.db || null;
}

export function getFirebaseRtdb() {
  const firebase = initializeFirebase();
  return firebase?.rtdb || null;
}

export function getFirebaseApp() {
  const firebase = initializeFirebase();
  return firebase?.firebaseApp || null;
}

// For backward compatibility - these will be null on server side
export { auth, db, rtdb, firebaseApp };
