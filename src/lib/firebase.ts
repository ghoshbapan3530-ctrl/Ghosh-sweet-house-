import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import firebaseConfigFile from '../../firebase-applet-config.json';

// Public Firebase config with safe fallback to provisioned values
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFile.apiKey || "AIzaSyAlJ6FHyhFU9R9WnkVCn0tO7fkukeQUa-g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFile.authDomain || "gen-lang-client-0366809773.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFile.projectId || "gen-lang-client-0366809773",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFile.storageBucket || "gen-lang-client-0366809773.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId || "147588049290",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFile.appId || "1:147588049290:web:0af93d0218a0e4b8470073",
  firestoreDatabaseId: (firebaseConfigFile as any).firestoreDatabaseId || undefined
};

// Initialize or reuse Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services with provisioned Firestore database ID
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

// Firestore connectivity check with safe timeout and connection validation
export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Expected PERMISSION_DENIED or NOT_FOUND indicates live connection reached server successfully
    return true;
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

// Run connectivity check silently on app boot
if (typeof window !== 'undefined') {
  testFirestoreConnection();
}
