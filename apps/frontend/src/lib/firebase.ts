import { initializeApp, type FirebaseApp, getApps } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let cachedApp: FirebaseApp | null = null;

function getConfig(): Record<string, string> | null {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
  const missing = requiredFields.filter(key => !config[key as keyof typeof config]);

  if (missing.length) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Missing required Firebase config values: ${missing.join(", ")}`);
    }
    return null;
  }

  return config as Record<string, string>;
}

export function getFirebaseApp(): FirebaseApp | null {
  const config = getConfig();
  if (!config) return null;

  if (cachedApp) return cachedApp;

  if (!getApps().length) {
    cachedApp = initializeApp(config);
  } else {
    cachedApp = getApps()[0] as FirebaseApp;
  }

  return cachedApp;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}
