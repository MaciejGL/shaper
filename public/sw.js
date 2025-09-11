// Optimized service worker for fast loading
const CACHE_NAME = 'hypertro-fast-v1'

// 🎯 Only the essentials for fast loading
const CRITICAL_CACHE = [
  '/',
  '/fitspace/workout', // Your main entry point
  '/globals.css', // Main CSS
  '/favicons/android-chrome-192x192.png',
]

// Install: Cache critical resources
self.addEventListener('install', (event) => {
  console.log('🚀 SW installing, caching critical assets')
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_CACHE).catch((err) => {
        console.warn('Failed to cache critical assets:', err)
        // Cache individually if bulk fails
        return Promise.allSettled(
          CRITICAL_CACHE.map((url) =>
            cache.add(url).catch((e) => {
              console.warn(`Failed to cache ${url}:`, e)
              return null
            }),
          ),
        )
      })
    }),
  )
})

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  console.log('✅ SW activated')
  event.waitUntil(
    Promise.all([
      // Take control immediately
      self.clients.claim(),

      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      }),
    ]),
  )
})

// 🚀 The magic: Serve from cache first for maximum speed
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (url.origin !== location.origin || request.method !== 'GET') return

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('⚡ Serving from cache:', request.url)
        return cachedResponse
      }

      // Not in cache - fetch from network
      return fetch(request)
        .then((fetchResponse) => {
          // Only cache successful responses
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone()

            // Auto-cache Next.js static assets and critical routes
            if (
              url.pathname.startsWith('/_next/static/') ||
              url.pathname.startsWith('/fitspace/') ||
              url.pathname === '/globals.css'
            ) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone)
              })
            }
          }

          return fetchResponse
        })
        .catch(() => {
          // Fallback for offline scenarios
          if (url.pathname.startsWith('/fitspace/')) {
            return caches.match('/fitspace/workout') // Fallback to main page
          }
          return caches.match('/') // Ultimate fallback
        })
    }),
  )
})
