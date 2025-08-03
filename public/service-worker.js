/**
 * Service Worker for AI CMS
 * 
 * Provides offline functionality, error handling, and sync capabilities
 * for the chess puzzle system.
 */

const CACHE_NAME = 'chess-trainer-v1';
const OFFLINE_URL = '/offline.html';
const API_CACHE_NAME = 'chess-trainer-api-v1';

// Resources to cache for offline use
const STATIC_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  // Chess piece images and board assets would be added here
];

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  /^\/puzzles\//,
  /^\/lessons\//,
  /^\/api\/puzzles/,
  /^\/api\/lessons/
];

// Queue for storing failed requests while offline
let syncQueue = [];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('[SW] Static resources cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Background sync for queued actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'chess-trainer-sync') {
    event.waitUntil(processSyncQueue());
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'QUEUE_ACTION':
      queueAction(data);
      break;
    case 'GET_QUEUE_SIZE':
      event.ports[0].postMessage({ queueSize: syncQueue.length });
      break;
    case 'CLEAR_QUEUE':
      syncQueue = [];
      event.ports[0].postMessage({ success: true });
      break;
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Helper functions

function isAPIRequest(url) {
  return CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } else {
      throw new Error('Network response not ok');
    }
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', request.url);
    
    // Try cache if network fails
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Add header to indicate this is cached data
      const response = cachedResponse.clone();
      response.headers.set('X-Chess-Trainer-Cached', 'true');
      return response;
    }
    
    // Return error response if both network and cache fail
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'This content is not available offline',
        cached: false
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'X-Chess-Trainer-Offline': 'true'
        }
      }
    );
  }
}

async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, serving offline page');
    
    // Serve offline page if network fails
    const cache = await caches.open(CACHE_NAME);
    const offlineResponse = await cache.match(OFFLINE_URL);
    
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback if offline page not cached
    return new Response(
      getOfflineHTML(),
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first for static resources
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Try network if not in cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response for future use
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static resource:', request.url);
    
    // Return a basic 404 response
    return new Response('Resource not available offline', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

function queueAction(actionData) {
  console.log('[SW] Queueing action for sync:', actionData);
  
  syncQueue.push({
    ...actionData,
    timestamp: Date.now(),
    id: generateId()
  });
  
  // Request background sync
  self.registration.sync.register('chess-trainer-sync')
    .catch(error => {
      console.error('[SW] Failed to register sync:', error);
    });
}

async function processSyncQueue() {
  console.log('[SW] Processing sync queue, items:', syncQueue.length);
  
  const processedItems = [];
  
  for (const item of syncQueue) {
    try {
      await processQueueItem(item);
      processedItems.push(item);
      console.log('[SW] Successfully processed queue item:', item.id);
    } catch (error) {
      console.error('[SW] Failed to process queue item:', item.id, error);
      
      // Remove items that are too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - item.timestamp > maxAge) {
        processedItems.push(item);
        console.log('[SW] Removing expired queue item:', item.id);
      }
    }
  }
  
  // Remove processed items from queue
  syncQueue = syncQueue.filter(item => !processedItems.includes(item));
  
  // Notify main thread of sync completion
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      processedCount: processedItems.length,
      remainingCount: syncQueue.length
    });
  });
}

async function processQueueItem(item) {
  const { type, data } = item;
  
  switch (type) {
    case 'PUZZLE_PROGRESS':
      return await syncPuzzleProgress(data);
    case 'LESSON_COMPLETION':
      return await syncLessonCompletion(data);
    case 'ERROR_REPORT':
      return await syncErrorReport(data);
    case 'ANALYTICS_EVENT':
      return await syncAnalyticsEvent(data);
    default:
      throw new Error(`Unknown queue item type: ${type}`);
  }
}

async function syncPuzzleProgress(data) {
  const response = await fetch('/api/progress/puzzle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to sync puzzle progress: ${response.status}`);
  }
  
  return response;
}

async function syncLessonCompletion(data) {
  const response = await fetch('/api/progress/lesson', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to sync lesson completion: ${response.status}`);
  }
  
  return response;
}

async function syncErrorReport(data) {
  const response = await fetch('/api/errors/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to sync error report: ${response.status}`);
  }
  
  return response;
}

async function syncAnalyticsEvent(data) {
  const response = await fetch('/api/analytics/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to sync analytics event: ${response.status}`);
  }
  
  return response;
}

async function getCacheStatus() {
  const staticCache = await caches.open(CACHE_NAME);
  const apiCache = await caches.open(API_CACHE_NAME);
  
  const staticKeys = await staticCache.keys();
  const apiKeys = await apiCache.keys();
  
  return {
    staticCacheSize: staticKeys.length,
    apiCacheSize: apiKeys.length,
    queueSize: syncQueue.length,
    cacheNames: [CACHE_NAME, API_CACHE_NAME]
  };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getOfflineHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - AI CMS</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            max-width: 500px;
            padding: 2rem;
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .features {
            margin-top: 2rem;
            text-align: left;
        }
        .feature {
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
        }
        .feature::before {
            content: "♟️";
            margin-right: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📱</div>
        <h1>You're Offline</h1>
        <p>Don't worry! You can still access cached puzzles and continue your chess training while offline.</p>
        
        <button onclick="window.location.reload()">Try Again</button>
        
        <div class="features">
            <div class="feature">Practice with cached puzzles</div>
            <div class="feature">Review completed lessons</div>
            <div class="feature">Track your progress locally</div>
            <div class="feature">Sync when connection returns</div>
        </div>
    </div>
    
    <script>
        // Auto-retry when connection is restored
        window.addEventListener('online', () => {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
        
        // Show connection status
        if (navigator.onLine) {
            document.querySelector('button').textContent = 'Reload Page';
        }
    </script>
</body>
</html>
  `.trim();
}