// Optimized service worker combining LogRocket best practices with robust error handling
// VERSION: Update this when you deploy to force cache invalidation
const CACHE_VERSION = 'v3' // Bumped for LogRocket optimizations
const CACHE_NAME = `hypertro-fast-${CACHE_VERSION}`

// 🎯 Only the essentials for fast loading (LogRocket approach)
const CRITICAL_CACHE = [
  '/',
  '/fitspace/workout', // Your main entry point
  '/globals.css', // Main CSS
  '/favicons/android-chrome-192x192.png',
]

// Install: Cache critical resources (LogRocket pattern)
self.addEventListener('install', (event) => {
  console.log('🚀 SW installing, caching critical assets')
  self.skipWaiting()

  const preCache = async () => {
    const cache = await caches.open(CACHE_NAME)
    return cache.addAll(CRITICAL_CACHE)
  }

  event.waitUntil(
    preCache().catch((err) => {
      console.warn('Failed to cache critical assets:', err)
      // Cache individually if bulk fails
      return Promise.allSettled(
        CRITICAL_CACHE.map(async (url) => {
          try {
            const cache = await caches.open(CACHE_NAME)
            return cache.add(url)
          } catch (e) {
            console.warn(`Failed to cache ${url}:`, e)
            return null
          }
        }),
      )
    }),
  )
})

// Activate: Clean old caches and force refresh
self.addEventListener('activate', (event) => {
  console.log('✅ SW activated, version:', CACHE_VERSION)
  event.waitUntil(
    Promise.all([
      // Take control immediately
      self.clients.claim(),

      // Clean old caches - CRITICAL for version updates
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

      // 🔄 Notify clients of updates (mobile-safe)
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          console.log('🔄 Notifying client of SW update:', client.url)
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION,
            action: 'reload_recommended',
          })
        })
      }),
    ]),
  )
})

// 🚀 LogRocket-inspired cache strategy with enhanced error handling
const cacheFirstWithNetworkFallback = async (event) => {
  const { request } = event
  const url = new URL(request.url)

  try {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      console.log('⚡ Serving from cache:', url.pathname)
      return cachedResponse
    }

    // Network request with caching (LogRocket pattern)
    console.log('🌐 Fetching from network:', url.pathname)
    const networkResponse = await fetch(request)

    // Only cache successful responses
    if (networkResponse.status === 200) {
      const responseClone = networkResponse.clone()

      // Selective caching based on LogRocket recommendations
      if (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/fitspace/') ||
        url.pathname === '/globals.css' ||
        url.pathname === '/'
      ) {
        try {
          await cache.put(request, responseClone)
          console.log('✅ Cached:', url.pathname)
        } catch (err) {
          console.warn('Failed to cache:', url.pathname, err)
        }
      }
    }

    return networkResponse
  } catch (error) {
    console.warn('Network request failed:', url.pathname, error)

    // Enhanced fallback logic (your improvement over LogRocket)
    const cache = await caches.open(CACHE_NAME)

    if (url.pathname.startsWith('/fitspace/')) {
      // Try to serve the main workout page
      const workoutFallback = await cache.match('/fitspace/workout')
      if (workoutFallback) return workoutFallback

      // If that fails, try root
      const rootFallback = await cache.match('/')
      if (rootFallback) return rootFallback
    }

    if (url.pathname === '/') {
      // For root requests, try to serve the workout page if available
      const workoutFallback = await cache.match('/fitspace/workout')
      if (workoutFallback) return workoutFallback
    }

    // Ultimate fallback - Hypertro-branded offline page matching your design
    return new Response(
      `<!DOCTYPE html>
      <html lang="en" class="">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Hypertro - You're Offline</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          /* Your actual CSS variables from globals.css */
          :root {
            --radius: 0.5rem;
            --background: oklch(0.945 0 6.35);
            --foreground: oklch(0.141 0.005 285.823);
            --card: oklch(1 0 0);
            --card-foreground: oklch(0.141 0.005 285.823);
            --primary: oklch(0.21 0.006 285.885);
            --primary-foreground: oklch(0.985 0 0);
            --secondary: oklch(1 0 0);
            --secondary-foreground: oklch(0.21 0.006 285.885);
            --muted: oklch(0.94 0.001 286.375);
            --muted-foreground: oklch(0.552 0.016 285.938);
            --border: oklch(0.92 0.004 286.32);
            --ring: oklch(0.705 0.015 286.067);
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --background: oklch(0.18 0.006 285.885);
              --foreground: oklch(0.985 0 0);
              --card: oklch(0.223 0.006 286.033);
              --card-foreground: oklch(0.985 0 0);
              --primary: oklch(0.92 0.004 286.32);
              --primary-foreground: oklch(0.21 0.006 285.885);
              --secondary: oklch(0.274 0.006 286.033);
              --secondary-foreground: oklch(0.985 0 0);
              --muted: oklch(0.274 0.006 286.033);
              --muted-foreground: oklch(0.705 0.015 286.067);
              --border: oklch(1 0 0 / 10%);
              --ring: oklch(0.552 0.016 285.938);
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--background);
            color: var(--foreground);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            line-height: 1.5;
          }

          .container {
            background-color: var(--card);
            color: var(--card-foreground);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 2rem;
            text-align: center;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          }

          .logo {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, var(--primary), var(--primary));
            border-radius: calc(var(--radius) + 4px);
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 28px;
            color: var(--primary-foreground);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }

          .title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--foreground);
          }

          .subtitle {
            color: var(--muted-foreground);
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
          }

          .message {
            color: var(--muted-foreground);
            margin-bottom: 2rem;
            font-size: 0.875rem;
          }

          .button {
            background-color: var(--primary);
            color: var(--primary-foreground);
            border: none;
            border-radius: var(--radius);
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
          }

          .button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }

          .button:active {
            transform: translateY(0);
          }

          .status-indicator {
            width: 8px;
            height: 8px;
            background-color: var(--muted-foreground);
            border-radius: 50%;
            margin: 0 auto 1rem;
            opacity: 0.6;
          }

          /* PWA-specific styles */
          @media (display-mode: standalone) {
            body {
              padding-top: env(safe-area-inset-top, 1rem);
              padding-bottom: env(safe-area-inset-bottom, 1rem);
            }
          }

          /* Mobile optimization */
          @media (max-width: 480px) {
            .container {
              padding: 1.5rem;
              margin: 1rem;
            }
            
            .logo {
              width: 56px;
              height: 56px;
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">H</div>
          <div class="status-indicator"></div>
          <h1 class="title">You're offline</h1>
          <p class="subtitle">Hypertro</p>
          <p class="message">
            Please check your internet connection and try again. Your workout data is safe and will sync when you're back online.
          </p>
          <button class="button" onclick="window.location.reload()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Try again
          </button>
        </div>
      </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
      },
    )
  }
}

// LogRocket-style fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (url.origin !== location.origin || request.method !== 'GET') return

  // Use the cache-first strategy
  event.respondWith(cacheFirstWithNetworkFallback(event))
})

// Message handling (your enhancement)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Emergency cache clear
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        )
      })
      .then(() => {
        self.registration.unregister()
      })
  }
})
