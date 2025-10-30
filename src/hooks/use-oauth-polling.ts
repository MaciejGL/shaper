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
  const currentAuthCodeRef = useRef<string | null>(null)
  const hasResumedRef = useRef(false) // Prevent multiple auto-resumes

  // Maximum polling attempts (20 attempts * 3 seconds = 60 seconds max)
  const MAX_ATTEMPTS = 20
  // Poll every 3 seconds (reduced spam)
  const POLL_INTERVAL = 3000

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
    attemptsRef.current = 0
    currentAuthCodeRef.current = null
    console.info('📱 [OAUTH-POLLING] Polling stopped')
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
      // Prevent duplicate polling for the same auth code
      if (currentAuthCodeRef.current === authCode && isPolling) {
        console.info(
          '📱 [OAUTH-POLLING] Already polling for this auth code, skipping',
        )
        return
      }

      // Stop any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }

      console.info('📱 [OAUTH-POLLING] Starting polling for auth code:', {
        authCode: authCode.substring(0, 8) + '...',
      })

      currentAuthCodeRef.current = authCode
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
    [checkSession, stopPolling, isPolling],
  )

  // Resume polling if page was refreshed with pending auth (only once)
  useEffect(() => {
    // Only auto-resume once per session
    if (hasResumedRef.current) {
      return
    }

    const pendingAuthCode = localStorage.getItem('pending_auth_code')
    if (pendingAuthCode && !isPolling) {
      console.info('📱 [OAUTH-POLLING] Resuming polling after page load')
      hasResumedRef.current = true
      startPolling(pendingAuthCode)
    }

    // Cleanup on unmount
    return () => {
      stopPolling()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run once on mount

  return {
    startPolling,
    stopPolling,
    isPolling,
  }
}
