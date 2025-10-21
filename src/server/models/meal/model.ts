import { GQLMeal, GQLMealIngredient } from '@/generated/graphql-server'
import {
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  Team as PrismaTeam,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
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
      protein: this.data.ingredient.proteinPer100g * multiplier,
      carbs: this.data.ingredient.carbsPer100g * multiplier,
      fat: this.data.ingredient.fatPer100g * multiplier,
      calories: this.data.ingredient.caloriesPer100g * multiplier,
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
      _count?: {
        planMeals?: number
      }
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

  get archived() {
    return this.data.archived || false
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
      protein: (totals.protein * 10) / 10,
      carbs: (totals.carbs * 10) / 10,
      fat: (totals.fat * 10) / 10,
      calories: totals.calories,
    }
  }

  /**
   * Calculate macros for this meal with a portion multiplier
   */
  calculateMacrosWithPortion(portionMultiplier: number): MacroTotals {
    const baseMacros = this.totalMacros

    return {
      protein: (baseMacros.protein * portionMultiplier * 10) / 10,
      carbs: (baseMacros.carbs * portionMultiplier * 10) / 10,
      fat: (baseMacros.fat * portionMultiplier * 10) / 10,
      calories: baseMacros.calories * portionMultiplier,
    }
  }

  /**
   * Count how many nutrition plans use this meal
   * Uses pre-fetched count if available to avoid N+1 queries
   */
  async usageCount(): Promise<number> {
    // Use pre-fetched count if available
    if (this.data._count?.planMeals !== undefined) {
      return this.data._count.planMeals
    }

    console.warn('[Meal] Usage count not pre-fetched, querying database')

    // Fallback to query if not pre-fetched
    return await prisma.nutritionPlanMeal.count({
      where: {
        mealId: this.data.id,
      },
    })
  }
}
