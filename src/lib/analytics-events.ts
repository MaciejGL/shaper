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

  // Auth / signup funnel
  AUTH_LANDING_CTA_CLICK: 'auth_landing_cta_click',
  AUTH_OAUTH_CLICK: 'auth_oauth_click',
  AUTH_OTP_REQUEST_ERROR: 'auth_otp_request_error',
  AUTH_OTP_VERIFY_SUCCESS: 'auth_otp_verify_success',
  AUTH_OTP_VERIFY_ERROR: 'auth_otp_verify_error',

  // App download
  APP_STORE_CLICK: 'app_store_click',
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

type AuthLandingCta = 'hero' | 'cta_section'
type AuthOauthProvider = 'google' | 'apple'

type AuthLandingCtaClickProperties = Record<string, unknown> & {
  cta: AuthLandingCta
}

type AuthOauthClickProperties = Record<string, unknown> & {
  provider: AuthOauthProvider
}

type AuthOtpRequestErrorProperties = Record<string, unknown> & {
  email_domain: string | null
  reason: 'network' | 'validation' | 'unknown'
}

type AuthOtpVerifyErrorProperties = Record<string, unknown> & {
  reason: 'invalid_otp' | 'expired' | 'no_session' | 'missing_credentials'
}

type AppStoreClickSource =
  | 'download_page'
  | 'hero'
  | 'account_management'
  | 'push_settings'

type AppStoreClickProperties = Record<string, unknown> & {
  store: 'ios' | 'android'
  source: AppStoreClickSource
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

  authLandingCtaClick: (properties: AuthLandingCtaClickProperties) => {
    captureEvent(ANALYTICS_EVENTS.AUTH_LANDING_CTA_CLICK, properties)
  },

  authOauthClick: (properties: AuthOauthClickProperties) => {
    captureEvent(ANALYTICS_EVENTS.AUTH_OAUTH_CLICK, properties)
  },

  authOtpRequestError: (properties: AuthOtpRequestErrorProperties) => {
    captureEvent(ANALYTICS_EVENTS.AUTH_OTP_REQUEST_ERROR, properties)
  },

  authOtpVerifySuccess: () => {
    captureEvent(ANALYTICS_EVENTS.AUTH_OTP_VERIFY_SUCCESS)
  },

  authOtpVerifyError: (properties: AuthOtpVerifyErrorProperties) => {
    captureEvent(ANALYTICS_EVENTS.AUTH_OTP_VERIFY_ERROR, properties)
  },

  appStoreClick: (properties: AppStoreClickProperties) => {
    captureEvent(ANALYTICS_EVENTS.APP_STORE_CLICK, properties)
  },
}
