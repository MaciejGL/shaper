'use client'

import { useEffect, useRef, useState } from 'react'

import { useUser } from '@/context/user-context'
import { identifyUser, resetUser } from '@/lib/posthog'

/**
 * Enhanced hook that automatically manages PostHog user identification
 * with detailed user profile information from the database
 */
export function usePostHogUserEnhanced() {
  const { session, user } = useUser()
  const status = session.status
  const lastUserIdRef = useRef<string | null>(null)
  const [hasIdentified, setHasIdentified] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      return // Wait for session to load
    }

    if (process.env.NODE_ENV !== 'production') {
      return
    }

    if (status === 'authenticated' && user?.email) {
      const userId = user.email

      // Only identify if it's a different user or first time
      if (lastUserIdRef.current !== userId || !hasIdentified) {
        // Build comprehensive user properties
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userProperties: Record<string, any> = {
          email: user.email,
          session_start: new Date().toISOString(),
        }

        // Add basic session properties
        if (user.name) {
          userProperties.name = user.name
          userProperties.first_name = user.profile?.firstName
          userProperties.last_name = user.profile?.lastName
          userProperties.full_name =
            `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim()
        }

        // Add detailed user properties from GraphQL data
        if (user) {
          userProperties.user_id = user.id
          userProperties.user_role = user.role
          userProperties.created_at = user.createdAt
          userProperties.updated_at = user.updatedAt

          // Add profile information
          if (user.profile) {
            const profile = user.profile
            userProperties.first_name = profile.firstName
            userProperties.last_name = profile.lastName
            userProperties.full_name =
              `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
            userProperties.phone = profile.phone
            userProperties.birthday = profile.birthday
            userProperties.sex = profile.sex
          }
        }

        // Identify user with PostHog
        identifyUser(userId, userProperties)
        lastUserIdRef.current = userId
        setHasIdentified(true)
      }
    } else if (status === 'unauthenticated') {
      // User is logged out - reset PostHog tracking
      if (lastUserIdRef.current || hasIdentified) {
        resetUser()
        lastUserIdRef.current = null
        setHasIdentified(false)
      }
    }
  }, [user, status, hasIdentified])

  return {
    isAuthenticated: status === 'authenticated',
    userSession: session.data?.user || null,
    user: user || null,
    isLoading: status === 'loading',
    hasIdentified,
  }
}
