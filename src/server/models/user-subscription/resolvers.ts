import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  adminExtendSubscription,
  adminUpdateSubscriptionStatus,
  cancelSubscription,
  createMockSubscription,
  getAllSubscriptions,
  getMySubscriptionStatus,
  getMySubscriptions,
  getUserSubscriptions,
  reactivateSubscription,
} from './factory'
import UserSubscription from './model'

export const Query: GQLQueryResolvers = {
  getUserSubscriptions: async (_, args, context: GQLContext) =>
    getUserSubscriptions(args, context),

  getMySubscriptions: async (_, __, context: GQLContext) =>
    getMySubscriptions(context),

  getMySubscriptionStatus: async (_, __, context: GQLContext) =>
    getMySubscriptionStatus(context),

  getAllSubscriptions: async (_, args, context: GQLContext) =>
    getAllSubscriptions(args, context),
}

export const Mutation: GQLMutationResolvers = {
  createMockSubscription: async (_, args, context: GQLContext) => {
    if (!context.user?.user.id) {
      throw new Error('User not authenticated')
    }

    // Override userId from context instead of input
    return createMockSubscription({
      ...args.input,
      userId: context.user.user.id,
    })
  },

  cancelSubscription: async (_, args, context: GQLContext) => {
    if (!context.user?.user.id) {
      throw new Error('User not authenticated')
    }

    const cancelledSubscription = await cancelSubscription(
      args.subscriptionId,
      context.user.user.id,
    )

    return new UserSubscription(cancelledSubscription, context)
  },

  reactivateSubscription: async (_, args, context: GQLContext) => {
    if (!context.user?.user.id) {
      throw new Error('User not authenticated')
    }

    const reactivatedSubscription = await reactivateSubscription(
      args.subscriptionId,
      context.user.user.id,
    )

    return new UserSubscription(reactivatedSubscription, context)
  },

  adminUpdateSubscriptionStatus: async (_, args, context: GQLContext) =>
    adminUpdateSubscriptionStatus(
      args.input.subscriptionId,
      args.input.status,
      context,
    ),

  adminExtendSubscription: async (_, args, context: GQLContext) =>
    adminExtendSubscription(
      args.input.subscriptionId,
      args.input.additionalMonths || 0,
      context,
    ),
}
