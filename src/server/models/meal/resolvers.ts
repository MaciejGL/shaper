import { GQLUserRole } from '@/generated/graphql-client'
import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { requireAuth } from '@/lib/getUser'
import { GQLContext } from '@/types/gql-context'

import {
  addIngredientToMeal,
  createMeal,
  deleteMeal,
  getMealById,
  getTeamMeals,
  removeIngredientFromMeal,
  reorderMealIngredients,
  updateMeal,
  updateMealIngredient,
} from './factory'
import Meal, { MealIngredient } from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  teamMeals: async (_, { searchQuery }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meals = await getTeamMeals(user.user.id, searchQuery || undefined)
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

  addIngredientToMeal: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const mealIngredient = await addIngredientToMeal(
      input.mealId,
      input.ingredientId,
      input.grams,
      user.user.id,
    )
    return new MealIngredient(mealIngredient, context)
  },

  updateMealIngredient: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const mealIngredient = await updateMealIngredient(
      input.id,
      input.grams,
      user.user.id,
    )
    return new MealIngredient(mealIngredient, context)
  },

  removeIngredientFromMeal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    return await removeIngredientFromMeal(id, user.user.id)
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
