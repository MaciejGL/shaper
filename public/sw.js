// Basic service worker for PWA
const CACHE_NAME = 'fitspace-v2' // Increment version
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicons/android-chrome-192x192.png',
]

self.addEventListener('install', (event) => {
  // Force skip waiting for immediate activation
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
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

// Push notification handlers
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/favicons/android-chrome-192x192.png',
      badge: data.badge || '/favicons/android-chrome-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || '/',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  // Only log in development mode
  if (self.location.hostname === 'localhost') {
    console.log('Notification click received.')
  }
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})
