/**
 * Subscription Configuration Constants
 *
 * Client-safe subscription config values.
 * For server-side config with Prisma types, use @/lib/stripe/config.ts
 */

export const SUBSCRIPTION_CONFIG = {
  /** Trial period duration in days */
  TRIAL_PERIOD_DAYS: 7,

  /** Grace period after failed payment in days */
  GRACE_PERIOD_DAYS: 3,
} as const
