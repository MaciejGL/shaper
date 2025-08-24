import { GQLQueryResolvers } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import { getMySubscriptionStatus, getMySubscriptions } from './factory'

export const Query: GQLQueryResolvers = {
  getMySubscriptions: async (_, __, context: GQLContext) =>
    getMySubscriptions(context),

  getMySubscriptionStatus: async (_, __, context: GQLContext) =>
    getMySubscriptionStatus(context),
}
