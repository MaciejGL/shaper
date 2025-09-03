import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import { getMyChats, getOrCreateChat, markMessagesAsRead } from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getOrCreateChat: (_, { partnerId }, context) =>
    getOrCreateChat({ partnerId }, context),
  getMyChats: (_, __, context) => getMyChats(context),
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  markMessagesAsRead: (_, { input }, context) =>
    markMessagesAsRead(input, context),
}
