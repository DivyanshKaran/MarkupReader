// Service Worker for Documentation Hub PWA
const CACHE_NAME = 'docs-hub-v1';
const STATIC_CACHE = 'docs-hub-static-v1';
const DYNAMIC_CACHE = 'docs-hub-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/vite-react-ts-project/',
  '/vite-react-ts-project/index.html',
  '/vite-react-ts-project/manifest.json',
  '/vite-react-ts-project/icons/icon-192x192.png',
  '/vite-react-ts-project/icons/icon-512x512.png',
  // Add other critical static assets
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }
        
        // Otherwise, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Cache dynamic content
            if (shouldCache(request)) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            
            return networkResponse;
          })
          .catch((error) => {
            console.log('Service Worker: Network request failed', request.url, error);
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/vite-react-ts-project/index.html');
            }
            
            // Return a generic offline response for other requests
            return new Response(
              JSON.stringify({
                error: 'Offline',
                message: 'This content is not available offline'
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'application/json'
                })
              }
            );
          });
      })
  );
});

// Helper function to determine if a request should be cached
function shouldCache(request) {
  const url = new URL(request.url);
  
  // Cache markdown files
  if (url.pathname.endsWith('.md')) {
    return true;
  }
  
  // Cache API responses
  if (url.pathname.startsWith('/api/')) {
    return true;
  }
  
  // Cache images
  if (request.destination === 'image') {
    return true;
  }
  
  // Cache CSS and JS files
  if (request.destination === 'style' || request.destination === 'script') {
    return true;
  }
  
  return false;
}

// Handle background sync (if supported)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync tasks
      doBackgroundSync()
    );
  }
});

// Handle push notifications (if supported)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New content available',
    icon: '/vite-react-ts-project/icons/icon-192x192.png',
    badge: '/vite-react-ts-project/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Content',
        icon: '/vite-react-ts-project/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/vite-react-ts-project/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Documentation Hub', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/vite-react-ts-project/')
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Perform any background sync tasks here
    console.log('Service Worker: Performing background sync');
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}
