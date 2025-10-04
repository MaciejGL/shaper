import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  createFavouriteWorkout,
  deleteFavouriteWorkout,
  getFavouriteWorkout,
  getFavouriteWorkouts,
  removeFavouriteExercise,
  startWorkoutFromFavourite,
  updateFavouriteExerciseSets,
  updateFavouriteWorkout,
} from './factory'

export const Query: GQLQueryResolvers = {
  getFavouriteWorkouts: async (_, __, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await getFavouriteWorkouts(user.user.id, context)
  },

  getFavouriteWorkout: async (_, { id }, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    const favouriteWorkout = await getFavouriteWorkout(
      id,
      user.user.id,
      context,
    )

    if (!favouriteWorkout) {
      throw new Error('Favourite workout not found')
    }

    return favouriteWorkout
  },
}

export const Mutation: GQLMutationResolvers = {
  createFavouriteWorkout: async (_, { input }, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await createFavouriteWorkout(input, user.user.id, context)
  },

  updateFavouriteWorkout: async (_, { input }, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await updateFavouriteWorkout(input, user.user.id, context)
  },

  updateFavouriteExerciseSets: async (_, { exerciseId, setCount }, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await updateFavouriteExerciseSets(exerciseId, setCount, user.user.id)
  },

  removeFavouriteExercise: async (_, { exerciseId }, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await removeFavouriteExercise(exerciseId, user.user.id)
  },

  deleteFavouriteWorkout: async (_, { id }, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await deleteFavouriteWorkout(id, user.user.id)
  },

  startWorkoutFromFavourite: async (_, args, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await startWorkoutFromFavourite(args, user.user.id)
  },
}
