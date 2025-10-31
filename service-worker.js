/**
 * Portfolio Manager Pro - Service Worker
 * Version: 3.2.2
 * PWA Support with offline caching (external APIs excluded)
 */

const CACHE_VERSION = 'portfolio-v3.2.2';
const CACHE_NAME = `portfolio-manager-${CACHE_VERSION}`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('✅ SW: Installing service worker...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ SW: Caching core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('❌ SW: Installation failed:', error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ SW: Activating service worker...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for external APIs (Yahoo Finance, etc.)
  const isExternalAPI = 
    url.origin !== self.location.origin &&
    (url.hostname.includes('finance.yahoo.com') ||
     url.hostname.includes('alphavantage.co') ||
     url.hostname.includes('finnhub.io'));

  if (isExternalAPI) {
    // Just pass through external API requests without caching
    event.respondWith(fetch(event.request));
    return;
  }

  // For same-origin requests, use cache strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }

          // If not in cache and it's navigation, return offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // For other requests, return null to allow browser default behavior
          return null;
        });
      }),
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
