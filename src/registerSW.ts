// Service Worker Registration for Ghosh Sweet House PWA

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Ghosh Sweet House ServiceWorker registered with scope:', registration.scope);

          // Check for service worker updates periodically
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New version of Ghosh Sweet House available.');
                }
              });
            }
          });
        })
        .catch((error) => {
          // Benign error in sandboxed/iframe development environments
          console.log('ServiceWorker registration skipped or failed:', error?.message || error);
        });
    });
  }
}
