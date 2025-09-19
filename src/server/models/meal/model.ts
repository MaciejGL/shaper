import { GQLMeal, GQLMealIngredient } from '@/generated/graphql-server'
import {
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  Team as PrismaTeam,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import Ingredient, { MacroTotals } from '../ingredient/model'
import Team from '../team/model'
import UserPublic from '../user-public/model'

export class MealIngredient implements GQLMealIngredient {
  constructor(
    protected data: PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy?: PrismaUser | null
      }
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get grams() {
    return this.data.grams
  }

  get order() {
    return this.data.orderIndex
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get ingredient() {
    return new Ingredient(this.data.ingredient, this.context)
  }

  /**
   * Calculate macros for this meal ingredient
   */
  get macros(): MacroTotals {
    const multiplier = this.data.grams / 100

    return {
      protein:
        Math.round(this.data.ingredient.proteinPer100g * multiplier * 10) / 10,
      carbs:
        Math.round(this.data.ingredient.carbsPer100g * multiplier * 10) / 10,
      fat: Math.round(this.data.ingredient.fatPer100g * multiplier * 10) / 10,
      calories: Math.round(this.data.ingredient.caloriesPer100g * multiplier),
    }
  }
}

export default class Meal implements GQLMeal {
  constructor(
    protected data: PrismaMeal & {
      createdBy?: PrismaUser | null
      team?: PrismaTeam | null
      ingredients?: (PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy?: PrismaUser | null
        }
      })[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get description() {
    return this.data.description || null
  }

  get instructions() {
    return this.data.instructions || []
  }

  get preparationTime() {
    return this.data.preparationTime || null
  }

  get cookingTime() {
    return this.data.cookingTime || null
  }

  get servings() {
    return this.data.servings || null
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  get createdBy() {
    const createdBy = this.data.createdBy
    if (createdBy) {
      return new UserPublic(createdBy, this.context)
    }
    return null
  }

  get team() {
    const team = this.data.team
    if (team) {
      return new Team(team, this.context)
    }
    return null
  }

  get ingredients() {
    return (
      this.data.ingredients?.map(
        (ingredient) => new MealIngredient(ingredient, this.context),
      ) || []
    )
  }

  /**
   * Calculate total macros for this meal
   */
  get totalMacros(): MacroTotals {
    const ingredients = this.ingredients

    const totals = ingredients.reduce(
      (totals, ingredient) => {
        const ingredientMacros = ingredient.macros
        return {
          protein: totals.protein + ingredientMacros.protein,
          carbs: totals.carbs + ingredientMacros.carbs,
          fat: totals.fat + ingredientMacros.fat,
          calories: totals.calories + ingredientMacros.calories,
        }
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 },
    )

    // Round values for consistency
    return {
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      calories: Math.round(totals.calories),
    }
  }

  /**
   * Calculate macros for this meal with a portion multiplier
   */
  calculateMacrosWithPortion(portionMultiplier: number): MacroTotals {
    const baseMacros = this.totalMacros

    return {
      protein: Math.round(baseMacros.protein * portionMultiplier * 10) / 10,
      carbs: Math.round(baseMacros.carbs * portionMultiplier * 10) / 10,
      fat: Math.round(baseMacros.fat * portionMultiplier * 10) / 10,
      calories: Math.round(baseMacros.calories * portionMultiplier),
    }
  }
}
