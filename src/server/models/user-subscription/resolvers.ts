import {
  GQLMutationAdminExtendSubscriptionArgs,
  GQLMutationAdminUpdateSubscriptionStatusArgs,
  GQLMutationResolvers,
  GQLQueryGetAllSubscriptionsArgs,
  GQLQueryGetUserSubscriptionsArgs,
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
  getUserSubscriptions: async (
    _,
    args: GQLQueryGetUserSubscriptionsArgs,
    context: GQLContext,
  ) => getUserSubscriptions(args, context),

  getMySubscriptions: async (_, __, context: GQLContext) =>
    getMySubscriptions(context),

  getMySubscriptionStatus: async (_, __, context: GQLContext) =>
    getMySubscriptionStatus(context),

  getAllSubscriptions: async (
    _,
    args: GQLQueryGetAllSubscriptionsArgs,
    context: GQLContext,
  ) => getAllSubscriptions(args, context),
}

export const Mutation: GQLMutationResolvers = {
  adminUpdateSubscriptionStatus: async (
    _,
    args: GQLMutationAdminUpdateSubscriptionStatusArgs,
    context: GQLContext,
  ) => adminUpdateSubscriptionStatus(args.subscriptionId, args.status, context),

  adminExtendSubscription: async (
    _,
    args: GQLMutationAdminExtendSubscriptionArgs,
    context: GQLContext,
  ) =>
    adminExtendSubscription(
      args.subscriptionId,
      args.additionalMonths || 0,
      context,
    ),
}
