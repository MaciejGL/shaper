/**
 * Subscription Validator
 *
 * Central utility for validating user access to premium features and services.
 * This class handles all subscription-related access checking logic.
 */
import { addMonths, endOfMonth, startOfMonth } from 'date-fns'

import { prisma } from '@/lib/db'
import {
  AccessValidationResult,
  ServiceType,
  ServiceUsageTracker,
  SubscriptionStatus,
  UserSubscriptionWithDetails,
} from '@/types/subscription'

export class SubscriptionValidator {
  /**
   * Check if user has general premium access
   */
  async hasPremiumAccess(userId: string): Promise<boolean> {
    const activeSubscriptions = await this.getActiveSubscriptions(userId)

    return activeSubscriptions.some((sub) =>
      sub.package.services.some(
        (service) => service.serviceType === ServiceType.PREMIUM_ACCESS,
      ),
    )
  }

  /**
   * Check if user has access to trainer services
   */
  async hasTrainerServiceAccess(
    userId: string,
    trainerId: string,
    serviceType: ServiceType,
  ): Promise<AccessValidationResult> {
    const activeSubscriptions = await this.getActiveSubscriptions(userId)

    const relevantSubscription = activeSubscriptions.find(
      (sub) =>
        sub.trainerId === trainerId &&
        sub.package.services.some(
          (service) => service.serviceType === serviceType,
        ),
    )

    if (!relevantSubscription) {
      return {
        hasAccess: false,
        reason: `No active subscription for ${serviceType} with this trainer`,
      }
    }

    return {
      hasAccess: true,
      subscription: relevantSubscription,
    }
  }

  /**
   * Check if user can use a specific service (with usage limits)
   */
  async canUseService(
    userId: string,
    serviceType: ServiceType,
    trainerId?: string,
  ): Promise<AccessValidationResult> {
    const activeSubscriptions = await this.getActiveSubscriptions(userId)

    // Find relevant subscription
    const relevantSubscription = activeSubscriptions.find((sub) => {
      const hasService = sub.package.services.some(
        (service) => service.serviceType === serviceType,
      )

      if (!hasService) return false

      // For general premium services, trainerId should be null
      if (serviceType === ServiceType.PREMIUM_ACCESS) {
        return sub.trainerId === null
      }

      // For trainer services, trainerId should match
      return sub.trainerId === trainerId
    })

    if (!relevantSubscription) {
      return {
        hasAccess: false,
        reason: `No active subscription for ${serviceType}`,
      }
    }

    // Get service configuration
    const serviceConfig = relevantSubscription.package.services.find(
      (service) => service.serviceType === serviceType,
    )

    if (!serviceConfig) {
      return {
        hasAccess: false,
        reason: `Service ${serviceType} not included in subscription`,
      }
    }

    // For unlimited services (like premium access), always allow
    if (serviceType === ServiceType.PREMIUM_ACCESS) {
      return {
        hasAccess: true,
        subscription: relevantSubscription,
        remainingUsage: -1, // Unlimited
      }
    }

    // Check usage limits for services with quantity limits
    const usageTracker = await this.getServiceUsageTracker(
      relevantSubscription.id,
      serviceType,
    )

    const hasRemainingUsage = usageTracker.remainingUsage > 0

    return {
      hasAccess: hasRemainingUsage,
      subscription: relevantSubscription,
      remainingUsage: usageTracker.remainingUsage,
      totalAllowed: usageTracker.allowedPerMonth,
      reason: hasRemainingUsage
        ? undefined
        : `No remaining ${serviceType} usage this month`,
    }
  }

