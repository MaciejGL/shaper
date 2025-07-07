import { useCallback } from 'react'

import {
  captureEvent,
  capturePageView,
  identifyUser,
  resetUser,
} from '@/lib/posthog'

/**
 * Hook for PostHog event tracking
 * Provides convenient methods for tracking events, identifying users, and page views
 */
export function usePostHogTracking() {
  /**
   * Track a custom event
   * @param eventName - Name of the event to track
   * @param properties - Optional properties to include with the event
   */
  const trackEvent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventName: string, properties?: Record<string, any>) => {
      captureEvent(eventName, properties)
    },
    [],
  )

  /**
   * Track a page view (useful for manual tracking)
   * @param path - Optional path to track (defaults to current URL)
   */
  const trackPageView = useCallback((path?: string) => {
    capturePageView(path)
  }, [])

  /**
   * Identify a user with PostHog
   * @param userId - Unique identifier for the user
   * @param properties - Optional user properties
   */
  const identifyUserWithPostHog = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userId: string, properties?: Record<string, any>) => {
      identifyUser(userId, properties)
    },
    [],
  )

  /**
   * Reset the user (useful for logout)
   */
  const resetUserTracking = useCallback(() => {
    resetUser()
  }, [])

  /**
   * Track workout-related events
   */
  const trackWorkoutEvent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventType: string, workoutData?: Record<string, any>) => {
      captureEvent(`workout_${eventType}`, {
        ...workoutData,
        timestamp: new Date().toISOString(),
      })
    },
    [],
  )

  /**
   * Track training plan events
   */
  const trackTrainingPlanEvent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (eventType: string, planData?: Record<string, any>) => {
      captureEvent(`training_plan_${eventType}`, {
        ...planData,
        timestamp: new Date().toISOString(),
      })
    },
    [],
  )

  /**
   * Track user interaction events
   */
  const trackUserInteraction = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (action: string, context?: Record<string, any>) => {
      captureEvent('user_interaction', {
        action,
        ...context,
        timestamp: new Date().toISOString(),
      })
    },
    [],
  )

  /**
   * Track feature usage
   */
  const trackFeatureUsage = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (featureName: string, usage?: Record<string, any>) => {
      captureEvent('feature_usage', {
        feature: featureName,
        ...usage,
        timestamp: new Date().toISOString(),
      })
    },
    [],
  )

  /**
   * Track navigation events
   */
  const trackNavigation = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (from: string, to: string, context?: Record<string, any>) => {
      captureEvent('navigation', {
        from,
        to,
        ...context,
        timestamp: new Date().toISOString(),
      })
    },
    [],
  )

  /**
   * Track performance metrics
   */
  const trackPerformance = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (metric: string, value: number, context?: Record<string, any>) => {
      captureEvent('performance_metric', {
        metric,
        value,
        ...context,
        timestamp: new Date().toISOString(),
      })
    },
    [],
  )

  return {
    trackEvent,
    trackPageView,
    identifyUser: identifyUserWithPostHog,
    resetUser: resetUserTracking,
    trackWorkoutEvent,
    trackTrainingPlanEvent,
    trackUserInteraction,
    trackFeatureUsage,
    trackNavigation,
    trackPerformance,
  }
}

export default usePostHogTracking
