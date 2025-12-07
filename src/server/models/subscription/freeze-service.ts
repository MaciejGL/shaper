/**
 * Subscription Freeze Service
 *
 * Handles pause/resume functionality for Premium Yearly subscriptions.
 * Uses Stripe's pause_collection as source of truth for pause state,
 * with local DB tracking for calendar year quota.
 */
import { FREEZE_CONFIG } from '@/constants/freeze-config'
import { SubscriptionStatus } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'

// Re-export for convenience
export { FREEZE_CONFIG }

export interface FreezeEligibility {
  canFreeze: boolean
  reason: string | null
  daysRemaining: number
  minDays: number
  maxDays: number
  availableFrom: Date | null
  isPaused: boolean
  pauseEndsAt: Date | null
}

export interface FreezeResult {
  success: boolean
  message: string
  pauseEndsAt: Date | null
}

/**
 * Get the active Premium Yearly subscription for a user
 */
async function getActiveYearlySubscription(userId: string) {
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED_ACTIVE],
      },
      stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
      stripeSubscriptionId: { not: null },
    },
    include: {
      package: true,
    },
  })

  return subscription
}

/**
 * Reset freeze quota if it's a new calendar year (lazy reset)
 */
async function resetQuotaIfNewYear(
  subscriptionId: string,
  currentYear: number,
  freezeUsageYear: number | null,
) {
  if (freezeUsageYear !== currentYear) {
    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        freezeDaysUsed: 0,
        freezeUsageYear: currentYear,
      },
    })
    return 0 // Reset days used to 0
  }
  return null // No reset needed
}

/**
 * Check if subscription is currently paused (from Stripe)
 */
async function getStripeePauseStatus(stripeSubscriptionId: string): Promise<{
  isPaused: boolean
  pauseEndsAt: Date | null
}> {
  try {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    const isPaused = !!stripeSub.pause_collection
    const pauseEndsAt = stripeSub.pause_collection?.resumes_at
      ? new Date(stripeSub.pause_collection.resumes_at * 1000)
      : null

    return { isPaused, pauseEndsAt }
  } catch (error) {
    console.error('Error fetching Stripe subscription:', error)
    return { isPaused: false, pauseEndsAt: null }
  }
}

/**
 * Check freeze eligibility for a user
 */
export async function getFreezeEligibility(
  userId: string,
): Promise<FreezeEligibility> {
  const subscription = await getActiveYearlySubscription(userId)

  // No Premium Yearly subscription
  if (!subscription) {
    return {
      canFreeze: false,
      reason: 'Freeze is only available for Premium Yearly subscribers',
      daysRemaining: 0,
      minDays: FREEZE_CONFIG.MIN_DAYS_PER_PAUSE,
      maxDays: 0,
      availableFrom: null,
      isPaused: false,
      pauseEndsAt: null,
    }
  }

  const currentYear = new Date().getFullYear()

  // Lazy reset if new year
  const resetResult = await resetQuotaIfNewYear(
    subscription.id,
    currentYear,
    subscription.freezeUsageYear,
  )
  const freezeDaysUsed =
    resetResult !== null ? resetResult : subscription.freezeDaysUsed

  const daysRemaining = FREEZE_CONFIG.MAX_DAYS_PER_YEAR - freezeDaysUsed

  // Check Stripe pause status
  const { isPaused, pauseEndsAt } = await getStripeePauseStatus(
    subscription.stripeSubscriptionId!,
  )

  // Currently paused - can't pause again
  if (isPaused) {
    return {
      canFreeze: false,
      reason: 'Your subscription is already paused',
      daysRemaining,
      minDays: FREEZE_CONFIG.MIN_DAYS_PER_PAUSE,
      maxDays: Math.min(FREEZE_CONFIG.MAX_DAYS_PER_PAUSE, daysRemaining),
      availableFrom: null,
      isPaused: true,
      pauseEndsAt,
    }
  }

  // Check if still in trial
  if (subscription.isTrialActive) {
    return {
      canFreeze: false,
      reason: 'Freeze is not available during your trial period',
      daysRemaining,
      minDays: FREEZE_CONFIG.MIN_DAYS_PER_PAUSE,
      maxDays: Math.min(FREEZE_CONFIG.MAX_DAYS_PER_PAUSE, daysRemaining),
      availableFrom: subscription.trialEnd
        ? new Date(
            subscription.trialEnd.getTime() +
              FREEZE_CONFIG.FIRST_MONTH_DAYS * 24 * 60 * 60 * 1000,
          )
        : null,
      isPaused: false,
      pauseEndsAt: null,
    }
  }

  // Check first month rule (30 days after trial ends)
  if (subscription.trialEnd) {
    const eligibleDate = new Date(
      subscription.trialEnd.getTime() +
        FREEZE_CONFIG.FIRST_MONTH_DAYS * 24 * 60 * 60 * 1000,
    )

    if (new Date() < eligibleDate) {
      return {
        canFreeze: false,
        reason: 'Freeze is available after your first paid month',
        daysRemaining,
        minDays: FREEZE_CONFIG.MIN_DAYS_PER_PAUSE,
        maxDays: Math.min(FREEZE_CONFIG.MAX_DAYS_PER_PAUSE, daysRemaining),
        availableFrom: eligibleDate,
        isPaused: false,
        pauseEndsAt: null,
      }
    }
  }

  // Check quota
  if (daysRemaining <= 0) {
    return {
      canFreeze: false,
      reason: `You've used all ${FREEZE_CONFIG.MAX_DAYS_PER_YEAR} pause days this year`,
      daysRemaining: 0,
      minDays: FREEZE_CONFIG.MIN_DAYS_PER_PAUSE,
      maxDays: 0,
      availableFrom: null,
      isPaused: false,
      pauseEndsAt: null,
    }
  }

  // Check if remaining days are enough for minimum pause
  if (daysRemaining < FREEZE_CONFIG.MIN_DAYS_PER_PAUSE) {
    return {
      canFreeze: false,
      reason: `You only have ${daysRemaining} days remaining, minimum pause is ${FREEZE_CONFIG.MIN_DAYS_PER_PAUSE} days`,
      daysRemaining,
      minDays: FREEZE_CONFIG.MIN_DAYS_PER_PAUSE,
      maxDays: 0,
      availableFrom: null,
      isPaused: false,
      pauseEndsAt: null,
    }
  }

  // Eligible to freeze
  return {
    canFreeze: true,
    reason: null,
    daysRemaining,
    minDays: FREEZE_CONFIG.MIN_DAYS_PER_PAUSE,
    maxDays: Math.min(FREEZE_CONFIG.MAX_DAYS_PER_PAUSE, daysRemaining),
    availableFrom: null,
    isPaused: false,
    pauseEndsAt: null,
  }
}

