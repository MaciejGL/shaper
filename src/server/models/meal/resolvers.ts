import { GQLUserRole } from '@/generated/graphql-client'
import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { requireAuth } from '@/lib/getUser'
import { captureServerException } from '@/lib/posthog-server'
import { GQLContext } from '@/types/gql-context'

import {
  addIngredientToMeal,
  archiveMeal,
  createMeal,
  deleteMeal,
  duplicateMeal,
  getMealById,
  getTeamMeals,
  removeIngredientFromMeal,
  reorderMealIngredients,
  unarchiveMeal,
  updateMeal,
  updateMealIngredient,
} from './factory'
import Meal, { MealIngredient } from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  teamMeals: async (_, { searchQuery, sortBy, includeArchived }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meals = await getTeamMeals(
      user.user.id,
      searchQuery || undefined,
      sortBy || undefined,
      includeArchived || undefined,
    )
    return meals.map((meal) => new Meal(meal, context))
  },

  meal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await getMealById(id, user.user.id)
    return new Meal(meal, context)
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createMeal: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await createMeal(input, user.user.id)
    return new Meal(meal, context)
  },

  updateMeal: async (_, { id, input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await updateMeal(id, input, user.user.id)
    return new Meal(meal, context)
  },

  deleteMeal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    return await deleteMeal(id, user.user.id)
  },

  duplicateMeal: async (_, { id, newName }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await duplicateMeal(id, user.user.id, newName || undefined)
    return new Meal(meal, context)
  },

  archiveMeal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await archiveMeal(id, user.user.id)
    return new Meal(meal, context)
  },

  unarchiveMeal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await unarchiveMeal(id, user.user.id)
    return new Meal(meal, context)
  },

  addIngredientToMeal: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    try {
      const mealIngredient = await addIngredientToMeal(
        input.mealId,
        input.ingredientId,
        input.grams,
        user.user.id,
      )
      return new MealIngredient(mealIngredient, context)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      captureServerException(err, user.user.id, {
        mutation: 'addIngredientToMeal',
        mealId: input.mealId,
        ingredientId: input.ingredientId,
        grams: input.grams,
      })
      throw error
    }
  },

  updateMealIngredient: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    try {
      const mealIngredient = await updateMealIngredient(
        input.id,
        input.grams,
        user.user.id,
      )
      return new MealIngredient(mealIngredient, context)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      captureServerException(err, user.user.id, {
        mutation: 'updateMealIngredient',
        mealIngredientId: input.id,
        grams: input.grams,
      })
      throw error
    }
  },

  removeIngredientFromMeal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    try {
      return await removeIngredientFromMeal(id, user.user.id)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      captureServerException(err, user.user.id, {
        mutation: 'removeIngredientFromMeal',
        mealIngredientId: id,
      })
      throw error
    }
  },

  reorderMealIngredients: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const mealIngredients = await reorderMealIngredients(
      input.mealId,
      input.ingredientIds,
      user.user.id,
    )
    return mealIngredients.map((mi) => new MealIngredient(mi, context))
  },
}
