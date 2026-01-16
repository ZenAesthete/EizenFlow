const CACHE_NAME = 'eisenflow-v2';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Navigation requests: Network first, fallback to cache (SPA behavior)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid network response, return it
          if (response.status === 200) {
            return response;
          }
          // If 404 or other error, fallback to index.html from cache
          return caches.match('./index.html');
        })
        .catch(() => {
          // If offline (network fail), fallback to index.html from cache
          return caches.match('./index.html');
        })
    );
    return;
  }

  // External assets (CDN): Stale-while-revalidate strategy
  if (url.hostname.includes('cdn.tailwindcss.com') || 
      url.hostname.includes('esm.sh') || 
      url.hostname.includes('fonts.googleapis.com') || 
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('lucide-static') ||
      url.hostname.includes('unpkg.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
                const responseToCache = networkResponse.clone();
                cache.put(event.request, responseToCache);
            }
            return networkResponse;
          }).catch(() => {
             return cachedResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Default: Network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
         // Optionally cache other successful GET requests
         if (event.request.method === 'GET' && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
         }
         return response;
      })
      .catch(() => caches.match(event.request))
  );
});