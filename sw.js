const CACHE_NAME = 'eisenflow-production-v1';

// The "Shell" of our app.
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event: Cache the App Shell immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately, don't wait for tab close
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of open clients immediately
});

// Fetch Event: The Core Logic
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Handle Navigation Requests (HTML)
  // Strategy: Network First -> Fallback to Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // If offline, serve the cached index.html
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. Handle External Assets (CDNs like unpkg, esm.sh, tailwind)
  // Strategy: Stale-While-Revalidate (Return cache fast, update in background)
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Only cache valid responses (opaque or 200)
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Handle Internal Assets (JS, local files)
  // Strategy: Cache First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});