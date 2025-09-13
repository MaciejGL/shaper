'use client'

import { useEffect } from 'react'

/**
 * Production-safe Service Worker Registration
 * Conservative approach used by major apps - static assets only
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Skip service worker in development to avoid HMR conflicts
    if (process.env.NODE_ENV === 'development') {
      return
    }

    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          // Simple registration - no complex mobile detection needed
          const registration = await navigator.serviceWorker.register(
            '/sw.js',
            {
              scope: '/', // Still full scope but SW is selective
            },
          )

          console.info(
            '✅ SW registered (production-safe):',
            registration.scope,
          )

          // Simple update check - no aggressive polling
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              console.info('🔄 SW update found')
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  console.info('✅ SW updated and ready')
                  // No auto-reload - let user navigate naturally
                }
              })
            }
          })
        } catch (error: unknown) {
          console.error('❌ SW registration failed:', error)
          // Fail silently - app works fine without SW
        }
      }

      // Register immediately - no complex mobile delays
      registerSW()
    }
  }, [])

  return null // No UI, just registration logic
}
