import { Currency, SubscriptionStatus } from '@/generated/prisma/client'
import { getBaseUrl } from '@/lib/get-base-url'

// Subscription Configuration
export const SUBSCRIPTION_CONFIG = {
  // Trial period duration (7 days)
  TRIAL_PERIOD_DAYS: 7,
  TRIAL_PERIOD_MS: 7 * 24 * 60 * 60 * 1000,

  // Grace period after failed payment (3 days in milliseconds)
  GRACE_PERIOD_DAYS: 3,
  GRACE_PERIOD_MS: 3 * 24 * 60 * 60 * 1000,

  // Dunning management
  MAX_PAYMENT_RETRIES: 3,
  RETRY_INTERVALS_HOURS: [24, 72, 168], // 1 day, 3 days, 1 week

  // Default statuses
  DEFAULT_TRIAL_STATUS: SubscriptionStatus.ACTIVE,
  DEFAULT_PAID_STATUS: SubscriptionStatus.ACTIVE,
} as const

// Billing Configuration
export const BILLING_CONFIG = {
  // Supported currencies
  SUPPORTED_CURRENCIES: [Currency.NOK, Currency.EUR, Currency.USD] as const,
  DEFAULT_CURRENCY: Currency.USD,
} as const

// Stripe Webhook Events
export const STRIPE_WEBHOOK_EVENTS = {
  // Subscription lifecycle
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  // TODO: Add support for paused and resumed subscriptions
  SUBSCRIPTION_PAUSED: 'customer.subscription.paused',
  SUBSCRIPTION_RESUMED: 'customer.subscription.resumed',

  // Payment events
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',

  // One-time purchase events
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  CHECKOUT_EXPIRED: 'checkout.session.expired',
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',

  // Trial events
  TRIAL_WILL_END: 'customer.subscription.trial_will_end',

  // Customer events
  CUSTOMER_DELETED: 'customer.deleted',

  // Refund and dispute events
  CHARGE_REFUNDED: 'charge.refunded',
  DISPUTE_CREATED: 'charge.dispute.created',
  PAYMENT_ACTION_REQUIRED: 'invoice.payment_action_required',
} as const

// Stripe lookup keys are now centralized in @/lib/stripe/lookup-keys

// Commission Configuration: Trainers get 88% after fees, Platform takes 11%
export const COMMISSION_CONFIG = {
  PLATFORM_PERCENTAGE: 11, // Platform commission percentage (10% base + 1% operational)
  TRAINER_PERCENTAGE: 89, // Trainer percentage after platform fee

  // Stripe fee configuration (trainers cover these)
  STRIPE_FEES: {
    // European card rates (for Norway/EU customers)
    EU_PERCENTAGE: 1.4, // 1.4% processing fee for European cards
    EU_FIXED_FEE_NOK: 25, // 25 øre fixed fee (in øre)
    EU_FIXED_FEE_EUR: 2, // 2 cents fixed fee (in cents)

    // International card rates (for other customers)
    INTL_PERCENTAGE: 2.9, // 2.9% processing fee for international cards
    INTL_FIXED_FEE_USD: 30, // 30 cents fixed fee (in cents)
    INTL_FIXED_FEE_NOK: 300, // ~30 cents in øre

    // Default to EU rates for Norway-based business
    DEFAULT_PERCENTAGE: 1.4,
    DEFAULT_FIXED_FEE: 25, // in smallest currency unit (øre for NOK, cents for USD/EUR)
  },

  // Product-specific commission settings (if needed for different rates)
  PRODUCT_COMMISSION: {
    TRAINER_SERVICES: 12, // 12% platform commission for all trainer services
    COACHING_PACKAGES: 12, // 12% platform commission for coaching
    PLATFORM_PREMIUM: 0, // No commission on platform subscriptions
  },
} as const

// API Configuration
export const API_CONFIG = {
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Return URLs for customer portal
  get PORTAL_RETURN_URLS() {
    const baseUrl = getBaseUrl()
    return {
      DEFAULT: `${baseUrl}/fitspace/settings`,
      SUCCESS: `${baseUrl}/fitspace/settings?success=true`,
      CANCELLED: `${baseUrl}/fitspace/settings?cancelled=true`,
    }
  },
} as const

// Helper functions for working with enums
export const SUBSCRIPTION_HELPERS = {
  isActive: (status: SubscriptionStatus) =>
    status === SubscriptionStatus.ACTIVE,
  isPending: (status: SubscriptionStatus) =>
    status === SubscriptionStatus.PENDING,
  isCancelled: (status: SubscriptionStatus) =>
    status === SubscriptionStatus.CANCELLED,
  isExpired: (status: SubscriptionStatus) =>
    status === SubscriptionStatus.EXPIRED,

  canAccess: (
    status: SubscriptionStatus,
    isInTrial: boolean,
    isInGracePeriod: boolean,
  ) => {
    return status === SubscriptionStatus.ACTIVE || isInTrial || isInGracePeriod
  },
} as const

export const REACTIVATION_HELPERS = {
  // Check if a subscription status allows for reactivation
  canReactivateStatus: (status: SubscriptionStatus) =>
    status === SubscriptionStatus.CANCELLED ||
    status === SubscriptionStatus.EXPIRED,

  // Check if a user can reactivate a specific package
  canReactivatePackage: (
    subscriptions: { status: SubscriptionStatus; isTrialActive: boolean }[],
  ) => {
    const hasActiveSub = subscriptions.some(
      (sub) =>
        SUBSCRIPTION_HELPERS.isActive(sub.status) ||
        SUBSCRIPTION_HELPERS.isPending(sub.status),
    )
    const hasCancelledSub = subscriptions.some((sub) =>
      REACTIVATION_HELPERS.canReactivateStatus(sub.status),
    )
    return !hasActiveSub && hasCancelledSub
  },

  // Check if user has already used trial for a package
  hasUsedTrial: (
    subscriptions: { isTrialActive: boolean; trialStart: Date | null }[],
  ) => {
    return subscriptions.some((sub) => sub.isTrialActive || sub.trialStart)
  },

  // Get the most recent cancelled subscription for a package
  getLatestCancelledSubscription: <
    T extends { status: SubscriptionStatus; createdAt: Date },
  >(
    subscriptions: T[],
  ): T | null => {
    const cancelledSubs = subscriptions
      .filter((sub) => REACTIVATION_HELPERS.canReactivateStatus(sub.status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return cancelledSubs[0] || null
  },
} as const

// Type exports for convenience
export type SupportedCurrency =
  (typeof BILLING_CONFIG.SUPPORTED_CURRENCIES)[number]
export type StripeWebhookEvent =
  (typeof STRIPE_WEBHOOK_EVENTS)[keyof typeof STRIPE_WEBHOOK_EVENTS]
