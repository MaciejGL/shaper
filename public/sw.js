// Basic service worker for PWA
const CACHE_NAME = 'hypertro-v7' // Increment version to force cache refresh
const urlsToCache = ['/', '/favicons/android-chrome-192x192.png']

self.addEventListener('install', (event) => {
  // Force skip waiting for immediate activation
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add URLs individually to handle failures gracefully
      return Promise.allSettled(
        urlsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Failed to cache ${url}:`, err)
            return null
          }),
        ),
      )
    }),
  )
})

self.addEventListener('activate', (event) => {
  // Clear old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
