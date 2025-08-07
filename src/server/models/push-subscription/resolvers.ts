import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  createPushSubscription,
  deletePushSubscription,
  getPushSubscriptionByEndpoint,
  getPushSubscriptions,
  updatePushSubscription,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  pushSubscriptions: (_, __, context) => {
    if (!context.user) {
      throw new Error('Authentication required')
    }
    return getPushSubscriptions(context.user.user.id, context)
  },
  pushSubscription: (_, { endpoint }, context) =>
    getPushSubscriptionByEndpoint(endpoint, context),
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createPushSubscription: (_, { input }, context) => {
    if (!context.user) {
      throw new Error('Authentication required')
    }
    return createPushSubscription(input, context.user.user.id, context)
  },
  updatePushSubscription: (_, { input }, context) =>
    updatePushSubscription(input, context),
  deletePushSubscription: (_, { endpoint }) => deletePushSubscription(endpoint),
}
