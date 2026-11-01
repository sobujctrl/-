import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

import bundledConfig from '../../firebase-applet-config.json';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

const FIREBASE_CONFIG_STORAGE_KEY = 'user_firebase_custom_config_v1';

// Default starter configuration from provisioned post-510005 project
export const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: bundledConfig.apiKey || '',
  authDomain: bundledConfig.authDomain || 'post-510005.firebaseapp.com',
  projectId: bundledConfig.projectId || 'post-510005',
  firestoreDatabaseId: bundledConfig.firestoreDatabaseId || '(default)',
  storageBucket: bundledConfig.storageBucket || 'post-510005.firebasestorage.app',
  messagingSenderId: bundledConfig.messagingSenderId || '',
  appId: bundledConfig.appId || '',
};

/**
 * Gets currently saved Firebase configuration (or defaults to project post-510005)
 */
export function getSavedFirebaseConfig(): FirebaseClientConfig | null {
  try {
    const stored = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.apiKey && parsed.projectId) {
        return {
          ...DEFAULT_FIREBASE_CONFIG,
          ...parsed,
          firestoreDatabaseId: parsed.firestoreDatabaseId || '(default)',
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse stored Firebase config:', e);
  }
  // Return default post-510005 bundled config
  if (DEFAULT_FIREBASE_CONFIG.projectId) {
    return DEFAULT_FIREBASE_CONFIG;
  }
  return null;
}

/**
 * Saves and re-initializes Firebase configuration
 */
export function saveFirebaseConfig(config: FirebaseClientConfig): void {
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent('firebase_config_updated'));
}

/**
 * Checks if a valid Firebase configuration has been saved
 */
export function isFirebaseConfigured(): boolean {
  const config = getSavedFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
}

// Initialize App dynamically
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export function initializeFirebaseInstances(): {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  googleProvider: GoogleAuthProvider;
} {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  const config = getSavedFirebaseConfig();
  if (!config) {
    return { app: null, db: null, auth: null, googleProvider };
  }

  try {
    if (getApps().length === 0) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    dbInstance = getFirestore(appInstance);
    authInstance = getAuth(appInstance);
  } catch (error) {
    console.error('Error initializing Firebase SDK:', error);
  }

  return {
    app: appInstance,
    db: dbInstance,
    auth: authInstance,
    googleProvider,
  };
}

export const { app, db, auth, googleProvider } = initializeFirebaseInstances();
