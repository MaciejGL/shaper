'use client'

import { useEffect } from 'react'

/**
 * Service Worker Registration Component
 * Following LogRocket Next.js best practices
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker with scope (LogRocket recommendation)
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/', // Can be scoped to '/fitspace' for better performance
        })
        .then((registration) => {
          console.log(
            '✅ SW registered successfully, scope:',
            registration.scope,
          )

          // Check for updates every hour (your enhancement)
          setInterval(
            () => {
              registration.update()
            },
            60 * 60 * 1000,
          ) // 1 hour
        })
        .catch((err) => {
          console.log('❌ SW registration failed:', err)
        })

      // Listen for service worker messages (mobile-safe)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('🚀 New app version available:', event.data.version)

          // Smart reload detection for mobile environments
          const isMobileApp =
            window.nativeApp ||
            window.ReactNativeWebView ||
            navigator.userAgent.includes('Expo')

          if (isMobileApp) {
            // Mobile WebView: Don't auto-reload, let natural navigation handle it
            console.log('📱 Mobile environment detected, skipping auto-reload')
          } else {
            // Desktop browser: Safe to reload
            console.log('🖥️ Desktop browser, performing reload')
            window.location.reload()
          }
        }
      })
    }
  }, [])

  return null // No UI, just registration logic
}
