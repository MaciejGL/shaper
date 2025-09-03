import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  getMessengerInitialData,
  getMyChats,
  getOrCreateChat,
  getTotalUnreadCount,
  markMessagesAsRead,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getOrCreateChat: (_, { partnerId }, context) =>
    getOrCreateChat({ partnerId }, context),
  getMyChats: (_, __, context) => getMyChats(context),
  getTotalUnreadCount: (_, __, context) => getTotalUnreadCount(context),
  getMessengerInitialData: (_, { messagesPerChat }, context) =>
    getMessengerInitialData({ messagesPerChat }, context),
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  markMessagesAsRead: (_, { input }, context) =>
    markMessagesAsRead(input, context),
}
