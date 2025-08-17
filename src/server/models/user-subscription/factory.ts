import { Prisma } from '@prisma/client'
import { addMonths } from 'date-fns'

import {
  GQLCreateSubscriptionInput,
  GQLQueryGetAllSubscriptionsArgs,
  GQLQueryGetTrainerSubscriptionsArgs,
  GQLQueryGetUserSubscriptionsArgs,
  GQLSubscriptionStatus,
} from '@/generated/graphql-server'
import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'
import { SubscriptionStatus } from '@/types/subscription'

import UserSubscriptionStatus from '../user-subscription-status/model'

import UserSubscription from './model'

/**
 * Get user's own subscriptions
 */
export async function getMySubscriptions(
  context: GQLContext,
): Promise<UserSubscription[]> {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId: context.user.user.id },
    include: {
      user: true,
      package: {
        include: {
          services: true,
          trainer: true,
        },
      },
      trainer: true,
      usedServices: {
        orderBy: { usedAt: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return subscriptions.map((sub) => new UserSubscription(sub, context))
}

/**
 * Get user's subscription status overview
 */
export async function getMySubscriptionStatus(context: GQLContext) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  const status = await subscriptionValidator.getUserSubscriptionStatus(
    context.user.user.id,
  )

  // Use the UserSubscriptionStatus model
  return new UserSubscriptionStatus(status, context)
}

/**
 * Get subscriptions for a specific user (admin/trainer access)
 */
export async function getUserSubscriptions(
  args: GQLQueryGetUserSubscriptionsArgs,
  context: GQLContext,
): Promise<UserSubscription[]> {
  // TODO: Add permission checks - only admin or trainers can view client subscriptions

  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId: args.userId },
    include: {
      user: true,
      package: {
        include: {
          services: true,
          trainer: true,
        },
      },
      trainer: true,
      usedServices: {
        orderBy: { usedAt: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return subscriptions.map((sub) => new UserSubscription(sub, context))
}

/**
 * Get a specific subscription by ID
 */
export async function getSubscription(
  args: { id: string },
  context: GQLContext,
): Promise<UserSubscription | null> {
  const subscription = await prisma.userSubscription.findUnique({
    where: { id: args.id },
    include: {
      user: true,
      package: {
        include: {
          services: true,
          trainer: true,
        },
      },
      trainer: true,
      usedServices: {
        orderBy: { usedAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!subscription) return null

  // TODO: Add permission check - user can only view their own subscriptions
  // unless they're admin or the trainer

  return new UserSubscription(subscription, context)
}

/**
 * Get subscriptions for a trainer's clients
 */
export async function getTrainerSubscriptions(
  args: GQLQueryGetTrainerSubscriptionsArgs,
  context: GQLContext,
): Promise<UserSubscription[]> {
  if (!context.user) {
    throw new Error('Authentication required')
  }

  const { filters } = args
  const trainerId = context.user?.user.id // Trainer viewing their client subscriptions

  const where: Prisma.UserSubscriptionWhereInput = {
    trainerId,
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {}
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      where.createdAt.lte = new Date(filters.dateTo)
    }
  }

  if (filters?.serviceType) {
    where.package = {
      services: {
        some: {
          serviceType: filters.serviceType,
        },
      },
    }
  }

  const subscriptions = await prisma.userSubscription.findMany({
    where,
    include: {
      user: true,
      package: {
        include: {
          services: true,
          trainer: true,
        },
      },
      trainer: true,
      usedServices: {
        orderBy: { usedAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return subscriptions.map((sub) => new UserSubscription(sub, context))
}

/**
 * Get all subscriptions (admin only)
 */
export async function getAllSubscriptions(
  args: GQLQueryGetAllSubscriptionsArgs,
  context: GQLContext,
): Promise<UserSubscription[]> {
  // TODO: Add admin permission check
  if (!(await isAdminUser())) {
    throw new Error('Unauthorized')
  }

  const { filters } = args
  const where: Prisma.UserSubscriptionWhereInput = {}

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.trainerId) {
    where.trainerId = filters.trainerId
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {}
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      where.createdAt.lte = new Date(filters.dateTo)
    }
  }

  if (filters?.serviceType) {
    where.package = {
      services: {
        some: {
          serviceType: filters.serviceType,
        },
      },
    }
  }

  const subscriptions = await prisma.userSubscription.findMany({
    where,
    include: {
      user: true,
      package: {
        include: {
          services: true,
          trainer: true,
        },
      },
      trainer: true,
      usedServices: {
        orderBy: { usedAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit for performance
  })

  return subscriptions.map((sub) => new UserSubscription(sub, context))
}

/**
 * Create a mock subscription (for testing without payment)
 */
export async function createMockSubscription(
  input: GQLCreateSubscriptionInput,
) {
  const durationMonths = input.durationMonths || 1

  return subscriptionValidator.createMockSubscription(
    input.userId,
    input.packageId,
    input.trainerId || undefined,
    durationMonths,
  )
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  id: string,
  context: GQLContext,
): Promise<boolean> {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // TODO: Add permission check - user can only cancel their own subscription
    if (subscription.userId !== context.user?.user.id) {
      throw new Error('Unauthorized')
    }

    await prisma.userSubscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    })

    return true
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return false
  }
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(id: string): Promise<boolean> {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // TODO: Add permission check

    // Only reactivate if not expired
    if (subscription.endDate > new Date()) {
      await prisma.userSubscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.ACTIVE,
        },
      })
      return true
    }

    return false
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return false
  }
}

/**
 * Admin: Update subscription status
 */
export async function adminUpdateSubscriptionStatus(
  subscriptionId: string,
  status: GQLSubscriptionStatus,
  context: GQLContext,
): Promise<UserSubscription> {
  // TODO: Add admin permission check

  const subscription = await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: { status },
    include: {
      user: true,
      package: {
        include: {
          services: true,
          trainer: true,
        },
      },
      trainer: true,
      usedServices: true,
    },
  })

  return new UserSubscription(subscription, context)
}

/**
 * Admin: Extend subscription
 */
export async function adminExtendSubscription(
  subscriptionId: string,
  additionalMonths: number,
  context: GQLContext,
): Promise<UserSubscription> {
  // TODO: Add admin permission check

  const subscription = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId },
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  const newEndDate = addMonths(subscription.endDate, additionalMonths)

  const updatedSubscription = await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      endDate: newEndDate,
      status: SubscriptionStatus.ACTIVE, // Reactivate if needed
    },
    include: {
      user: true,
      package: {
        include: {
          services: true,
          trainer: true,
        },
      },
      trainer: true,
      usedServices: true,
    },
  })

  return new UserSubscription(updatedSubscription, context)
}
