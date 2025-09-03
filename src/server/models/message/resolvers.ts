import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  deleteMessage,
  editMessage,
  getChatMessages,
  sendMessage,
} from './factory'

export const Query: GQLQueryResolvers = {
  getChatMessages: (_, args, context) => getChatMessages(args, context),
}

export const Mutation: GQLMutationResolvers = {
  sendMessage: (_, { input }, context) => sendMessage(input, context),
  editMessage: (_, { input }, context) => editMessage(input, context),
  deleteMessage: (_, { id }, context) => deleteMessage({ id }, context),
}
