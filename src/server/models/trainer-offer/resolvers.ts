import { GQLQueryResolvers } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import { getClientTrainerOffers } from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getClientTrainerOffers: async (_, args, context) =>
    getClientTrainerOffers(args, context),
}
