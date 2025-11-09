/**
 * Service Worker for Portfolio Manager PWA
 * Version: 1.1.0
 * Features: Offline caching, background sync, push notifications
 *
 * Cache versioning system:
 * - VERSION: Incremented for breaking changes
 * - TIMESTAMP: Auto-updated on build for cache-busting
 * - Automatic cleanup of old caches on activation
 */

// Get version from URL if available (useful for cache-busting)
const VERSION = '3.3.1';
const BUILD_TIMESTAMP = new Date().getTime(); // Generated on each build
const CACHE_VERSION = `v${VERSION}`;

const CACHE_NAME = `portfolio-manager-${CACHE_VERSION}`;
const RUNTIME_CACHE = `portfolio-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `portfolio-images-${CACHE_VERSION}`;

// Legacy cache names to clean up
const LEGACY_CACHES = [
  'portfolio-manager-v1.0.0',
  'portfolio-runtime-v1.0.0',
  'portfolio-images-v1.0.0',
];

// Files to cache on install
const PRECACHE_URLS = [
  '/investPortfolio.html',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add Chart.js CDN - updated to 4.4.1
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Precaching failed:', error);
      }),
  );
});

// Activate event - clean up old caches and legacy versions
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches not in current version
            if (!currentCaches.includes(cacheName)) {
              console.info(`[SW] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          }),
        ),
      )
      .then(() => {
        console.info(`[SW] Service Worker v${VERSION} activated (${CACHE_VERSION})`);
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin && !url.href.includes('cdn.jsdelivr.net')) {
    return;
  }

  // Handle different strategies based on request type
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
  } else {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  }
});

/**
 * Cache First Strategy - Good for static assets
 * Try cache first, fallback to network
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (err) {
    console.error('[SW] Cache first strategy failed:', err);
    return new Response('Offline - resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

/**
 * Network First Strategy - Good for dynamic content
 * Try network first, fallback to cache
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (err) {
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      const offlinePage = await cache.match('/investPortfolio.html');
      if (offlinePage) {
        return offlinePage;
      }
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Background Sync - for offline data submission
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-portfolio-data') {
    event.waitUntil(syncPortfolioData());
  }
});

async function syncPortfolioData() {
  try {
    // Get pending data from IndexedDB or localStorage
    const clients = await self.clients.matchAll();

    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { success: true },
      });
    });
  } catch (err) {
    console.error('[SW] Sync failed:', err);
    throw err;
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nová aktualizace portfolia',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Zobrazit portfolio',
        icon: '/icons/icon-96x96.png',
      },
      {
        action: 'close',
        title: 'Zavřít',
        icon: '/icons/icon-96x96.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('Portfolio Manager', options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/investPortfolio.html'));
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(caches.open(RUNTIME_CACHE).then((cache) => cache.addAll(urls)));
  }
});
