import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  adminExtendSubscription,
  adminUpdateSubscriptionStatus,
  getAllSubscriptions,
  getMySubscriptionStatus,
  getMySubscriptions,
  getUserSubscriptions,
} from './factory'

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
