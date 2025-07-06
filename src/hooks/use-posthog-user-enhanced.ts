'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

import { useTrainerDashboardUserQuery } from '@/generated/graphql-client'
import { identifyUser, resetUser } from '@/lib/posthog'

/**
 * Enhanced hook that automatically manages PostHog user identification
 * with detailed user profile information from the database
 */
export function usePostHogUserEnhanced() {
  const { data: session, status } = useSession()
  const lastUserIdRef = useRef<string | null>(null)
  const [hasIdentified, setHasIdentified] = useState(false)

  // Get detailed user data from GraphQL
  const { data: userData } = useTrainerDashboardUserQuery(
    {},
    {
      enabled: status === 'authenticated' && !!session?.user?.email,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  useEffect(() => {
    if (status === 'loading') {
      return // Wait for session to load
    }

    if (status === 'authenticated' && session?.user?.email) {
      const userId = session.user.email

      // Only identify if it's a different user or first time
      if (lastUserIdRef.current !== userId || !hasIdentified) {
        // Build comprehensive user properties
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userProperties: Record<string, any> = {
          email: session.user.email,
          session_start: new Date().toISOString(),
        }

        // Add basic session properties
        if (session.user.name) {
          userProperties.name = session.user.name
        }

        if (session.user.image) {
          userProperties.avatar = session.user.image
        }

        // Add detailed user properties from GraphQL data
        if (userData?.userWithAllData) {
          const user = userData.userWithAllData

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
            userProperties.activity_level = profile.activityLevel
            userProperties.goals = profile.goals
            userProperties.bio = profile.bio
            userProperties.has_avatar = !!profile.avatarUrl

            // Add body measurements if available
            if (profile.bodyMeasures && profile.bodyMeasures.length > 0) {
              const latestMeasure = profile.bodyMeasures[0] // Assuming first is latest
              userProperties.latest_weight = latestMeasure.weight
              userProperties.chest_measurement = latestMeasure.chest
              userProperties.waist_measurement = latestMeasure.waist
              userProperties.hips_measurement = latestMeasure.hips
              userProperties.body_fat = latestMeasure.bodyFat
              userProperties.last_measurement_date = latestMeasure.measuredAt
            }
          }

          // Add trainer information
          if (user.trainer) {
            userProperties.has_trainer = true
            userProperties.trainer_id = user.trainer.id
            userProperties.trainer_name =
              `${user.trainer.firstName || ''} ${user.trainer.lastName || ''}`.trim() ||
              user.trainer.email
          } else {
            userProperties.has_trainer = false
          }

          // Add client information for trainers
          if (user.role === 'TRAINER' && user.clients) {
            userProperties.client_count = user.clients.length
            userProperties.is_trainer = true
          } else {
            userProperties.is_trainer = false
          }

          // Add session count
          if (user.sessions) {
            userProperties.session_count = user.sessions.length
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
  }, [session, status, userData, hasIdentified])

  return {
    isAuthenticated: status === 'authenticated',
    user: session?.user || null,
    userData: userData?.userWithAllData || null,
    isLoading: status === 'loading',
    hasIdentified,
  }
}
