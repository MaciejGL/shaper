'use client'

import { useEffect, useRef, useState } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'
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
  const { isNativeApp, platform: mobilePlatform } = useMobileApp()
  useEffect(() => {
    if (status === 'loading') {
      return // Wait for session to load
    }

    if (process.env.NODE_ENV !== 'production') {
      if (status === 'authenticated' && user?.id) {
        // Determine platform
        let platform: 'ios' | 'android' | 'web' = 'web'
        if (isNativeApp) {
          platform = mobilePlatform === 'ios' ? 'ios' : 'android'
        }

        // Avoid PII in dev: use internal user id as distinctId, set only minimal props
        const devDistinctId = `dev:${user.id}`
        identifyUser(devDistinctId, {
          userId: user.id,
          role: user.role,
          platform,
        })
        lastUserIdRef.current = devDistinctId
        setHasIdentified(true)
      }
      return
    }

    if (status === 'authenticated' && user?.id) {
      const distinctId = user.id

      // Determine platform
      let platform: 'ios' | 'android' | 'web' = 'web'
      if (isNativeApp) {
        platform = mobilePlatform === 'ios' ? 'ios' : 'android'
      }

      // Only identify if it's a different user or first time
      if (lastUserIdRef.current !== distinctId || !hasIdentified) {
        // Simple user properties - just ID and email
        const userProperties = {
          userId: user.id,
          email: user.email,
          name: user.name,
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName,
          role: user.role,
          platform,
        }

        // Identify user with PostHog using internal user id
        identifyUser(distinctId, userProperties)
        lastUserIdRef.current = distinctId
        setHasIdentified(true)
      }
    } else if (status === 'unauthenticated') {
      // User is logged out - reset PostHog tracking and clear any cached data
      if (lastUserIdRef.current || hasIdentified) {
        resetUser()
        lastUserIdRef.current = null
        setHasIdentified(false)

        // Clear any localStorage items that might cause auth state conflicts
        try {
          // Clear NextAuth session storage
          const nextAuthKeys = Object.keys(localStorage).filter(
            (key) =>
              key.startsWith('next-auth') ||
              key.startsWith('__Secure-next-auth') ||
              key.includes('session'),
          )
          nextAuthKeys.forEach((key) => localStorage.removeItem(key))
        } catch (error) {
          // Ignore localStorage errors
          console.error('Storage cleanup error (safe to ignore):', error)
        }
      }
    }
  }, [user, status, hasIdentified, isNativeApp, mobilePlatform])

  return {
    isAuthenticated: status === 'authenticated',
    userSession: session.data?.user || null,
    user: user || null,
    isLoading: status === 'loading',
    hasIdentified,
  }
}
