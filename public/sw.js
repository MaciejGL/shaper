// Production-safe service worker - static assets only (like Twitter, Instagram)
// VERSION: Update this when you deploy to force cache invalidation
const CACHE_VERSION = 'v5' // Conservative approach
const STATIC_CACHE_NAME = `hypertro-static-${CACHE_VERSION}`

// 🎯 Only cache static assets that rarely change
const STATIC_ASSETS = [
  '/favicons/android-chrome-192x192.png',
  '/favicons/apple-touch-icon.png',
  '/favicons/favicon.ico',
]

// Install: Cache only essential static assets
self.addEventListener('install', (event) => {
  self.skipWaiting()

  const cacheStaticAssets = async () => {
    try {
      const cache = await caches.open(STATIC_CACHE_NAME)
      await cache.addAll(STATIC_ASSETS)
    } catch {
      // Don't fail installation - app works fine without cached icons
    }
  }

  event.waitUntil(cacheStaticAssets())
})

// Activate: Clean old caches only
self.addEventListener('activate', (event) => {
  const cleanup = async () => {
    try {
      await self.clients.claim()

      // Clean old static caches only
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith('hypertro-static-') && name !== STATIC_CACHE_NAME,
          )
          .map((name) => {
            return caches.delete(name)
          }),
      )
    } catch {}
  }

  event.waitUntil(cleanup())
})

// 🎯 Conservative fetch strategy - static assets only
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests for static assets
  if (url.origin !== location.origin || request.method !== 'GET') return

  // 🔥 ONLY intercept static assets - let pages go direct to network
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') || // Next.js static files
    url.pathname.startsWith('/favicons/') || // App icons
    url.pathname.endsWith('.css') || // Stylesheets
    url.pathname.endsWith('.js') || // JavaScript
    url.pathname.endsWith('.png') || // Images
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.webp')

  // ⚡ Let ALL pages bypass service worker (mobile-safe)
  if (!isStaticAsset) {
    return // Browser handles normally
  }

  // Handle static assets with simple cache-first
  event.respondWith(handleStaticAsset(request))
})

// Simple cache-first for static assets only
const handleStaticAsset = async (request) => {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME)
    const cached = await cache.match(request)

    if (cached) {
      return cached
    }

    // Fetch and cache static asset
    const response = await fetch(request)
    if (response && response.status === 200) {
      const responseClone = response.clone()
      await cache.put(request, responseClone)
    }

    return response
  } catch (error) {
    // For static assets, just let it fail naturally
    // Don't try to serve offline pages for missing images/CSS
    throw error
  }
}

// Minimal message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
