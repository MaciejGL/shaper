import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  createSupportChat,
  getMessengerInitialData,
  getMyChats,
  getOrCreateChat,
  getTotalUnreadCount,
  markMessagesAsRead,
  searchUsersForChat,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getOrCreateChat: (_, { partnerId }, context) =>
    getOrCreateChat({ partnerId }, context),
  getMyChats: (_, __, context) => getMyChats(context),
  getTotalUnreadCount: (_, __, context) => getTotalUnreadCount(context),
  getMessengerInitialData: (_, { messagesPerChat }, context) =>
    getMessengerInitialData({ messagesPerChat }, context),
  searchUsersForChat: (_, { query }, context) =>
    searchUsersForChat({ query }, context),
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  markMessagesAsRead: (_, { input }, context) =>
    markMessagesAsRead(input, context),
  createSupportChat: (_, { userId }, context) =>
    createSupportChat({ userId }, context),
}