/**
 * Pause a subscription for a given number of days
 */
export async function pauseSubscription(
  userId: string,
  days: number,
): Promise<FreezeResult> {
  // Check eligibility first
  const eligibility = await getFreezeEligibility(userId)

  if (!eligibility.canFreeze) {
    return {
      success: false,
      message: eligibility.reason || 'Unable to pause subscription',
      pauseEndsAt: null,
    }
  }

  // Validate days
  if (days < FREEZE_CONFIG.MIN_DAYS_PER_PAUSE) {
    return {
      success: false,
      message: `Minimum pause duration is ${FREEZE_CONFIG.MIN_DAYS_PER_PAUSE} days`,
      pauseEndsAt: null,
    }
  }

  if (days > eligibility.maxDays) {
    return {
      success: false,
      message: `Maximum pause duration is ${eligibility.maxDays} days (${eligibility.daysRemaining} days remaining this year)`,
      pauseEndsAt: null,
    }
  }

  // Get the subscription
  const subscription = await getActiveYearlySubscription(userId)
  if (!subscription || !subscription.stripeSubscriptionId) {
    return {
      success: false,
      message: 'No active Premium Yearly subscription found',
      pauseEndsAt: null,
    }
  }

  // Calculate resume date
  const resumeDate = new Date()
  resumeDate.setDate(resumeDate.getDate() + days)

  try {
    // Pause in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      pause_collection: {
        behavior: 'void',
        resumes_at: Math.floor(resumeDate.getTime() / 1000),
      },
    })

    // Update quota in DB
    const currentYear = new Date().getFullYear()
    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        freezeDaysUsed: { increment: days },
        freezeUsageYear: currentYear,
      },
    })

    console.info(
      `Subscription ${subscription.stripeSubscriptionId} paused for ${days} days until ${resumeDate.toISOString()}`,
    )

    return {
      success: true,
      message: `Subscription paused for ${days} days`,
      pauseEndsAt: resumeDate,
    }
  } catch (error) {
    console.error('Error pausing subscription:', error)
    return {
      success: false,
      message: 'Failed to pause subscription. Please try again.',
      pauseEndsAt: null,
    }
  }
}

/**
 * Resume a paused subscription early
 */
export async function resumeSubscription(
  userId: string,
): Promise<FreezeResult> {
  const subscription = await getActiveYearlySubscription(userId)

  if (!subscription || !subscription.stripeSubscriptionId) {
    return {
      success: false,
      message: 'No active Premium Yearly subscription found',
      pauseEndsAt: null,
    }
  }

  // Check if actually paused
  const { isPaused } = await getStripeePauseStatus(
    subscription.stripeSubscriptionId,
  )

  if (!isPaused) {
    return {
      success: false,
      message: 'Subscription is not currently paused',
      pauseEndsAt: null,
    }
  }

  try {
    // Resume in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      pause_collection: null,
    })

    console.info(
      `Subscription ${subscription.stripeSubscriptionId} resumed early`,
    )

    return {
      success: true,
      message: 'Subscription resumed successfully',
      pauseEndsAt: null,
    }
  } catch (error) {
    console.error('Error resuming subscription:', error)
    return {
      success: false,
      message: 'Failed to resume subscription. Please try again.',
      pauseEndsAt: null,
    }
  }
}
