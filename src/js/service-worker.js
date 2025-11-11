/**
 * Portfolio Manager Pro - Service Worker
 * Version: 3.2.3
 * PWA Support with offline caching (external APIs excluded)
 */

const CACHE_VERSION = 'portfolio-v3.2.3';
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
  self.console.log('✅ SW: Installing service worker...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        self.console.log('✅ SW: Caching core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        self.console.error('❌ SW: Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  self.console.log('✅ SW: Activating service worker...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              self.console.log('🗑️ SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip service worker completely for external APIs (Yahoo Finance, etc.)
  const isExternalAPI =
    url.origin !== self.location.origin &&
    (url.hostname.includes('finance.yahoo.com') ||
      url.hostname.includes('alphavantage.co') ||
      url.hostname.includes('finnhub.io'));

  if (isExternalAPI) {
    // Don't intercept external API requests at all - let browser handle them
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
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache and it's navigation, return offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }

          // For other failed requests, return a basic error response
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
