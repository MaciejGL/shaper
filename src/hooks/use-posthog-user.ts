'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

import { identifyUser, resetUser } from '@/lib/posthog'

/**
 * Hook that automatically manages PostHog user identification
 * based on the NextAuth session state
 */
export function usePostHogUser() {
  const { data: session, status } = useSession()
  const lastUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (status === 'loading') {
      return // Wait for session to load
    }

    if (status === 'authenticated' && session?.user?.email) {
      // User is logged in - identify them with PostHog
      const userId = session.user.email

      // Only identify if it's a different user or first time
      if (lastUserIdRef.current !== userId) {
        // Get additional user properties if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userProperties: Record<string, any> = {
          email: session.user.email,
          session_start: new Date().toISOString(),
        }

        // Add user properties if available from the session
        if (session.user.name) {
          userProperties.name = session.user.name
        }

        if (session.user.image) {
          userProperties.avatar = session.user.image
        }

        // Identify user with PostHog
        identifyUser(userId, userProperties)
        lastUserIdRef.current = userId
      }
    } else if (status === 'unauthenticated') {
      // User is logged out - reset PostHog tracking
      if (lastUserIdRef.current) {
        resetUser()
        lastUserIdRef.current = null
      }
    }
  }, [session, status])

  return {
    isAuthenticated: status === 'authenticated',
    user: session?.user || null,
    isLoading: status === 'loading',
  }
}
