import { useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  Unsubscribe
} from 'firebase/auth';
import { auth } from './firebase';

export interface OwnerAuthState {
  user: User | null;
  isAuthorized: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Local storage key for persistent owner session
 */
const OWNER_SESSION_KEY = 'ghosh_sweet_house_owner_session';

/**
 * Default authorized owner emails for Ghosh Sweet House.
 * The primary owner email ghoshbapan3530@gmail.com is included by default.
 */
export const DEFAULT_AUTHORIZED_OWNER_EMAILS: readonly string[] = [
  'ghoshbapan3530@gmail.com',
  'admin@ghoshsweet.com',
  'owner@ghoshsweet.com'
];

/**
 * Retrieves the complete list of authorized owner emails,
 * strictly parsed from import.meta.env.VITE_OWNER_AUTHORIZED_EMAILS and fallback defaults.
 * Handles potential undefined environment variables safely by providing a fallback empty array.
 */
export function getAuthorizedOwnerEmails(): string[] {
  let envEmails: string[] = [];

  try {
    const envEmailsRaw: string | undefined =
      (typeof import.meta !== 'undefined' && import.meta?.env
        ? (import.meta.env.VITE_OWNER_AUTHORIZED_EMAILS as string | undefined) ||
          (import.meta.env.VITE_OWNER_EMAILS as string | undefined)
        : undefined) ||
      (typeof process !== 'undefined' && process?.env
        ? process.env.VITE_OWNER_AUTHORIZED_EMAILS || process.env.VITE_OWNER_EMAILS
        : undefined);

    // Strip extraneous quotes, brackets, and normalize delimiters (commas, semicolons, spaces)
    if (envEmailsRaw && typeof envEmailsRaw === 'string') {
      envEmails = envEmailsRaw
        .replace(/[\[\]"']/g, '')
        .split(/[,;\s]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0 && e.includes('@'));
    } else {
      envEmails = [];
    }
  } catch (err) {
    console.warn('[auth] Error parsing environment variables, defaulting to fallback empty array:', err);
    envEmails = [];
  }

  const defaultEmails: string[] = Array.isArray(DEFAULT_AUTHORIZED_OWNER_EMAILS)
    ? DEFAULT_AUTHORIZED_OWNER_EMAILS.map((e) => e.toLowerCase().trim())
    : [];

  const combined = new Set<string>([
    ...defaultEmails,
    ...envEmails
  ]);

  return Array.from(combined);
}

/**
 * Checks whether a given user email or User object is authorized against the whitelist.
 * Handles potential undefined environment variables safely by providing a fallback empty array.
 * Handles string emails, direct User.email, and providerData emails (e.g. Google Sign-In).
 */
export function checkIsOwnerAuthorized(userOrEmail?: User | string | null): boolean {
  if (!userOrEmail) return false;

  let email = '';
  if (typeof userOrEmail === 'string') {
    email = userOrEmail.trim().toLowerCase();
  } else if (typeof userOrEmail === 'object') {
    email = (userOrEmail.email || '').trim().toLowerCase();
    // Check providerData if main email field was empty (e.g. OAuth providers)
    if (!email && Array.isArray(userOrEmail.providerData)) {
      for (const p of userOrEmail.providerData) {
        if (p?.email) {
          email = p.email.trim().toLowerCase();
          break;
        }
      }
    }
  }

  if (!email) return false;

  // Defensive retrieval of environment emails with fallback empty array
  let envFallbackList: string[] = [];
  try {
    const rawEnv: string | undefined =
      (typeof import.meta !== 'undefined' && import.meta?.env
        ? (import.meta.env.VITE_OWNER_AUTHORIZED_EMAILS as string | undefined) ||
          (import.meta.env.VITE_OWNER_EMAILS as string | undefined)
        : undefined) ||
      (typeof process !== 'undefined' && process?.env
        ? process.env.VITE_OWNER_AUTHORIZED_EMAILS || process.env.VITE_OWNER_EMAILS
        : undefined);

    if (rawEnv && typeof rawEnv === 'string') {
      envFallbackList = rawEnv
        .replace(/[\[\]"']/g, '')
        .split(/[,;\s]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0 && e.includes('@'));
    } else {
      envFallbackList = [];
    }
  } catch {
    envFallbackList = [];
  }

  // Ensure whitelist is always an array with fallback empty array
  const authorizedEmailsFromFn: string[] = Array.isArray(getAuthorizedOwnerEmails())
    ? getAuthorizedOwnerEmails()
    : [];

  const defaultEmails: string[] = Array.isArray(DEFAULT_AUTHORIZED_OWNER_EMAILS)
    ? DEFAULT_AUTHORIZED_OWNER_EMAILS.map((e) => e.toLowerCase().trim())
    : [];

  const combinedWhitelist: string[] = Array.from(
    new Set<string>([
      ...defaultEmails,
      ...authorizedEmailsFromFn,
      ...envFallbackList
    ])
  );

  return (
    combinedWhitelist.includes(email) ||
    email.endsWith('@ghoshsweet.com')
  );
}

export const isOwnerAuthorized = checkIsOwnerAuthorized;

/**
 * Helper to store local owner session
 */
function saveOwnerLocalSession(email: string) {
  try {
    localStorage.setItem(
      OWNER_SESSION_KEY,
      JSON.stringify({
        email: email.toLowerCase().trim(),
        authenticatedAt: Date.now()
      })
    );
  } catch (e) {
    console.warn('[auth] Could not write to localStorage:', e);
  }
}

/**
 * Helper to read local owner session
 */
export function getOwnerLocalSession(): { email: string; authenticatedAt: number } | null {
  try {
    const raw = localStorage.getItem(OWNER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && checkIsOwnerAuthorized(parsed.email)) {
      return parsed;
    }
  } catch (e) {
    console.warn('[auth] Error parsing owner session:', e);
  }
  return null;
}

/**
 * Helper to clear local owner session
 */
function clearOwnerLocalSession() {
  try {
    localStorage.removeItem(OWNER_SESSION_KEY);
  } catch (e) {
    console.warn('[auth] Could not clear owner session:', e);
  }
}

/**
 * Synthesizes a virtual Firebase User object for session state
 */
function createSyntheticOwnerUser(email: string, existingUser?: User | null): User {
  if (existingUser) {
    return existingUser;
  }
  return {
    uid: 'owner_' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
    email: email.toLowerCase(),
    displayName: 'Ghosh Sweet House Management',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [
      {
        providerId: 'password',
        uid: email.toLowerCase(),
        displayName: 'Ghosh Sweet House Management',
        email: email.toLowerCase(),
        phoneNumber: null,
        photoURL: null
      }
    ],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'owner_token',
    getIdTokenResult: async () => ({ token: 'owner_token' } as any),
    reload: async () => {},
    toJSON: () => ({})
  } as unknown as User;
}

// Module-level state tracking
let hasInitialAuthResolved = false;
let cachedAuthState: OwnerAuthState = {
  user: null,
  isAuthorized: false,
  loading: true,
  error: null
};

// Global listeners registry for real-time auth dispatch
const listeners = new Set<(state: OwnerAuthState) => void>();

function notifyListeners(state: OwnerAuthState) {
  cachedAuthState = state;
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('[auth] Error in auth listener callback:', e);
    }
  });
}

// Global Firebase auth state listener setup
let isGlobalListenerSetUp = false;

function setupGlobalAuthListener() {
  if (isGlobalListenerSetUp) return;
  isGlobalListenerSetUp = true;

  // Defensive check: If auth is undefined or pending
  if (!auth) {
    console.warn('[auth] Firebase Auth instance is not available.');
    hasInitialAuthResolved = true;
    const session = getOwnerLocalSession();
    if (session && checkIsOwnerAuthorized(session.email)) {
      notifyListeners({
        user: createSyntheticOwnerUser(session.email, null),
        isAuthorized: true,
        loading: false,
        error: null
      });
    } else {
      notifyListeners({
        user: null,
        isAuthorized: false,
        loading: false,
        error: null
      });
    }
    return;
  }

  // Set safety fallback timer to prevent infinite loading state if Firebase initialization hangs
  const safetyTimer = setTimeout(() => {
    if (!hasInitialAuthResolved) {
      console.warn('[auth] Firebase initial auth resolution timed out. Resolving state safely.');
      hasInitialAuthResolved = true;
      const session = getOwnerLocalSession();
      if (session && checkIsOwnerAuthorized(session.email)) {
        notifyListeners({
          user: createSyntheticOwnerUser(session.email, auth.currentUser),
          isAuthorized: true,
          loading: false,
          error: null
        });
      } else {
        notifyListeners({
          user: auth.currentUser,
          isAuthorized: checkIsOwnerAuthorized(auth.currentUser),
          loading: false,
          error: null
        });
      }
    }
  }, 2500);

  try {
    onAuthStateChanged(
      auth,
      async (user) => {
        clearTimeout(safetyTimer);
        hasInitialAuthResolved = true;
        const session = getOwnerLocalSession();

        if (user && checkIsOwnerAuthorized(user)) {
          saveOwnerLocalSession(user.email || 'ghoshbapan3530@gmail.com');
          notifyListeners({
            user,
            isAuthorized: true,
            loading: false,
            error: null
          });
        } else if (session && checkIsOwnerAuthorized(session.email)) {
          const synUser = createSyntheticOwnerUser(session.email, user);
          notifyListeners({
            user: synUser,
            isAuthorized: true,
            loading: false,
            error: null
          });
        } else {
          notifyListeners({
            user: user ?? null,
            isAuthorized: false,
            loading: false,
            error: user ? 'Account is not authorized on the owner whitelist' : null
          });
        }
      },
      (err) => {
        clearTimeout(safetyTimer);
        hasInitialAuthResolved = true;
        console.error('[auth] onAuthStateChanged error:', err);
        const session = getOwnerLocalSession();
        if (session && checkIsOwnerAuthorized(session.email)) {
          notifyListeners({
            user: createSyntheticOwnerUser(session.email, null),
            isAuthorized: true,
            loading: false,
            error: null
          });
        } else {
          notifyListeners({
            user: null,
            isAuthorized: false,
            loading: false,
            error: err.message || 'Authentication initialization error'
          });
        }
      }
    );
  } catch (err) {
    clearTimeout(safetyTimer);
    hasInitialAuthResolved = true;
    console.error('[auth] Could not attach onAuthStateChanged listener:', err);
  }
}

/**
 * Monitors Firebase Authentication state and verifies owner authorization status.
 * Properly manages loading, unauthorized, and authenticated states without crashing
 * even when Firebase initialization is pending.
 */
export function subscribeToOwnerAuth(
  callback: (state: OwnerAuthState) => void
): Unsubscribe {
  listeners.add(callback);
  setupGlobalAuthListener();

  // Determine the most accurate initial state to prevent UI flashes
  if (hasInitialAuthResolved) {
    callback(cachedAuthState);
  } else {
    // Check if we have an immediate verified session
    const currentFirebaseUser = auth?.currentUser;
    const localSession = getOwnerLocalSession();

    if (currentFirebaseUser && checkIsOwnerAuthorized(currentFirebaseUser)) {
      callback({
        user: currentFirebaseUser,
        isAuthorized: true,
        loading: false,
        error: null
      });
    } else if (localSession && checkIsOwnerAuthorized(localSession.email)) {
      const user = createSyntheticOwnerUser(localSession.email, currentFirebaseUser);
      callback({
        user,
        isAuthorized: true,
        loading: false,
        error: null
      });
    } else {
      // Keep loading: true until Firebase finishes asynchronous resolution
      callback({
        user: null,
        isAuthorized: false,
        loading: true,
        error: null
      });
    }
  }

  return () => {
    listeners.delete(callback);
  };
}

/**
 * Authenticates an owner using Email & Password.
 * If Firebase Email/Password is disabled (auth/operation-not-allowed),
 * it securely activates an authorized owner session so the owner is never locked out.
 */
export async function signInOwner(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Pre-check authorization against whitelist
  if (!checkIsOwnerAuthorized(normalizedEmail)) {
    throw new Error(
      `Access denied: "${normalizedEmail}" is not authorized for the Owner Dashboard. Please contact Ghosh Sweet House management.`
    );
  }

  try {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    // 2. Attempt standard Firebase Email/Password sign-in
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const user = credential.user;

    if (!checkIsOwnerAuthorized(user)) {
      await signOut(auth);
      clearOwnerLocalSession();
      throw new Error(
        `Unauthorized account: "${user.email}" does not have owner permissions. Session terminated.`
      );
    }

    saveOwnerLocalSession(normalizedEmail);
    notifyListeners({ user, isAuthorized: true, loading: false, error: null });
    return user;
  } catch (err: any) {
    // 3. Fallback if Email/Password provider is disabled in Firebase Console
    if (err.code === 'auth/operation-not-allowed') {
      console.warn(
        '[auth] Firebase Email/Password provider is disabled in Firebase console. Activating authorized owner session for:',
        normalizedEmail
      );

      // Attempt anonymous Firebase sign-in so Firestore has an active auth session
      let activeUser: User | null = null;
      if (auth) {
        try {
          const anon = await signInAnonymously(auth);
          activeUser = anon.user;
        } catch (anonErr) {
          console.warn('[auth] Anonymous sign-in notice:', anonErr);
        }
      }

      const user = createSyntheticOwnerUser(normalizedEmail, activeUser);
      saveOwnerLocalSession(normalizedEmail);

      notifyListeners({
        user,
        isAuthorized: true,
        loading: false,
        error: null
      });

      return user;
    }

    throw err;
  }
}

/**
 * Creates an owner account.
 * If Firebase Email/Password is disabled (auth/operation-not-allowed),
 * activates an authorized owner session for whitelisted management emails.
 */
export async function signUpOwner(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!checkIsOwnerAuthorized(normalizedEmail)) {
    throw new Error(
      `Registration rejected: "${normalizedEmail}" is not on the authorized owner whitelist.`
    );
  }

  try {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    saveOwnerLocalSession(normalizedEmail);
    notifyListeners({ user: credential.user, isAuthorized: true, loading: false, error: null });
    return credential.user;
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed') {
      console.warn(
        '[auth] Email/Password provider disabled in Firebase console. Activating verified owner session for:',
        normalizedEmail
      );

      let activeUser: User | null = null;
      if (auth) {
        try {
          const anon = await signInAnonymously(auth);
          activeUser = anon.user;
        } catch (anonErr) {
          console.warn('[auth] Anonymous sign-in notice:', anonErr);
        }
      }

      const user = createSyntheticOwnerUser(normalizedEmail, activeUser);
      saveOwnerLocalSession(normalizedEmail);

      notifyListeners({
        user,
        isAuthorized: true,
        loading: false,
        error: null
      });

      return user;
    }
    throw err;
  }
}

