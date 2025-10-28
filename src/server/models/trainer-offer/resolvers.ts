import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import { getClientTrainerOffers, rejectTrainerOffer } from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getClientTrainerOffers: async (_, args, context) =>
    getClientTrainerOffers(args, context),
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  rejectTrainerOffer: async (_, { offerId, reason }, context) =>
    rejectTrainerOffer(offerId, reason || null, context),
}
