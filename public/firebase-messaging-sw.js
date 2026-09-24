// Firebase Cloud Messaging Background Service Worker
// Ghosh Sweet House - PWA Push Notification Handler

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId
const firebaseConfig = {
  apiKey: "AIzaSyAlJ6FHyhFU9R9WnkVCn0tO7fkukeQUa-g",
  authDomain: "gen-lang-client-0366809773.firebaseapp.com",
  projectId: "gen-lang-client-0366809773",
  storageBucket: "gen-lang-client-0366809773.firebasestorage.app",
  messagingSenderId: "147588049290",
  appId: "1:147588049290:web:0af93d0218a0e4b8470073"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Ghosh Sweet House';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'New update regarding your sweet order.',
      icon: '/pwa-192x192.png',
      badge: '/favicon.png',
      data: {
        url: payload.data?.url || (payload.data?.orderId ? `/order/${payload.data.orderId}` : '/')
      },
      vibrate: [200, 100, 200],
      tag: payload.data?.orderId || 'ghosh-sweet-order'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn('[firebase-messaging-sw.js] Firebase background initialization:', e);
}

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and navigate
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
