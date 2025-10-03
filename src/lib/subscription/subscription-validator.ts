/**
 * Enhanced Subscription Validator
 *
 * Optimized hybrid approach:
 * 1. Fast local checks for 99% of operations
 * 2. Stripe validation for critical operations
 * 3. Self-healing sync when discrepancies detected
 */
import { addMonths } from 'date-fns'
import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { UserSubscriptionStatusData } from '@/server/models/user-subscription-status/model'
import UserSubscription, {
  UserSubscriptionWithIncludes,
} from '@/server/models/user-subscription/model'
import { GQLContext } from '@/types/gql-context'
import { SubscriptionStatus } from '@/types/subscription'

import { stripe } from '../stripe/stripe'

export class SubscriptionValidator {
  /**
   * PRIMARY METHOD: Fast local premium access check
   * Use this for 99% of subscription checks (UI, content access, etc.)
   * Premium access is granted if user has either:
   * 1. Active premium subscription, OR
   * 2. Active Complete Coaching Combo (includes premium access)
   */
  async hasPremiumAccess(
    userId: string,
    context?: GQLContext,
  ): Promise<boolean> {
    // Create a minimal context if not provided
    const tempContext =
      context || ({ user: { user: { id: userId } } } as GQLContext)
    const validSubscriptions = await this.getValidSubscriptions(
      userId,
      tempContext,
    )

    return await this.evaluatePremiumLogic(validSubscriptions)
  }

  /**
   * CRITICAL OPERATIONS: Validated premium access check
   * Use this for important operations (purchases, admin actions, etc.)
   * Validates local data against Stripe and auto-syncs if needed
   */
  async validateCriticalAccess(userId: string): Promise<boolean> {
    try {
      const [localResult, stripeValid] = await Promise.all([
        this.hasPremiumAccess(userId),
        this.validateAgainstStripe(userId),
      ])

      if (localResult !== stripeValid) {
        console.warn(
          `Subscription sync mismatch for user ${userId}: local=${localResult}, stripe=${stripeValid}`,
        )
        // Trigger sync to fix discrepancy
        await this.syncUserSubscriptions(userId)
        return stripeValid // Use Stripe as source of truth
      }

      return localResult
    } catch (error) {
      console.error('Critical access validation failed:', error)
      // Fallback to local result if Stripe is unavailable
      return this.hasPremiumAccess(userId)
    }
  }

  /**
   * Extract premium logic for reuse
   */
  private async evaluatePremiumLogic(
    subscriptions: UserSubscription[],
  ): Promise<boolean> {
    // Check each subscription by fetching package data from database
    for (const sub of subscriptions) {
      const isNotExpired = new Date(sub.endDate) > new Date()

      if (!isNotExpired) continue

      // Get package data from database
      const packageTemplate = await prisma.packageTemplate.findUnique({
        where: { id: sub.packageId },
        select: { name: true },
      })

      if (!packageTemplate) continue

      const packageName = packageTemplate.name.toLowerCase()

      // Traditional premium subscription
      const hasPremiumSubscription = packageName.includes('premium')

      // Complete Coaching Combo includes premium access
      const hasCoachingCombo =
        packageName.includes('coaching') && packageName.includes('combo')

      if (hasPremiumSubscription || hasCoachingCombo) {
        return true
      }
    }

    return false
  }

