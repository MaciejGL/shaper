import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  markExerciseAsCompleted,
  markSetAsCompleted,
  markWorkoutAsCompleted,
  updateSetLog,
} from './factory'

export const Query: GQLQueryResolvers = {}

export const Mutation: GQLMutationResolvers = {
  updateSetLog: async (_, input) => {
    return updateSetLog(input)
  },
  markSetAsCompleted: async (_, args, context) => {
    return markSetAsCompleted(args, context)
  },
  markExerciseAsCompleted: async (_, args) => {
    return markExerciseAsCompleted(args)
  },
  markWorkoutAsCompleted: async (_, args) => {
    return markWorkoutAsCompleted(args)
  },
}
