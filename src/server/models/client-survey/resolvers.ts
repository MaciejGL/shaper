import { GraphQLError } from 'graphql'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  getClientSurveyForTrainee,
  getMyClientSurvey,
  upsertClientSurvey,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getMyClientSurvey: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new GraphQLError('User not found')
    }

    return getMyClientSurvey({ user, context })
  },

  getClientSurveyForTrainee: async (_, { traineeId }, context) => {
    const user = context.user
    if (!user) {
      throw new GraphQLError('User not found')
    }

    return getClientSurveyForTrainee({ traineeId, user, context })
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  upsertClientSurvey: async (_, { data }, context) => {
    const user = context.user
    if (!user) {
      throw new GraphQLError('User not found')
    }

    return upsertClientSurvey({ data, user, context })
  },
}
