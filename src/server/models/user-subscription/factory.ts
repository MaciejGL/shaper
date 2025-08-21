import { addMonths } from 'date-fns'

import {
  GQLQueryGetAllSubscriptionsArgs,
  GQLQueryGetUserSubscriptionsArgs,
  GQLSubscriptionStatus,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'
import { SubscriptionStatus } from '@/types/subscription'

import UserSubscriptionStatus from '../user-subscription-status/model'

import UserSubscription, { UserSubscriptionWithIncludes } from './model'

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
    context,
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
 * Get all subscriptions (admin only)
 */
export async function getAllSubscriptions(
  args: GQLQueryGetAllSubscriptionsArgs,
  context: GQLContext,
): Promise<UserSubscription[]> {
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
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  userId: string,
): Promise<UserSubscriptionWithIncludes> {
  // Verify the subscription belongs to the user
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      id: subscriptionId,
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
  })

  if (!subscription) {
    throw new Error('Active subscription not found')
  }

  // Update subscription status to cancelled
  const cancelledSubscription = await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: { status: SubscriptionStatus.CANCELLED },
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

  return cancelledSubscription as UserSubscriptionWithIncludes
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string,
  userId: string,
): Promise<UserSubscriptionWithIncludes> {
  // Verify the subscription belongs to the user and is cancelled
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      id: subscriptionId,
      userId,
      status: SubscriptionStatus.CANCELLED,
    },
  })

  if (!subscription) {
    throw new Error('Cancelled subscription not found')
  }

  // Simply reactivate by changing status back to ACTIVE
  // Don't extend dates - let normal billing cycle handle renewal
  const reactivatedSubscription = await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: { status: SubscriptionStatus.ACTIVE },
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

  return reactivatedSubscription as UserSubscriptionWithIncludes
}

/**
 * Admin: Update subscription status
 */
export async function adminUpdateSubscriptionStatus(
  subscriptionId: string,
  status: GQLSubscriptionStatus,
  context: GQLContext,
): Promise<UserSubscription> {
  if (!(await isAdminUser())) {
    throw new Error('Unauthorized')
  }

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
  if (!(await isAdminUser())) {
    throw new Error('Unauthorized')
  }

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
