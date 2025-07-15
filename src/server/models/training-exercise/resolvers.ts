import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  addAiExerciseToWorkout,
  addExercisesToQuickWorkout,
  addExercisesToWorkout,
  addSet,
  addSetExerciseForm,
  clearTodaysWorkout,
  generateAiWorkout,
  getAiExerciseSuggestions,
  getTrainingExercise,
  removeExerciseFromWorkout,
  removeSet,
  removeSetExerciseForm,
  swapExercise,
  updateExerciseForm,
} from './factory'

export const Query: GQLQueryResolvers = {
  getTrainingExercise: async (_, { id }, context) => {
    return getTrainingExercise(id, context)
  },
}

export const Mutation: GQLMutationResolvers = {
  // Fitspace
  getAiExerciseSuggestions: async (_, { dayId }, context) => {
    return getAiExerciseSuggestions(dayId, context)
  },
  generateAiWorkout: async (_, { input }, context) => {
    return generateAiWorkout(input, context)
  },
  addExercisesToWorkout: async (_, { input }, context) => {
    return addExercisesToWorkout(
      input.workoutId ?? '',
      input.exerciseIds,
      context,
    )
  },
  removeExerciseFromWorkout: async (_, { exerciseId }, context) => {
    return removeExerciseFromWorkout(exerciseId, context)
  },
  clearTodaysWorkout: async (_, __, context) => {
    return clearTodaysWorkout(context)
  },
  addSet: async (_, { exerciseId }, context) => {
    return addSet(exerciseId, context)
  },
  removeSet: async (_, { setId }, context) => {
    return removeSet(setId, context)
  },
  addAiExerciseToWorkout: async (_, { input }, context) => {
    return addAiExerciseToWorkout(input, context)
  },
  updateExerciseForm: async (_, { input }, context) => {
    return updateExerciseForm(input, context)
  },
  swapExercise: async (_, { exerciseId, substituteId }, context) => {
    return swapExercise(exerciseId, substituteId, context)
  },
  addExercisesToQuickWorkout: async (_, { exercises }, context) => {
    return addExercisesToQuickWorkout(exercises, context)
  },

  // TRAINER
  addSetExerciseForm: async (_, { input }, context) => {
    return addSetExerciseForm(input, context)
  },
  removeSetExerciseForm: async (_, { setId }, context) => {
    return removeSetExerciseForm(setId, context)
  },
}
