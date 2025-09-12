// Mobile-optimized service worker with Android Chrome compatibility
// VERSION: Update this when you deploy to force cache invalidation
const CACHE_VERSION = 'v4' // Bumped for mobile optimizations
const CACHE_NAME = `hypertro-fast-${CACHE_VERSION}`

// 🎯 Reduced cache for mobile memory constraints
const CRITICAL_CACHE = [
  '/',
  '/fitspace/workout', // Your main entry point
  '/favicons/android-chrome-192x192.png',
]

// 📱 Mobile-specific configuration
const MOBILE_CONFIG = {
  maxCacheSize: 50, // Limit cache entries for Android
  networkTimeout: 8000, // 8 seconds max for mobile networks
  retryAttempts: 2, // Limited retries for mobile
}

// 🔧 Utility: Network timeout wrapper for mobile
const fetchWithTimeout = (request, timeout = MOBILE_CONFIG.networkTimeout) => {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout),
    ),
  ])
}

// Install: Cache critical resources with mobile optimizations
self.addEventListener('install', (event) => {
  console.log('🚀 SW installing (mobile-optimized)')
  self.skipWaiting()

  const preCache = async () => {
    try {
      const cache = await caches.open(CACHE_NAME)

      // Cache one by one for better mobile compatibility
      for (const url of CRITICAL_CACHE) {
        try {
          console.log('📥 Caching:', url)
          await cache.add(url)
        } catch (error) {
          console.warn(`Failed to cache ${url}:`, error)
          // Continue with other resources
        }
      }

      console.log('✅ Critical assets cached successfully')
    } catch (error) {
      console.error('Failed to cache critical assets:', error)
      // Don't fail the install, just log the error
    }
  }

  event.waitUntil(preCache())
})

// Activate: Clean old caches with mobile optimizations
self.addEventListener('activate', (event) => {
  console.log('✅ SW activated (mobile-optimized), version:', CACHE_VERSION)

  const activationTasks = async () => {
    try {
      // Take control immediately
      await self.clients.claim()

      // Clean old caches with timeout for mobile
      const cacheNames = await caches.keys()
      const deletePromises = cacheNames
        .filter((cacheName) => cacheName !== CACHE_NAME)
        .map(async (cacheName) => {
          console.log('🗑️ Deleting old cache:', cacheName)
          try {
            await caches.delete(cacheName)
          } catch (error) {
            console.warn('Failed to delete cache:', cacheName, error)
          }
        })

      await Promise.allSettled(deletePromises)

      // 🔄 Notify clients (mobile-safe)
      const clients = await self.clients.matchAll()
      clients.forEach((client) => {
        try {
          console.log('🔄 Notifying client of SW update:', client.url)
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION,
            action: 'reload_recommended',
          })
        } catch (error) {
          console.warn('Failed to message client:', error)
        }
      })
    } catch (error) {
      console.error('Activation failed:', error)
    }
  }

  event.waitUntil(activationTasks())
})

// 🚀 Mobile-optimized cache strategy
const mobileOptimizedCacheStrategy = async (event) => {
  const { request } = event
  const url = new URL(request.url)

  try {
    // Step 1: Try cache first (fastest for mobile)
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      console.log('⚡ Cache hit:', url.pathname)
      return cachedResponse
    }

    // Step 2: Network request with mobile timeout
    console.log('🌐 Network request:', url.pathname)
    const networkResponse = await fetchWithTimeout(request)

    // Step 3: Cache successful responses (selective for mobile)
    if (networkResponse && networkResponse.status === 200) {
      try {
        const responseClone = networkResponse.clone()

        // Only cache essential resources on mobile
        const shouldCache =
          url.pathname.startsWith('/_next/static/') ||
          url.pathname.startsWith('/fitspace/') ||
          url.pathname === '/globals.css' ||
          url.pathname === '/'

        if (shouldCache) {
          // Check cache size before adding (mobile memory management)
          const cacheKeys = await cache.keys()
          if (cacheKeys.length < MOBILE_CONFIG.maxCacheSize) {
            await cache.put(request, responseClone)
            console.log('✅ Cached:', url.pathname)
          } else {
            console.log('⚠️ Cache full, skipping:', url.pathname)
          }
        }
      } catch (cacheError) {
        console.warn('Cache operation failed:', url.pathname, cacheError)
        // Don't fail the request, just log the error
      }
    }

    return networkResponse
  } catch (error) {
    console.warn('Network failed:', url.pathname, error)

    // Enhanced fallback for mobile
    try {
      const cache = await caches.open(CACHE_NAME)

      // Try specific fallbacks
      if (url.pathname.startsWith('/fitspace/')) {
        const fallback = await cache.match('/fitspace/workout')
        if (fallback) return fallback
      }

      if (url.pathname === '/') {
        const fallback = await cache.match('/fitspace/workout')
        if (fallback) return fallback
      }

      // Mobile-optimized offline page
      return new Response(createMobileOfflinePage(), {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
      })
    } catch (fallbackError) {
      console.error('All fallbacks failed:', fallbackError)

      // Last resort: minimal offline response
      return new Response(
        '<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>',
        {
          headers: { 'Content-Type': 'text/html' },
          status: 200,
        },
      )
    }
  }
}

// 📱 Create mobile-optimized offline page
const createMobileOfflinePage = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <title>Hypertro - Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: #1a1a1a;
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      text-align: center;
    }
    .container {
      background: #2a2a2a;
      border-radius: 12px;
      padding: 2rem 1.5rem;
      max-width: 300px;
      width: 100%;
      border: 1px solid #333;
    }
    .logo {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 8px;
      margin: 0 auto 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 20px;
      color: white;
    }
    h1 { 
      font-size: 1.25rem; 
      margin-bottom: 0.5rem; 
      font-weight: 600;
    }
    p { 
      color: #888; 
      font-size: 0.875rem; 
      margin-bottom: 1.5rem; 
      line-height: 1.4;
    }
    button {
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      touch-action: manipulation;
    }
    button:active { background: #3730a3; }
    @media (prefers-color-scheme: light) {
      body { background: #f5f5f5; color: #1a1a1a; }
      .container { background: white; border-color: #e5e5e5; }
      p { color: #666; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">H</div>
    <h1>You're offline</h1>
    <p>Check your connection and try again. Your data is safe.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body>
</html>`
}

// Mobile-optimized fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (url.origin !== location.origin || request.method !== 'GET') return

  // Skip if it's a Chrome extension request (mobile compatibility)
  if (url.protocol === 'chrome-extension:') return

  event.respondWith(mobileOptimizedCacheStrategy(event))
})

// Message handling with mobile error protection
self.addEventListener('message', (event) => {
  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
      // Mobile-safe cache clear
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.allSettled(
            cacheNames.map((cacheName) => caches.delete(cacheName)),
          )
        })
        .then(() => {
          if (self.registration && self.registration.unregister) {
            self.registration.unregister()
          }
        })
        .catch((error) => {
          console.error('Cache clear failed:', error)
        })
    }
  } catch (error) {
    console.error('Message handling failed:', error)
  }
})

// Mobile error handling
self.addEventListener('error', (event) => {
  console.error('SW Error:', event.error || event.message)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('SW Unhandled Rejection:', event.reason)
  event.preventDefault() // Prevent the default handling
})
