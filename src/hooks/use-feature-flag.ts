'use client'

import { useEffect, useState } from 'react'

import {
  getFeatureFlag,
  getPostHogInstance,
  isFeatureEnabled,
} from '@/lib/posthog'

export const FEATURE_FLAGS = {
  teams: 'teams-feature',
}

/**
 * Hook to check if a feature flag is enabled
 * @param flagKey - The feature flag key
 * @returns boolean indicating if the feature is enabled
 */
export function useFeatureFlag(
  flagKey: (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS],
): boolean {
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const posthog = getPostHogInstance()

  useEffect(() => {
    if (!posthog) {
      console.warn('PostHog not initialized, feature flag will be false')
      setIsEnabled(false)
      return
    }

    // Check the feature flag
    const enabled = isFeatureEnabled(flagKey)
    setIsEnabled(enabled)

    // Listen for feature flag changes
    const handleFeatureFlagChange = () => {
      const newEnabled = isFeatureEnabled(flagKey)
      setIsEnabled(newEnabled)
    }

    // PostHog doesn't have a direct event listener for feature flag changes
    // So we'll check periodically or on focus
    const interval = setInterval(handleFeatureFlagChange, 30000) // Check every 30 seconds

    const handleFocus = () => {
      handleFeatureFlagChange()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [flagKey, posthog])

  return isEnabled
}

/**
 * Hook to get the value of a feature flag (boolean, string, or undefined)
 * @param flagKey - The feature flag key
 * @returns The feature flag value
 */
export function useFeatureFlagValue(flagKey: string): {
  value: boolean | string | undefined
  isLoading: boolean
} {
  const [value, setValue] = useState<boolean | string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const posthog = getPostHogInstance()
    if (!posthog) {
      setIsLoading(false)
      return
    }

    // Get the feature flag value
    const flagValue = getFeatureFlag(flagKey)
    setValue(flagValue)
    setIsLoading(false)

    // Listen for feature flag changes
    const handleFeatureFlagChange = () => {
      const newValue = getFeatureFlag(flagKey)
      setValue(newValue)
    }

    // Check periodically or on focus
    const interval = setInterval(handleFeatureFlagChange, 30000) // Check every 30 seconds

    const handleFocus = () => {
      handleFeatureFlagChange()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [flagKey])

  return { value, isLoading }
}

/**
 * Hook to get multiple feature flags at once
 * @param flagKeys - Array of feature flag keys
 * @returns Object with feature flag values
 */
export function useFeatureFlags(flagKeys: string[]): {
  flags: Record<string, boolean | string | undefined>
  isLoading: boolean
} {
  const [flags, setFlags] = useState<
    Record<string, boolean | string | undefined>
  >({})
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const posthog = getPostHogInstance()
    if (!posthog) {
      setIsLoading(false)
      return
    }

    // Get all feature flag values
    const flagValues: Record<string, boolean | string | undefined> = {}
    flagKeys.forEach((key) => {
      flagValues[key] = getFeatureFlag(key)
    })
    setFlags(flagValues)
    setIsLoading(false)

    // Listen for feature flag changes
    const handleFeatureFlagChange = () => {
      const newFlags: Record<string, boolean | string | undefined> = {}
      flagKeys.forEach((key) => {
        newFlags[key] = getFeatureFlag(key)
      })
      setFlags(newFlags)
    }

    // Check periodically or on focus
    const interval = setInterval(handleFeatureFlagChange, 30000) // Check every 30 seconds

    const handleFocus = () => {
      handleFeatureFlagChange()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [flagKeys])

  return { flags, isLoading }
}
