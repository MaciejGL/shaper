'use client'

import { PostHog } from 'posthog-js'
import { useEffect, useState } from 'react'

import { getPostHogInstance } from '@/lib/posthog'

export const FEATURE_FLAGS = {
  teams: 'teams-feature',
  trainersService: 'trainers-service',
}

/**
 * Simple hook to check if a feature flag is enabled
 * Uses PostHog's onFeatureFlags callback to wait for flags to load
 * @param flagKey - The feature flag key
 * @returns object with isEnabled boolean and isLoading boolean
 */
export function useFeatureFlag(
  flagKey: (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS],
): { isEnabled: boolean; isLoading: boolean } {
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let removeListener: (() => void) | undefined

    // Function to check and update the feature flag value
    const updateFeatureFlag = (posthogInstance: PostHog) => {
      const enabled = posthogInstance.isFeatureEnabled(flagKey) ?? false
      setIsEnabled(enabled)
      setIsLoading(false)
    }

    // Function to wait for PostHog to initialize and then set up feature flag listener
    const waitForPostHog = () => {
      const posthog = getPostHogInstance()

      if (posthog) {
        // PostHog is ready, set up the feature flag listener
        removeListener = posthog.onFeatureFlags(() =>
          updateFeatureFlag(posthog),
        )

        // Also check immediately in case flags are already loaded
        updateFeatureFlag(posthog)
      } else {
        // PostHog not ready yet, check again in 100ms
        timeoutId = setTimeout(waitForPostHog, 100)
      }
    }

    // Start waiting for PostHog
    waitForPostHog()

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (removeListener) {
        removeListener()
      }
    }
  }, [flagKey])

  return { isEnabled, isLoading }
}
