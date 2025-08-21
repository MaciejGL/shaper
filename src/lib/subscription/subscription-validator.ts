/**
 * Subscription Validator (Simplified)
 *
 * Simple utility for checking user premium access based on:
 * 1. Package name contains "premium" (case insensitive)
 * 2. Subscription end date is in the future
 */
import { addMonths } from 'date-fns'

import { prisma } from '@/lib/db'
import UserSubscription from '@/server/models/user-subscription/model'
import { GQLContext } from '@/types/gql-context'
import { SubscriptionStatus } from '@/types/subscription'

export class SubscriptionValidator {
  /**
   * Check if user has premium access
   * Premium = package name contains "premium" + subscription not expired
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

    return validSubscriptions.some(
      (sub) =>
        sub.package.name.toLowerCase().includes('premium') &&
        new Date(sub.endDate) > new Date(),
    )
  }

  /**
   * Get user's current subscription status
   */
  async getUserSubscriptionStatus(userId: string, context: GQLContext) {
    const validSubscriptions = await this.getValidSubscriptions(userId, context)
    const hasPremium = await this.hasPremiumAccess(userId, context)

    // Find active premium subscription
    const activePremiumSubscription = validSubscriptions.find(
      (sub) =>
        sub.package.name.toLowerCase().includes('premium') &&
        new Date(sub.endDate) > new Date() &&
        sub.status.toString() === 'ACTIVE',
    )

    // Find cancelled but still valid premium subscription
    const cancelledPremiumSubscription = validSubscriptions.find(
      (sub) =>
        sub.package.name.toLowerCase().includes('premium') &&
        new Date(sub.endDate) > new Date() &&
        sub.status.toString() === 'CANCELLED',
    )

    return {
      hasPremium,
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
      activePremiumSubscription,
      cancelledPremiumSubscription,
      // Legacy compatibility
      canAccessPremiumTrainingPlans: hasPremium,
      canAccessPremiumExercises: hasPremium,
      canAccessMealPlans: hasPremium,
      trainingPlanLimit: hasPremium ? -1 : 1, // Unlimited for premium, 1 for free
      usageTrackers: [], // Simplified: no usage tracking
    }
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
            services: true,
            trainer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        trainer: {
          select: { id: true, name: true, email: true },
        },
        usedServices: {
          orderBy: { usedAt: 'desc' },
          take: 10,
        },
      },
    })

    return subscriptions.map((sub) => new UserSubscription(sub, context))
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
}

// Export singleton instance
export const subscriptionValidator = new SubscriptionValidator()

// Export helper functions for common use cases
export const checkPremiumAccess = (userId: string) =>
  subscriptionValidator.hasPremiumAccess(userId)
