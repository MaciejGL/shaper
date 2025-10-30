'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * OAuth Polling Hook
 *
 * Polls the server for OAuth session completion.
 * When session is ready, injects the cookie and reloads the page.
 */
export function useOAuthPolling() {
  const [isPolling, setIsPolling] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const attemptsRef = useRef(0)

  // Maximum polling attempts (30 attempts * 2 seconds = 60 seconds max)
  const MAX_ATTEMPTS = 30
  // Poll every 2 seconds
  const POLL_INTERVAL = 2000

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
    attemptsRef.current = 0
  }, [])

  const checkSession = useCallback(
    async (authCode: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/auth/check-session?auth_code=${authCode}`,
        )

        if (!response.ok) {
          console.error(
            '📱 [OAUTH-POLLING] Check session failed:',
            response.status,
          )
          return false
        }

        const data = await response.json()

        if (data.ready && data.sessionToken) {
          console.info('📱 [OAUTH-POLLING] Session ready! Injecting cookie...')

          // Inject the session cookie
          const cookieName =
            process.env.NODE_ENV === 'production'
              ? '__Secure-next-auth.session-token'
              : 'next-auth.session-token'

          const cookieValue = `${cookieName}=${data.sessionToken}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`

          document.cookie = cookieValue

          console.info('📱 [OAUTH-POLLING] Cookie injected, reloading page...')

          // Clean up localStorage
          localStorage.removeItem('pending_auth_code')

          // Reload page to activate session
          window.location.reload()

          return true
        }

        return false
      } catch (error) {
        console.error('📱 [OAUTH-POLLING] Error checking session:', error)
        return false
      }
    },
    [],
  )

  const startPolling = useCallback(
    (authCode: string) => {
      console.info('📱 [OAUTH-POLLING] Starting polling for auth code:', {
        authCode: authCode.substring(0, 8) + '...',
      })

      setIsPolling(true)
      attemptsRef.current = 0

      // Check immediately
      checkSession(authCode).then((ready) => {
        if (ready) {
          stopPolling()
          return
        }
      })

      // Then poll at intervals
      pollingIntervalRef.current = setInterval(async () => {
        attemptsRef.current++

        console.info(
          `📱 [OAUTH-POLLING] Poll attempt ${attemptsRef.current}/${MAX_ATTEMPTS}`,
        )

        if (attemptsRef.current >= MAX_ATTEMPTS) {
          console.warn('📱 [OAUTH-POLLING] Max attempts reached, stopping')
          stopPolling()
          // Clean up localStorage
          localStorage.removeItem('pending_auth_code')
          return
        }

        const ready = await checkSession(authCode)
        if (ready) {
          stopPolling()
        }
      }, POLL_INTERVAL)
    },
    [checkSession, stopPolling],
  )

  // Resume polling if page was refreshed with pending auth
  useEffect(() => {
    const pendingAuthCode = localStorage.getItem('pending_auth_code')
    if (pendingAuthCode && !isPolling) {
      console.info('📱 [OAUTH-POLLING] Resuming polling after page load')
      startPolling(pendingAuthCode)
    }

    // Cleanup on unmount
    return () => {
      stopPolling()
    }
  }, [startPolling, stopPolling, isPolling])

  return {
    startPolling,
    stopPolling,
    isPolling,
  }
}
