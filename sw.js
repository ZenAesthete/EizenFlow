const CACHE_NAME = 'eisenflow-v1';
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
  // Navigation requests: Network first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // External assets (CDN): Stale-while-revalidate strategy
  // This ensures fast load from cache while updating in background
  if (event.request.url.includes('cdn.tailwindcss.com') || 
      event.request.url.includes('esm.sh') || 
      event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com') ||
      event.request.url.includes('lucide-static')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Only cache valid responses
            if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
                const responseToCache = networkResponse.clone();
                cache.put(event.request, responseToCache);
            }
            return networkResponse;
          }).catch(() => {
             // If fetch fails (offline), return cached or nothing
             return cachedResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Default: Network first, fallback to cache for other assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
         return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
         });
      })
      .catch(() => caches.match(event.request))
  );
});