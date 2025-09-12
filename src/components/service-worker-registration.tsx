'use client'

import { useEffect } from 'react'

/**
 * Mobile-optimized Service Worker Registration
 * Handles Android Chrome compatibility issues
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Wait for page load to avoid blocking mobile performance
      const registerSW = async () => {
        try {
          // Mobile-specific registration with error handling
          const registration = await navigator.serviceWorker.register(
            '/sw.js',
            {
              scope: '/',
              // Mobile optimization: update on reload
              updateViaCache: 'none',
            },
          )

          console.log(
            '✅ SW registered successfully, scope:',
            registration.scope,
          )

          // Mobile-safe update checking (less aggressive than desktop)
          const checkForUpdates = () => {
            if (registration && registration.update) {
              registration.update().catch((error: unknown) => {
                console.warn('SW update check failed:', error)
              })
            }
          }

          // Check for updates less frequently on mobile (every 2 hours)
          setInterval(checkForUpdates, 2 * 60 * 60 * 1000)

          // Handle registration updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              console.log('🔄 New SW version installing...')
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  console.log('✅ New SW version ready')
                }
              })
            }
          })
        } catch (error: unknown) {
          console.error('❌ SW registration failed:', error)

          // Mobile-specific error handling
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          if (
            errorMessage.includes('quota') ||
            errorMessage.includes('storage')
          ) {
            console.warn('📱 Storage quota exceeded on mobile device')
          }
        }
      }

      // Register after a short delay to not block mobile rendering
      setTimeout(registerSW, 100)

      // Mobile-optimized message listener
      const handleSWMessage = (event: MessageEvent) => {
        try {
          if (event.data && event.data.type === 'SW_UPDATED') {
            console.log('🚀 New app version available:', event.data.version)

            // Enhanced mobile detection
            const isMobileApp =
              window.nativeApp ||
              window.ReactNativeWebView ||
              navigator.userAgent.includes('Expo') ||
              /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
              )

            if (isMobileApp) {
              // Mobile: Don't auto-reload (causes crashes)
              console.log(
                '📱 Mobile environment detected, skipping auto-reload',
              )

              // Optional: Show a subtle notification instead
              // You could trigger a toast here if desired
            } else {
              // Desktop: Safe to reload
              console.log('🖥️ Desktop browser, performing reload')
              window.location.reload()
            }
          }
        } catch (error: unknown) {
          console.error('SW message handling failed:', error)
        }
      }

      navigator.serviceWorker.addEventListener('message', handleSWMessage)

      // Mobile error recovery
      navigator.serviceWorker.addEventListener('error', (error: Event) => {
        console.error('SW error:', error)
      })

      // Cleanup
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage)
      }
    }
  }, [])

  return null // No UI, just registration logic
}
