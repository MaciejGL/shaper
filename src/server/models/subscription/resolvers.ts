import { GQLQueryResolvers } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import { getSubscriptionStats, getTrainerRevenue } from './factory'

export const Query: GQLQueryResolvers = {
  getSubscriptionStats: async (_, __, context: GQLContext) =>
    getSubscriptionStats(context),

  getTrainerRevenue: async (_, args, context: GQLContext) =>
    getTrainerRevenue(args, context),
}