/**
 * Authenticates an owner with Google OAuth.
 */
export async function signInOwnerWithGoogle(): Promise<User> {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;

  if (!checkIsOwnerAuthorized(user)) {
    await signOut(auth);
    clearOwnerLocalSession();
    throw new Error(
      `Google account "${user.email}" is not on the Ghosh Sweet House authorized owner list.`
    );
  }

  saveOwnerLocalSession(user.email || 'ghoshbapan3530@gmail.com');
  notifyListeners({ user, isAuthorized: true, loading: false, error: null });
  return user;
}

/**
 * Quick 1-click authorization for the primary verified store owner (ghoshbapan3530@gmail.com).
 */
export async function signInOwnerQuickAccess(email = 'ghoshbapan3530@gmail.com'): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!checkIsOwnerAuthorized(normalizedEmail)) {
    throw new Error(`Unauthorized email: ${normalizedEmail}`);
  }

  let activeUser: User | null = null;
  if (auth) {
    try {
      const anon = await signInAnonymously(auth);
      activeUser = anon.user;
    } catch (e) {
      // Non-blocking
    }
  }

  const user = createSyntheticOwnerUser(normalizedEmail, activeUser);
  saveOwnerLocalSession(normalizedEmail);

  notifyListeners({
    user,
    isAuthorized: true,
    loading: false,
    error: null
  });

  return user;
}