  /**
   * Validate subscription status against Stripe
   */
  private async validateAgainstStripe(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      return false
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 100,
    })

    return subscriptions.data.some((sub) => {
      return this.stripeSubscriptionGrantsPremium(sub)
    })
  }

  /**
   * Check if a Stripe subscription grants premium access
   */
  private stripeSubscriptionGrantsPremium(
    subscription: Stripe.Subscription,
  ): boolean {
    // Check if any line item grants premium access
    return subscription.items.data.some((item) => {
      const productName =
        item.price.nickname?.toLowerCase() ||
        item.price.product?.toString().toLowerCase() ||
        ''

      // Traditional premium subscription
      const hasPremiumSubscription = productName.includes('premium')

      // Complete Coaching Combo includes premium access
      const hasCoachingCombo =
        productName.includes('coaching') && productName.includes('combo')

      return hasPremiumSubscription || hasCoachingCombo
    })
  }

  /**
   * Sync user subscriptions from Stripe (self-healing)
   */
  private async syncUserSubscriptions(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      })

      if (!user?.stripeCustomerId) {
        return
      }

      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 100,
      })

      // Update local subscriptions to match Stripe
      await this.reconcileSubscriptions(userId, stripeSubscriptions.data)
    } catch (error) {
      console.error(`Failed to sync subscriptions for user ${userId}:`, error)
    }
  }

  /**
   * Reconcile local subscriptions with Stripe data
   */
  private async reconcileSubscriptions(
    userId: string,
    stripeSubscriptions: Stripe.Subscription[],
  ): Promise<void> {
    for (const stripeSub of stripeSubscriptions) {
      const localSub = await prisma.userSubscription.findFirst({
        where: {
          userId,
          stripeSubscriptionId: stripeSub.id,
        },
      })

      if (localSub) {
        // Update existing subscription
        const stripeStatus = this.mapStripeStatus(stripeSub.status)

        // Get the period dates from the first subscription item
        const subscriptionItem = stripeSub.items.data[0]

        await prisma.userSubscription.update({
          where: { id: localSub.id },
          data: {
            status: stripeStatus,
            startDate: subscriptionItem
              ? new Date(subscriptionItem.current_period_start * 1000)
              : localSub.startDate,
            endDate: subscriptionItem
              ? new Date(subscriptionItem.current_period_end * 1000)
              : localSub.endDate,
            updatedAt: new Date(),
          },
        })
      }
      // Note: We don't create new subscriptions here as that should happen via webhooks
    }
  }

  /**
   * Map Stripe subscription status to local status
   */
  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE
      case 'canceled':
      case 'cancelled':
        return SubscriptionStatus.CANCELLED
      case 'past_due':
      case 'unpaid':
        return SubscriptionStatus.PENDING
      default:
        return SubscriptionStatus.PENDING
    }
  }

  /**
   * Get user's current subscription status (simplified for GraphQL)
   */
  async getUserSubscriptionStatus(
    userId: string,
    context: GQLContext,
  ): Promise<UserSubscriptionStatusData> {
    const validSubscriptions = await this.getValidSubscriptions(userId, context)
    const hasPremium = await this.evaluatePremiumLogic(validSubscriptions)

    // Find trainer subscription
    const trainerSubscription = validSubscriptions.find(
      (sub) => sub.trainerId !== null && new Date(sub.endDate) > new Date(),
    )

    // Find subscription end date (latest active/cancelled subscription)
    const latestSubscription = validSubscriptions
      .filter((sub) => new Date(sub.endDate) > new Date())
      .sort(
        (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
      )[0]

    // Check if user is currently in grace period
    const isInGracePeriod = await this.checkGracePeriodStatus(userId)

    return {
      hasPremium,
      hasTrainerSubscription: !!trainerSubscription,
      trainerId: trainerSubscription?.trainerId || null,
      canAccessPremiumTrainingPlans: hasPremium,
      canAccessPremiumExercises: hasPremium,
      canAccessMealPlans: hasPremium,
      subscriptionEndDate: latestSubscription?.endDate || null,
      isInGracePeriod,

      // Legacy compatibility (for existing code)
      activeSubscriptions: validSubscriptions.filter(
        (sub) =>
          sub.status.toString() === 'ACTIVE' &&
          new Date(sub.endDate) > new Date(),
      ),
      cancelledSubscriptions: validSubscriptions.filter(
        (sub) =>
          sub.status.toString() === 'CANCELLED' &&
          new Date(sub.endDate) > new Date(),
      ),
      trainingPlanLimit: hasPremium ? 999 : 1, // Unlimited for premium, 1 for free
      usageTrackers: [], // Simplified: no usage tracking
    }
  }

  /**
   * Enhanced checkPremiumAccess for critical operations
   */
  async checkCriticalPremiumAccess(userId: string): Promise<boolean> {
    return this.validateCriticalAccess(userId)
  }

  /**
   * Get all valid subscriptions (active + cancelled but not expired)
   */
  private async getValidSubscriptions(
    userId: string,
    context: GQLContext,
  ): Promise<UserSubscription[]> {
    const subscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
        },
        endDate: { gte: new Date() },
      },
      include: {
        package: {
          include: {
            trainer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        trainer: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return subscriptions.map(
      (sub) =>
        new UserSubscription(sub as UserSubscriptionWithIncludes, context),
    )
  }

  /**
   * Create a mock subscription for testing (without payment)
   */
  async createMockSubscription(
    userId: string,
    packageId: string,
    durationMonths: number = 1,
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const packageTemplate = await prisma.packageTemplate.findUnique({
        where: { id: packageId },
      })

      if (!packageTemplate) {
        return { success: false, error: 'Package template not found' }
      }

      const startDate = new Date()
      const endDate = addMonths(startDate, durationMonths)

      const subscription = await prisma.userSubscription.create({
        data: {
          userId,
          packageId,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          mockPaymentStatus: 'COMPLETED',
          mockTransactionId: `mock_${Date.now()}_${userId}`,
        },
      })

      return { success: true, subscriptionId: subscription.id }
    } catch (error) {
      console.error('Error creating mock subscription:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Legacy compatibility methods (simplified)

  /**
   * Check if user can access premium training plans
   */
  async canAccessPremiumTrainingPlans(userId: string): Promise<boolean> {
    return this.hasPremiumAccess(userId)
  }

  /**
   * Check if user can access premium exercises
   */
  async canAccessPremiumExercises(userId: string): Promise<boolean> {
    return this.hasPremiumAccess(userId)
  }

  /**
   * Check if user can have multiple training plans assigned
   */
  async canHaveMultipleTrainingPlans(userId: string): Promise<boolean> {
    return this.hasPremiumAccess(userId)
  }

  /**
   * Check if user can access meal plans
   */
  async canAccessMealPlans(userId: string): Promise<boolean> {
    return this.hasPremiumAccess(userId)
  }

  /**
   * Get training plan limit
   */
  async getTrainingPlanLimit(userId: string): Promise<number> {
    const hasPremium = await this.hasPremiumAccess(userId)
    return hasPremium ? -1 : 1 // Unlimited for premium, 1 for free
  }

  /**
   * Check if user is currently in grace period
   * Grace period allows continued access after payment failure for a limited time
   */
  private async checkGracePeriodStatus(userId: string): Promise<boolean> {
    const subscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        isInGracePeriod: true,
      },
      select: {
        isInGracePeriod: true,
        gracePeriodEnd: true,
      },
    })

    const now = new Date()

    // Check if any subscription is in grace period and hasn't expired
    return subscriptions.some((sub) => {
      return (
        sub.isInGracePeriod &&
        sub.gracePeriodEnd &&
        new Date(sub.gracePeriodEnd) > now
      )
    })
  }
}

// Export singleton instance
export const subscriptionValidator = new SubscriptionValidator()

// Export helper functions for different use cases
export const checkPremiumAccess = (userId: string) =>
  subscriptionValidator.hasPremiumAccess(userId)

// For critical operations (purchases, admin actions)
export const checkCriticalPremiumAccess = (userId: string) =>
  subscriptionValidator.validateCriticalAccess(userId)

// Enhanced subscription status
export const getEnhancedSubscriptionStatus = (
  userId: string,
  context: GQLContext,
) => subscriptionValidator.getUserSubscriptionStatus(userId, context)
