import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  markExerciseAsCompleted,
  markSetAsCompleted,
  updateSetLog,
} from './factory'

export const Query: GQLQueryResolvers = {}

export const Mutation: GQLMutationResolvers = {
  updateSetLog: async (_, input) => {
    return updateSetLog(input)
  },
  markSetAsCompleted: async (_, args) => {
    return markSetAsCompleted(args)
  },
  markExerciseAsCompleted: async (_, args) => {
    return markExerciseAsCompleted(args)
  },
}
