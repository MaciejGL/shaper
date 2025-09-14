import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  createBodyProgressLogEntry,
  deleteBodyProgressLogEntry,
  getClientBodyProgressLogs,
  getUserBodyProgressLogs,
  updateBodyProgressLogEntry,
  updateBodyProgressLogSharingStatus,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  userBodyProgressLogs: async (_parent, { userProfileId }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    return getUserBodyProgressLogs(userSession.user.id, userProfileId)
  },

  clientBodyProgressLogs: async (_parent, { clientId }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    return getClientBodyProgressLogs(userSession.user.id, clientId)
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createBodyProgressLog: async (_parent, { input }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    return createBodyProgressLogEntry(userSession.user.id, input, context)
  },

  updateBodyProgressLog: async (_parent, { id, input }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    return updateBodyProgressLogEntry(userSession.user.id, id, input)
  },

  updateBodyProgressLogSharingStatus: async (
    _parent,
    { id, shareWithTrainer },
    context,
  ) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    return updateBodyProgressLogSharingStatus(
      userSession.user.id,
      id,
      shareWithTrainer,
      context,
    )
  },

  deleteBodyProgressLog: async (_parent, { id }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    return deleteBodyProgressLogEntry(userSession.user.id, id)
  },
}
