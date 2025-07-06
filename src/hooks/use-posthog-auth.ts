'use client'

import { useCallback } from 'react'

import { identifyUser, resetUser } from '@/lib/posthog'

/**
 * Hook for handling PostHog authentication events
 * Use this to manually trigger user identification and logout events
 */
export function usePostHogAuth() {
  /**
   * Identify user with PostHog when they log in
   * Call this after successful login
   */
  const identifyUserOnLogin = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userEmail: string, additionalProperties?: Record<string, any>) => {
      const userProperties = {
        email: userEmail,
        login_timestamp: new Date().toISOString(),
        ...additionalProperties,
      }

      identifyUser(userEmail, userProperties)
    },
    [],
  )

  /**
   * Reset user tracking when they log out
   * Call this before or after logout
   */
  const resetUserOnLogout = useCallback(() => {
    resetUser()
  }, [])

  return {
    identifyUserOnLogin,
    resetUserOnLogout,
  }
}
