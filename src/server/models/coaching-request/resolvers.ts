import {
  GQLMutationResolvers,
  GQLQueryResolvers,
  GQLUserRole,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  acceptCoachingRequest,
  cancelCoachingRequest,
  getCoachingRequest,
  getCoachingRequests,
  rejectCoachingRequest,
  upsertCoachingRequest,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  coachingRequest: async (_, { id }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    return getCoachingRequest({ id, user })
  },
  coachingRequests: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    return getCoachingRequests({ user })
  },
}

export const Mutation: GQLMutationResolvers = {
  createCoachingRequest: async (_, args, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    return upsertCoachingRequest({
      senderId: user.user.id,
      recipientEmail: args.recipientEmail,
      message: args.message,
    })
  },
  acceptCoachingRequest: async (_, { id }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    return acceptCoachingRequest({
      id,
      recipientId: user.user.id,
      recipientRole: user.user.role as GQLUserRole,
    })
  },
  cancelCoachingRequest: async (_, { id }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    return cancelCoachingRequest({ id, senderId: user.user.id })
  },
  rejectCoachingRequest: async (_, { id }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    return rejectCoachingRequest({ id, recipientId: user.user.id })
  },
}
