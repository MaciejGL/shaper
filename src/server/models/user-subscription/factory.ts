import { prisma } from '@/lib/db'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'

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
          trainer: true,
        },
      },
      trainer: true,
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
    console.error('[getMySubscriptionStatus] No user in context')
    throw new Error('Authentication required')
  }

  const userId = context.user.user.id

  const status = await subscriptionValidator.getUserSubscriptionStatus(
    userId,
    context,
  )

  // Use the UserSubscriptionStatus model
  return new UserSubscriptionStatus(status, context)
}
