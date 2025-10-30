'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Mobile Session Restore Component
 *
 * This component runs in the WebView when the user returns from OAuth.
 * It detects the session_token in the URL, injects it as a cookie,
 * and reloads the page to let NextAuth pick it up.
 *
 * This approach works because the web app running in the WebView
 * has full control over its own cookies via document.cookie.
 */
export function MobileSessionRestore() {
  const searchParams = useSearchParams()
  const [isRestoring, setIsRestoring] = useState(false)

  useEffect(() => {
    console.info(
      '🔐 [SESSION-RESTORE] Component mounted, checking for session_token',
    )
    console.info('🔐 [SESSION-RESTORE] Current URL:', window.location.href)
    console.info(
      '🔐 [SESSION-RESTORE] Search params:',
      Array.from(searchParams.entries()),
    )

    // Prevent double execution
    if (isRestoring) {
      console.info('🔐 [SESSION-RESTORE] Already restoring, skipping')
      return
    }

    const sessionToken = searchParams.get('session_token')

    if (!sessionToken) {
      console.info('🔐 [SESSION-RESTORE] No session_token found in URL')
      return // No session token to restore
    }

    setIsRestoring(true)

    console.info(
      '🔐 [SESSION-RESTORE] Found session token in URL, injecting cookie',
    )

    try {
      // Set the NextAuth session cookie
      const cookieName =
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token'

      // Build cookie string with proper attributes
      const cookieValue = `${cookieName}=${sessionToken}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`

      // Inject cookie into WebView
      document.cookie = cookieValue

      console.info(
        '✅ [SESSION-RESTORE] Cookie injected, reloading to activate session',
      )

      // Remove session_token from URL and reload
      // This ensures NextAuth picks up the new cookie
      const url = new URL(window.location.href)
      url.searchParams.delete('session_token')

      // Use window.location.replace for a clean reload without history entry
      window.location.replace(url.toString())
    } catch (error) {
      console.error('❌ [SESSION-RESTORE] Failed to inject cookie:', error)
      setIsRestoring(false)
    }
  }, [searchParams, isRestoring])

  return null // This component doesn't render anything
}
