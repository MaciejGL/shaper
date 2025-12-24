import { captureEvent } from '@/lib/posthog'

/**
 * Centralized analytics events for the application.
 * All event names and their typed properties are defined here.
 */

// ============================================================================
// Today's Workout Empty State Events
// ============================================================================

export const ANALYTICS_EVENTS = {
  // Today's workout empty state
  TODAY_EMPTY_START_PLAN_TAP: 'today_empty_start_plan_tap',
  TODAY_EMPTY_QUICK_WORKOUT_TAP: 'today_empty_quick_workout_tap',
  TODAY_EMPTY_BUILD_OWN_TAP: 'today_empty_build_own_tap',
  TODAY_EMPTY_MY_PLANS_TAP: 'today_empty_my_plans_tap',
} as const

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

// ============================================================================
// Event Property Types
// ============================================================================

type TodayEmptyStateEventProperties = Record<string, unknown> & {
  day_of_week: number
  has_custom_plans: boolean
}

// ============================================================================
// Event Tracking Functions
// ============================================================================

export const analyticsEvents = {
  /**
   * Track when user taps "Start a training plan" on empty workout screen
   */
  todayEmptyStartPlanTap: (properties: TodayEmptyStateEventProperties) => {
    captureEvent(ANALYTICS_EVENTS.TODAY_EMPTY_START_PLAN_TAP, properties)
  },

  /**
   * Track when user taps "Quick workout" on empty workout screen
   */
  todayEmptyQuickWorkoutTap: (properties: TodayEmptyStateEventProperties) => {
    captureEvent(ANALYTICS_EVENTS.TODAY_EMPTY_QUICK_WORKOUT_TAP, properties)
  },

  /**
   * Track when user taps "Build my own workout" on empty workout screen
   */
  todayEmptyBuildOwnTap: (properties: TodayEmptyStateEventProperties) => {
    captureEvent(ANALYTICS_EVENTS.TODAY_EMPTY_BUILD_OWN_TAP, properties)
  },

  /**
   * Track when user taps "My plans" on empty workout screen
   */
  todayEmptyMyPlansTap: (properties: TodayEmptyStateEventProperties) => {
    captureEvent(ANALYTICS_EVENTS.TODAY_EMPTY_MY_PLANS_TAP, properties)
  },
}