  /**
   * Track service usage (record that a service was used)
   */
  async trackServiceUsage(
    userId: string,
    serviceType: ServiceType,
    trainerId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<{ success: boolean; error?: string }> {
    const accessResult = await this.canUseService(
      userId,
      serviceType,
      trainerId,
    )

    if (!accessResult.hasAccess || !accessResult.subscription) {
      return {
        success: false,
        error: accessResult.reason || 'Access denied',
      }
    }

    // Record the usage
    await prisma.serviceUsage.create({
      data: {
        subscriptionId: accessResult.subscription.id,
        serviceType,
        quantity: 1,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    })

    return { success: true }
  }

  /**
   * Get service usage tracker for a specific service
   */
  async getServiceUsageTracker(
    subscriptionId: string,
    serviceType: ServiceType,
  ): Promise<ServiceUsageTracker> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        package: {
          include: { services: true },
        },
        usedServices: {
          where: {
            serviceType,
            usedAt: {
              gte: startOfMonth(new Date()),
              lte: endOfMonth(new Date()),
            },
          },
        },
      },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    const serviceConfig = subscription.package.services.find(
      (service) => service.serviceType === serviceType,
    )

    const allowedPerMonth = serviceConfig?.quantity || 0
    const usedThisMonth = subscription.usedServices.length
    const remainingUsage = Math.max(0, allowedPerMonth - usedThisMonth)

    return {
      serviceType,
      usedThisMonth,
      allowedPerMonth,
      remainingUsage,
      nextResetDate: endOfMonth(new Date()),
    }
  }

  /**
   * Get all active subscriptions for a user
   */
  async getActiveSubscriptions(
    userId: string,
  ): Promise<UserSubscriptionWithDetails[]> {
    const subscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
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
          take: 10, // Last 10 usage records
        },
      },
    })

    return subscriptions as UserSubscriptionWithDetails[]
  }

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
  async canAccessMealPlans(
    userId: string,
    trainerId?: string,
  ): Promise<AccessValidationResult> {
    // First check if user has general premium access
    const hasPremium = await this.hasPremiumAccess(userId)
    if (hasPremium) {
      return { hasAccess: true, reason: 'Premium access' }
    }

    // Then check if user has trainer meal plan access
    if (trainerId) {
      return this.hasTrainerServiceAccess(
        userId,
        trainerId,
        ServiceType.MEAL_PLAN,
      )
    }

    return {
      hasAccess: false,
      reason: 'Premium subscription or trainer meal plan required',
    }
  }

  /**
   * Check subscription limits (how many training plans can be assigned)
   */
  async getTrainingPlanLimit(userId: string): Promise<number> {
    const hasPremium = await this.hasPremiumAccess(userId)

    if (hasPremium) {
      return -1 // Unlimited
    }

    return 1 // Free users can have 1 training plan
  }

  /**
   * Get comprehensive user subscription status
   */
  async getUserSubscriptionStatus(userId: string) {
    const activeSubscriptions = await this.getActiveSubscriptions(userId)
    const hasPremium = await this.hasPremiumAccess(userId)
    const trainingPlanLimit = await this.getTrainingPlanLimit(userId)

    // Get usage trackers for all services
    const usageTrackers: ServiceUsageTracker[] = []

    for (const subscription of activeSubscriptions) {
      for (const service of subscription.package.services) {
        if (service.serviceType !== ServiceType.PREMIUM_ACCESS) {
          const tracker = await this.getServiceUsageTracker(
            subscription.id,
            service.serviceType,
          )
          usageTrackers.push(tracker)
        }
      }
    }

    return {
      hasPremium,
      activeSubscriptions,
      trainingPlanLimit,
      usageTrackers,
      canAccessPremiumTrainingPlans: hasPremium,
      canAccessPremiumExercises: hasPremium,
      canAccessMealPlans:
        hasPremium ||
        activeSubscriptions.some((sub) =>
          sub.package.services.some(
            (service) => service.serviceType === ServiceType.MEAL_PLAN,
          ),
        ),
    }
  }

  /**
   * Create a mock subscription for testing (without payment)
   */
  async createMockSubscription(
    userId: string,
    packageId: string,
    trainerId?: string,
    durationMonths: number = 1,
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const packageTemplate = await prisma.packageTemplate.findUnique({
        where: { id: packageId },
        include: { services: true },
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
          trainerId,
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
}

// Export singleton instance
export const subscriptionValidator = new SubscriptionValidator()

// Export helper functions for common use cases
export const checkPremiumAccess = (userId: string) =>
  subscriptionValidator.hasPremiumAccess(userId)

export const checkServiceAccess = (
  userId: string,
  serviceType: ServiceType,
  trainerId?: string,
) => subscriptionValidator.canUseService(userId, serviceType, trainerId)

export const trackServiceUsage = (
  userId: string,
  serviceType: ServiceType,
  trainerId?: string,
  metadata?: Record<string, unknown>,
) =>
  subscriptionValidator.trackServiceUsage(
    userId,
    serviceType,
    trainerId,
    metadata,
  )
