import { BillingStatus, Currency, SubscriptionStatus } from '@prisma/client'

// Subscription Configuration
export const SUBSCRIPTION_CONFIG = {
  // Trial period duration (14 days in milliseconds)
  TRIAL_PERIOD_DAYS: 14,
  TRIAL_PERIOD_MS: 14 * 24 * 60 * 60 * 1000,

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

  // Billing statuses
  STATUS: {
    SUCCEEDED: BillingStatus.SUCCEEDED,
    FAILED: BillingStatus.FAILED,
    PENDING: BillingStatus.PENDING,
    REFUNDED: BillingStatus.REFUNDED,
  } as const,
} as const

// Stripe Webhook Events
export const STRIPE_WEBHOOK_EVENTS = {
  // Subscription lifecycle
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',

  // Payment events
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',

  // One-time purchase events
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',

  // Trial events
  TRIAL_WILL_END: 'customer.subscription.trial_will_end',

  // Dispute events
  DISPUTE_CREATED: 'charge.dispute.created',
  PAYMENT_ACTION_REQUIRED: 'invoice.payment_action_required',
} as const

// Stripe Product Configuration
export const STRIPE_PRODUCTS = {
  // Price ID mappings (these would be set from environment or database)
  PREMIUM_MONTHLY: {
    NOK: process.env.STRIPE_PRICE_PREMIUM_MONTHLY_NOK,
    EUR: process.env.STRIPE_PRICE_PREMIUM_MONTHLY_EUR,
    USD: process.env.STRIPE_PRICE_PREMIUM_MONTHLY_USD,
  },
  PREMIUM_YEARLY: {
    NOK: process.env.STRIPE_PRICE_PREMIUM_YEARLY_NOK,
    EUR: process.env.STRIPE_PRICE_PREMIUM_YEARLY_EUR,
    USD: process.env.STRIPE_PRICE_PREMIUM_YEARLY_USD,
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
  PORTAL_RETURN_URLS: {
    DEFAULT: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription`,
    SUCCESS: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?success=true`,
    CANCELLED: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?cancelled=true`,
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

export const BILLING_HELPERS = {
  isSuccessful: (status: BillingStatus) => status === BillingStatus.SUCCEEDED,
  isFailed: (status: BillingStatus) => status === BillingStatus.FAILED,
  isPending: (status: BillingStatus) => status === BillingStatus.PENDING,
  isRefunded: (status: BillingStatus) => status === BillingStatus.REFUNDED,
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
