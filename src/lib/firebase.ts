import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Public Firebase config with safe fallback to provisioned values
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAlJ6FHyhFU9R9WnkVCn0tO7fkukeQUa-g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0366809773.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0366809773",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0366809773.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "147588049290",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:147588049290:web:0af93d0218a0e4b8470073"
};

// Initialize or reuse Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Asynchronously resolve Messaging when supported by browser
export const getFirebaseMessaging = async () => {
  try {
    if (typeof window !== 'undefined' && (await isSupported())) {
      return getMessaging(app);
    }
  } catch (err) {
    console.warn('[Firebase] Messaging not supported in this environment:', err);
  }
  return null;
};

// Test Firestore connectivity on boot as per Firebase Integration Skill
export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    // Attempting a server read to verify network and credentials
    await getDocFromServer(doc(db, 'owner_settings', 'config'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client is offline, using offline cache.');
    } else {
      // In development or when rules restrict unauthenticated reads, this is expected
      console.log('[Firebase] Initialized with config:', firebaseConfig.projectId);
    }
    return false;
  }
}

// Owner Allowlist evaluation
const DEFAULT_OWNER_EMAILS = [
  'ghoshbapan3530@gmail.com',
  'admin@ghoshsweet.com',
  'owner@ghoshsweet.com'
];

export function isAuthorizedOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  const envEmailsRaw =
    (import.meta.env.VITE_OWNER_AUTHORIZED_EMAILS as string | undefined) ||
    (import.meta.env.VITE_OWNER_EMAILS as string | undefined) ||
    '';
  const envEmails = envEmailsRaw
    ? envEmailsRaw.split(',').map((e: string) => e.trim().toLowerCase())
    : [];
  const normalized = email.toLowerCase().trim();
  return (
    DEFAULT_OWNER_EMAILS.includes(normalized) ||
    envEmails.includes(normalized) ||
    normalized.endsWith('@ghoshsweet.com')
  );
}

// Run connectivity check silently
if (typeof window !== 'undefined') {
  testFirestoreConnection();
}
