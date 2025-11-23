import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  createFavouriteWorkout,
  createFavouriteWorkoutFolder,
  deleteFavouriteWorkout,
  deleteFavouriteWorkoutFolder,
  getFavouriteWorkout,
  getFavouriteWorkoutFolders,
  getFavouriteWorkouts,
  removeFavouriteExercise,
  startWorkoutFromFavourite,
  updateFavouriteExerciseSets,
  updateFavouriteExercisesOrder,
  updateFavouriteWorkout,
  updateFavouriteWorkoutFolder,
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

  getFavouriteWorkoutFolders: async (_, __, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await getFavouriteWorkoutFolders(user.user.id, context)
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

  updateFavouriteExercisesOrder: async (
    _,
    { favouriteId, exerciseOrders },
    context,
  ) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await updateFavouriteExercisesOrder(
      favouriteId,
      exerciseOrders,
      user.user.id,
    )
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

  createFavouriteWorkoutFolder: async (_, { input }, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await createFavouriteWorkoutFolder(input, user.user.id, context)
  },

  updateFavouriteWorkoutFolder: async (_, { input }, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await updateFavouriteWorkoutFolder(input, user.user.id, context)
  },

  deleteFavouriteWorkoutFolder: async (_, { id }, context) => {
    const user = context.user

    if (!user?.user?.id) {
      throw new Error('User not authenticated')
    }

    return await deleteFavouriteWorkoutFolder(id, user.user.id)
  },
}
