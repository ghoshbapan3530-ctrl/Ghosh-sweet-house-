import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, getFirebaseMessaging } from './firebase';

export interface PushNotificationPayload {
  title: string;
  body: string;
  orderId?: string;
  url?: string;
}

// VAPID key for web push (optional public key configured in Firebase Console)
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

/**
 * Requests browser notification permission and returns permission status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Retrieves the FCM client device registration token
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') return null;
    }

    // Register service worker if not already registered
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
    }

    const tokenOptions: { serviceWorkerRegistration?: ServiceWorkerRegistration; vapidKey?: string } = {};
    if (swRegistration) {
      tokenOptions.serviceWorkerRegistration = swRegistration;
    }
    if (VAPID_KEY) {
      tokenOptions.vapidKey = VAPID_KEY;
    }

    const token = await getToken(messaging, tokenOptions);
    return token || null;
  } catch (err) {
    console.warn('[FCM] Token generation issue (will fallback to in-app alerts):', err);
    return null;
  }
}

/**
 * Saves customer FCM token to their customer record in Firestore
 */
export async function saveCustomerFCMToken(customerId: string, token: string): Promise<void> {
  try {
    const customerRef = doc(db, 'customers', customerId);
    await setDoc(customerRef, {
      fcmTokens: arrayUnion(token),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving customer FCM token:', err);
  }
}

/**
 * Saves owner FCM token to owner_settings in Firestore
 */
export async function saveOwnerFCMToken(token: string): Promise<void> {
  try {
    const settingsRef = doc(db, 'owner_settings', 'config');
    await setDoc(settingsRef, {
      ownerFcmTokens: arrayUnion(token),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving owner FCM token:', err);
  }
}

/**
 * Listens for incoming FCM messages while app is in foreground
 */
export function onForegroundMessage(callback: (payload: PushNotificationPayload) => void): () => void {
  let unsubscribe = () => {};

  getFirebaseMessaging().then((messaging) => {
    if (!messaging) return;
    unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title || payload.data?.title || 'Ghosh Sweet House';
      const body = payload.notification?.body || payload.data?.body || '';
      const orderId = payload.data?.orderId;
      const url = payload.data?.url;

      callback({ title, body, orderId, url });
    });
  });

  return () => {
    unsubscribe();
  };
}
