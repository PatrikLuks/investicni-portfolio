/**
 * 🚀 ULTRA-OPTIMIZED SERVICE WORKER V3
 * Aggressive caching + Performance optimization + Memory efficiency
 */

const CACHE_VERSION = 'v3-final-fix-1551';
const STATIC_CACHE = `pm-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pm-dynamic-${CACHE_VERSION}`;
const MAX_CACHE_SIZE = 50; // Maximum items in dynamic cache
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Critical assets - must be cached first
const CRITICAL_ASSETS = [
    './investPortfolio.html',
    './module-loader.js',
    './module-loader.css',
    './error-handler.js',
    './accessibility.js',
    './notification-system.js',
    './manifest.json'
];

// 📦 INSTALL - Cache critical assets only
self.addEventListener('install', (event) => {
    console.log('⚡ SW V3: Installing ultra-optimized service worker');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('✅ SW: Caching critical assets');
                return cache.addAll(CRITICAL_ASSETS);
            })
            .then(() => {
                console.log('✅ SW: Install complete');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('❌ SW: Install failed:', error);
            })
    );
});

// ♻️ ACTIVATE - Cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('⚡ SW V3: Activating');
    
    event.waitUntil(
        Promise.all([
            // Delete old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ SW: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all pages immediately
            self.clients.claim()
        ]).then(() => {
            console.log('✅ SW: Activation complete');
        })
    );
});

// 🌐 FETCH - Ultra-aggressive caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Only handle GET requests
    if (request.method !== 'GET') return;
    
    // Skip Chrome extensions
    if (url.protocol === 'chrome-extension:') return;
    
    // External CDN - network only (browser caches these)
    if (url.origin !== location.origin) {
        event.respondWith(fetch(request));
        return;
    }
    
    // Our assets - cache first
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) {
                    // Return cached, update in background
                    updateCacheInBackground(request);
                    return cached;
                }
                
                // Not cached, fetch and cache
                return fetch(request)
                    .then(response => {
                        if (response && response.status === 200) {
                            const cacheName = isCriticalAsset(request.url) ? STATIC_CACHE : DYNAMIC_CACHE;
                            cacheResponse(cacheName, request, response.clone());
                        }
                        return response;
                    });
            })
            .catch(error => {
                console.error('❌ SW: Fetch failed:', error);
                return offlineFallback();
            })
    );
});

/**
 * Check if asset is critical
 */
function isCriticalAsset(url) {
    return CRITICAL_ASSETS.some(asset => url.includes(asset));
}

/**
 * Cache response with size limit
 */
async function cacheResponse(cacheName, request, response) {
    try {
        const cache = await caches.open(cacheName);
        
        // Add to cache
        await cache.put(request, response);
        
        // Cleanup if dynamic cache is too large
        if (cacheName === DYNAMIC_CACHE) {
            await limitCacheSize(cache, MAX_CACHE_SIZE);
        }
    } catch (error) {
        console.error('❌ SW: Cache failed:', error);
    }
}

/**
 * Limit cache size (delete oldest)
 */
async function limitCacheSize(cache, maxSize) {
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
        // Delete oldest entries
        const toDelete = keys.length - maxSize;
        for (let i = 0; i < toDelete; i++) {
            await cache.delete(keys[i]);
        }
    }
}

/**
 * Update cache in background (stale-while-revalidate)
 */
function updateCacheInBackground(request) {
    fetch(request)
        .then(response => {
            if (response && response.status === 200) {
                const cacheName = isCriticalAsset(request.url) ? STATIC_CACHE : DYNAMIC_CACHE;
                caches.open(cacheName).then(cache => {
                    cache.put(request, response);
                });
            }
        })
        .catch(() => {}); // Silently fail
}

/**
 * Offline fallback page
 */
function offlineFallback() {
    return new Response(
        `<!DOCTYPE html>
        <html lang="cs">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - Portfolio Manager</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem;
                }
                .container {
                    text-align: center;
                    max-width: 500px;
                }
                .icon {
                    font-size: 5rem;
                    margin-bottom: 1rem;
                    animation: pulse 2s ease-in-out infinite;
                }
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }
                p {
                    font-size: 1.2rem;
                    opacity: 0.9;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .button {
                    display: inline-block;
                    padding: 1rem 2rem;
                    background: white;
                    color: #667eea;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: transform 0.2s;
                }
                .button:hover {
                    transform: scale(1.05);
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">📡</div>
                <h1>Offline Režim</h1>
                <p>
                    Aplikace není momentálně dostupná.<br>
                    Připojte se k internetu a zkuste to znovu.
                </p>
                <a href="./" class="button" onclick="location.reload()">Zkusit znovu</a>
            </div>
        </body>
        </html>`,
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store'
            })
        }
    );
}

// 📨 MESSAGES - Handle commands from app
self.addEventListener('message', (event) => {
    const { action, data } = event.data;
    
    switch (action) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_URLS':
            // Cache additional URLs
            if (data && data.urls) {
                caches.open(DYNAMIC_CACHE).then(cache => {
                    cache.addAll(data.urls).catch(error => {
                        console.error('❌ SW: Failed to cache URLs:', error);
                    });
                });
            }
            break;
            
        case 'CLEAR_CACHE':
            // Clear all caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(name => caches.delete(name))
                );
            }).then(() => {
                console.log('✅ SW: All caches cleared');
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'GET_CACHE_SIZE':
            // Return cache size
            Promise.all([
                caches.open(STATIC_CACHE).then(cache => cache.keys()),
                caches.open(DYNAMIC_CACHE).then(cache => cache.keys())
            ]).then(([staticKeys, dynamicKeys]) => {
                event.ports[0].postMessage({
                    static: staticKeys.length,
                    dynamic: dynamicKeys.length,
                    total: staticKeys.length + dynamicKeys.length
                });
            });
            break;
    }
});

// 🔄 BACKGROUND SYNC - For offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Implement data sync when back online
    console.log('🔄 SW: Syncing data...');
}

// 📬 PUSH NOTIFICATIONS - Handle push messages
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'Nová notifikace',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        data: data
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Portfolio Manager', options)
    );
});

// 🖱️ NOTIFICATION CLICK - Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || './')
    );
});

console.log('✅ SW V3: Service Worker loaded and ready');
