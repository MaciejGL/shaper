import { GQLUserRole } from '@/generated/graphql-client'
import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { requireAuth } from '@/lib/getUser'
import { GQLContext } from '@/types/gql-context'

import {
  addIngredientToMealWithValidation,
  createMealWithValidation,
  deleteMealWithValidation,
  getMealById,
  getTrainerTeamId,
  removeIngredientFromMealWithValidation,
  reorderMealIngredientsWithValidation,
  searchTeamMeals,
  updateMealIngredientWithValidation,
  updateMealWithValidation,
} from './factory'
import Meal, { MealIngredient } from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  teamMeals: async (_, { searchQuery }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const teamId = await getTrainerTeamId(user.user.id)
    const meals = await searchTeamMeals(teamId, searchQuery || undefined)
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
    const meal = await createMealWithValidation(input, user.user.id)
    return new Meal(meal, context)
  },

  updateMeal: async (_, { id, input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await updateMealWithValidation(id, input, user.user.id)
    return new Meal(meal, context)
  },

  deleteMeal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    return await deleteMealWithValidation(id, user.user.id)
  },

  addIngredientToMeal: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const mealIngredient = await addIngredientToMealWithValidation(
      input,
      user.user.id,
    )
    return new MealIngredient(mealIngredient, context)
  },

  updateMealIngredient: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const mealIngredient = await updateMealIngredientWithValidation(
      input.id,
      input.grams,
      user.user.id,
    )
    return new MealIngredient(mealIngredient, context)
  },

  removeIngredientFromMeal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    return await removeIngredientFromMealWithValidation(id, user.user.id)
  },

  reorderMealIngredients: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const mealIngredients = await reorderMealIngredientsWithValidation(
      input.mealId,
      input.ingredientIds,
      user.user.id,
    )
    return mealIngredients.map((mi) => new MealIngredient(mi, context))
  },
}
