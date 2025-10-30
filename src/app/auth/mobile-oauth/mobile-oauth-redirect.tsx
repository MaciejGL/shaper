'use client'

import { useEffect } from 'react'

/**
 * Client component that handles auto-redirect to app
 */
export function MobileOAuthRedirect() {
  useEffect(() => {
    // Auto-redirect to app after short delay
    const timer = setTimeout(() => {
      // Simple deep link - just opens the app
      // WebView will be polling for session with auth_code
      const deepLink = 'hypro://'

      console.info('📱 [MOBILE-OAUTH] Redirecting to app')
      window.location.href = deepLink
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return null
}