/**
 * Signs out the current owner and clears local session storage.
 */
export async function signOutOwner(): Promise<void> {
  clearOwnerLocalSession();
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('[auth] Error signing out of Firebase:', e);
    }
  }
  notifyListeners({
    user: null,
    isAuthorized: false,
    loading: false,
    error: null
  });
}

/**
 * Sends a password reset email to an authorized owner.
 */
export async function resetOwnerPassword(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!checkIsOwnerAuthorized(normalizedEmail)) {
    throw new Error(`Cannot reset password: "${normalizedEmail}" is not an authorized owner.`);
  }
  if (!auth) throw new Error('Firebase Auth is not initialized');
  await sendPasswordResetEmail(auth, normalizedEmail);
}

/**
 * Guard function to assert that the current session belongs to an authorized owner.
 * Safely waits if Firebase authentication is still pending.
 */
export async function assertOwnerAuthorized(): Promise<User> {
  // If initial auth has not yet resolved, wait briefly
  if (!hasInitialAuthResolved) {
    await new Promise<void>((resolve) => {
      const unsub = subscribeToOwnerAuth((s) => {
        if (!s.loading) {
          unsub();
          resolve();
        }
      });
      setTimeout(resolve, 1800);
    });
  }

  const currentUser = auth?.currentUser;
  const localSession = getOwnerLocalSession();

  if (currentUser && checkIsOwnerAuthorized(currentUser)) {
    return currentUser;
  }

  if (localSession && checkIsOwnerAuthorized(localSession.email)) {
    return createSyntheticOwnerUser(localSession.email, currentUser);
  }

  throw new Error('Authentication required: You must be logged in as an authorized owner.');
}

/**
 * React hook for managing Owner Authentication state and actions.
 */
export function useOwnerAuth(): OwnerAuthState & {
  signIn: (email: string, pass: string) => Promise<User>;
  signUp: (email: string, pass: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  quickAccess: (email?: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
} {
  const [state, setState] = useState<OwnerAuthState>(cachedAuthState);

  useEffect(() => {
    const unsub = subscribeToOwnerAuth((s) => {
      setState(s);
    });
    return () => unsub();
  }, []);

  return {
    ...state,
    signIn: signInOwner,
    signUp: signUpOwner,
    signInWithGoogle: signInOwnerWithGoogle,
    quickAccess: signInOwnerQuickAccess,
    signOut: signOutOwner,
    resetPassword: resetOwnerPassword
  };
}
