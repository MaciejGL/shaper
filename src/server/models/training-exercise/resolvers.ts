import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  addAiExerciseToWorkout,
  addExercisesToWorkout,
  addSet,
  addSetExerciseForm,
  getAiExerciseSuggestions,
  getTrainingExercise,
  removeExerciseFromWorkout,
  removeSet,
  removeSetExerciseForm,
  updateExerciseForm,
} from './factory'

export const Query: GQLQueryResolvers = {
  getTrainingExercise: async (_, { id }, context) => {
    return getTrainingExercise(id, context)
  },
}

export const Mutation: GQLMutationResolvers = {
  getAiExerciseSuggestions: async (_, { dayId }, context) => {
    return getAiExerciseSuggestions(dayId, context)
  },
  addExercisesToWorkout: async (_, { input }, context) => {
    return addExercisesToWorkout(input.workoutId, input.exerciseIds, context)
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
  addAiExerciseToWorkout: async (_, { input }, context) => {
    return addAiExerciseToWorkout(input, context)
  },
  updateExerciseForm: async (_, { input }, context) => {
    return updateExerciseForm(input, context)
  },

  addSetExerciseForm: async (_, { input }, context) => {
    return addSetExerciseForm(input, context)
  },
  removeSetExerciseForm: async (_, { setId }) => {
    return removeSetExerciseForm(setId)
  },
}
