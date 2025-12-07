/**
 * Subscription Freeze Configuration
 *
 * Centralized configuration for the subscription pause/freeze feature.
 * Used across product copy, freeze service, and UI components.
 */

export const FREEZE_CONFIG = {
  /** Maximum total pause days allowed per calendar year */
  MAX_DAYS_PER_YEAR: 20,

  /** Minimum days for a single pause */
  MIN_DAYS_PER_PAUSE: 3,

  /** Maximum days for a single pause */
  MAX_DAYS_PER_PAUSE: 14,

  /** Days after trial ends before freeze is available */
  FIRST_MONTH_DAYS: 30,
} as const

export type FreezeConfig = typeof FREEZE_CONFIG
