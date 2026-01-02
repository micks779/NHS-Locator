
const CACHE_NAME = 'elft-locator-v2';
const TILE_CACHE_NAME = 'elft-locator-tiles-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdn.tailwindcss.com'
];

// OpenStreetMap tile URL pattern: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
const isTileRequest = (url) => {
  return url.includes('tile.openstreetmap.org') || 
         url.includes('tile.osm.org') ||
         url.match(/\/\d+\/\d+\/\d+\.(png|jpg|jpeg)$/);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== TILE_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim(); // Take control of all pages
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle Leaflet map tiles with cache-first strategy for offline hospital use
  if (isTileRequest(url.href)) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse; // Return cached tile immediately
          }
          
          // Fetch and cache new tiles
          return fetch(event.request)
            .then((fetchResponse) => {
              // Only cache successful responses
              if (fetchResponse.ok) {
                const clonedResponse = fetchResponse.clone();
                cache.put(event.request, clonedResponse);
              }
              return fetchResponse;
            })
            .catch(() => {
              // If fetch fails and no cache, return a placeholder or empty response
              return new Response('', { status: 404 });
            });
        });
      })
    );
    return;
  }
  
  // Handle other requests (Supabase API, app assets, etc.)
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      
      return fetch(event.request).then((fetchResponse) => {
        // Cache Supabase API responses for offline use
        if (event.request.url.includes('supabase.co')) {
          const clonedResponse = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Fallback to index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
