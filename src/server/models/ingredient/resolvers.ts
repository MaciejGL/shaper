import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  createGlobalIngredient,
  getIngredientById,
  getPopularIngredients,
  getRecentIngredients,
  searchGlobalIngredients,
  updateIngredient,
} from './factory'
import Ingredient from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  searchIngredients: async (_, { query, limit }, context) => {
    try {
      const ingredients = await searchGlobalIngredients(query, limit || 50)
      return ingredients.map(
        (ingredient) => new Ingredient(ingredient, context),
      )
    } catch (error) {
      console.error('Error searching ingredients:', error)
      throw new Error('Failed to search ingredients')
    }
  },

  ingredient: async (_, { id }, context) => {
    try {
      const ingredient = await getIngredientById(id)
      if (!ingredient) {
        throw new Error('Ingredient not found')
      }
      return new Ingredient(ingredient, context)
    } catch (error) {
      console.error('Error fetching ingredient:', error)
      if (error instanceof Error && error.message === 'Ingredient not found') {
        throw error
      }
      throw new Error('Failed to fetch ingredient')
    }
  },

  recentIngredients: async (_, { limit }, context) => {
    try {
      const ingredients = await getRecentIngredients(limit || 20)
      return ingredients.map(
        (ingredient) => new Ingredient(ingredient, context),
      )
    } catch (error) {
      console.error('Error fetching recent ingredients:', error)
      throw new Error('Failed to fetch recent ingredients')
    }
  },

  popularIngredients: async (_, { limit }, context) => {
    try {
      const ingredients = await getPopularIngredients(limit || 20)
      return ingredients.map(
        (ingredient) => new Ingredient(ingredient, context),
      )
    } catch (error) {
      console.error('Error fetching popular ingredients:', error)
      throw new Error('Failed to fetch popular ingredients')
    }
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createIngredient: async (_, { input }, context) => {
    try {
      const ingredient = await createGlobalIngredient(input)
      return new Ingredient(ingredient, context)
    } catch (error) {
      console.error('Error creating ingredient:', error)
      if (error instanceof Error) {
        throw error // Re-throw validation errors with original message
      }
      throw new Error('Failed to create ingredient')
    }
  },

  updateIngredient: async (_, { id, input }, context) => {
    try {
      const ingredient = await updateIngredient(id, input)
      return new Ingredient(ingredient, context)
    } catch (error) {
      console.error('Error updating ingredient:', error)
      if (error instanceof Error) {
        throw error // Re-throw validation errors with original message
      }
      throw new Error('Failed to update ingredient')
    }
  },
}
