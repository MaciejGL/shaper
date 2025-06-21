import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  addExerciseToWorkout,
  addSet,
  removeExerciseFromWorkout,
  removeSet,
} from './factory'

export const Query: GQLQueryResolvers = {}

export const Mutation: GQLMutationResolvers = {
  addExerciseToWorkout: async (_, { input }, context) => {
    return addExerciseToWorkout(input.workoutId, input.exerciseId, context)
  },
  removeExerciseFromWorkout: async (_, { exerciseId }) => {
    return removeExerciseFromWorkout(exerciseId)
  },
  addSet: async (_, { exerciseId }) => {
    return addSet(exerciseId)
  },
  removeSet: async (_, { setId }) => {
    return removeSet(setId)
  },
}
