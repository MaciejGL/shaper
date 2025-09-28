import { differenceInHours } from 'date-fns'

import {
  GQLNutritionPlan,
  GQLNutritionPlanDay,
  GQLNutritionPlanMeal,
  GQLNutritionPlanMealIngredient,
} from '@/generated/graphql-server'
import {
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  NutritionPlan as PrismaNutritionPlan,
  NutritionPlanDay as PrismaNutritionPlanDay,
  NutritionPlanMeal as PrismaNutritionPlanMeal,
  NutritionPlanMealIngredient as PrismaNutritionPlanMealIngredient,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import { MacroTotals } from '../ingredient/model'
import Meal, { MealIngredient } from '../meal/model'
import UserPublic from '../user-public/model'

export class NutritionPlanMealIngredient
  implements GQLNutritionPlanMealIngredient
{
  constructor(
    protected data: PrismaNutritionPlanMealIngredient & {
      mealIngredient: PrismaMealIngredient & {
        ingredient: PrismaIngredient
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

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get mealIngredient() {
    return new MealIngredient(this.data.mealIngredient, this.context)
  }
}

export class NutritionPlanMeal implements GQLNutritionPlanMeal {
  constructor(
    protected data: PrismaNutritionPlanMeal & {
      meal: PrismaMeal & {
        ingredients?: (PrismaMealIngredient & {
          ingredient: PrismaIngredient
        })[]
        createdBy?: PrismaUser
      }
      ingredientOverrides?: (PrismaNutritionPlanMealIngredient & {
        mealIngredient: PrismaMealIngredient & {
          ingredient: PrismaIngredient
        }
      })[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get orderIndex() {
    return this.data.orderIndex
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get meal() {
    return new Meal(this.data.meal, this.context)
  }

  get ingredientOverrides() {
    return (this.data.ingredientOverrides || []).map(
      (override) => new NutritionPlanMealIngredient(override, this.context),
    )
  }

  /**
   * Calculate adjusted macros for this meal based on ingredient overrides
   */
  get adjustedMacros(): MacroTotals {
    return this.calculateMealMacrosWithOverrides(
      this.data.meal,
      this.data.ingredientOverrides || [],
    )
  }

  /**
   * Calculate macros for a meal with ingredient overrides applied
   */
  private calculateMealMacrosWithOverrides(
    meal: PrismaMeal & {
      ingredients?: (PrismaMealIngredient & {
        ingredient: PrismaIngredient
      })[]
    },
    overrides: PrismaNutritionPlanMealIngredient[],
  ): MacroTotals {
    const overrideMap = new Map(
      overrides.map((override) => [override.mealIngredientId, override.grams]),
    )

    return (meal.ingredients || []).reduce(
      (totals, mealIngredient) => {
        // Use override grams if available, otherwise use blueprint grams
        const grams = overrideMap.get(mealIngredient.id) ?? mealIngredient.grams
        const multiplier = grams / 100

        return {
          protein:
            totals.protein +
            mealIngredient.ingredient.proteinPer100g * multiplier,
          carbs:
            totals.carbs + mealIngredient.ingredient.carbsPer100g * multiplier,
          fat: totals.fat + mealIngredient.ingredient.fatPer100g * multiplier,
          calories:
            totals.calories +
            mealIngredient.ingredient.caloriesPer100g * multiplier,
        }
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 },
    )
  }
}

export class NutritionPlanDay implements GQLNutritionPlanDay {
  constructor(
    protected data: PrismaNutritionPlanDay & {
      meals?: (PrismaNutritionPlanMeal & {
        meal: PrismaMeal & {
          ingredients?: (PrismaMealIngredient & {
            ingredient: PrismaIngredient
          })[]
          createdBy?: PrismaUser
        }
      })[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get dayNumber() {
    return this.data.dayNumber
  }

  get name() {
    return this.data.name
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get meals() {
    return (this.data.meals || []).map(
      (meal) => new NutritionPlanMeal(meal, this.context),
    )
  }

  /**
   * Calculate total macros for all meals in this day
   */
  get dailyMacros(): MacroTotals {
    return (this.data.meals || []).reduce(
      (totals, planMeal) => {
        const mealInstance = new NutritionPlanMeal(planMeal, this.context)
        const adjustedMacros = mealInstance.adjustedMacros

        return {
          protein: totals.protein + adjustedMacros.protein,
          carbs: totals.carbs + adjustedMacros.carbs,
          fat: totals.fat + adjustedMacros.fat,
          calories: totals.calories + adjustedMacros.calories,
        }
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 },
    )
  }

  /**
   * Get number of meals in this day
   */
  get mealCount(): number {
    return this.data.meals?.length || 0
  }
}

export default class NutritionPlan implements GQLNutritionPlan {
  constructor(
    protected data: PrismaNutritionPlan & {
      trainer?: PrismaUser
      client?: PrismaUser
      days?: (PrismaNutritionPlanDay & {
        meals?: (PrismaNutritionPlanMeal & {
          meal: PrismaMeal & {
            ingredients: (PrismaMealIngredient & {
              ingredient: PrismaIngredient
            })[]
            createdBy?: PrismaUser
          }
        })[]
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
    return this.data.description
  }

  get isSharedWithClient() {
    return this.data.isSharedWithClient
  }

  get sharedAt() {
    return this.data.sharedAt?.toISOString() || null
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  get trainer() {
    return this.data.trainer
      ? new UserPublic(this.data.trainer, this.context)
      : null
  }

  get client() {
    return this.data.client
      ? new UserPublic(this.data.client, this.context)
      : null
  }

  get days() {
    return (
      this.data.days?.map((day) => {
        const dayWithMeals = { ...day, meals: day.meals || [] }
        return new NutritionPlanDay(dayWithMeals, this.context)
      }) || []
    )
  }

  /**
   * Check if the plan can be unshared (within 24-hour window)
   */
  get canUnshare(): boolean {
    if (!this.data.isSharedWithClient || !this.data.sharedAt) {
      return false
    }

    const hoursSinceShared = differenceInHours(new Date(), this.data.sharedAt)
    return hoursSinceShared < 24
  }

  /**
   * Get hours remaining for unsharing
   */
  get hoursUntilUnshareExpiry(): number | null {
    if (!this.data.isSharedWithClient || !this.data.sharedAt) {
      return null
    }

    const hoursSinceShared = differenceInHours(new Date(), this.data.sharedAt)
    const remainingHours = 24 - hoursSinceShared

    return Math.max(0, remainingHours)
  }

  /**
   * Calculate average daily macros across all days
   */
  get averageDailyMacros(): MacroTotals {
    if (!this.data.days || this.data.days.length === 0) {
      return { protein: 0, carbs: 0, fat: 0, calories: 0 }
    }

    const totalMacros = this.data.days.reduce(
      (totals, day) => {
        const dayWithMeals = { ...day, meals: day.meals || [] }
        const dayInstance = new NutritionPlanDay(dayWithMeals, this.context)
        const dailyMacros = dayInstance.dailyMacros

        return {
          protein: totals.protein + dailyMacros.protein,
          carbs: totals.carbs + dailyMacros.carbs,
          fat: totals.fat + dailyMacros.fat,
          calories: totals.calories + dailyMacros.calories,
        }
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 },
    )

    const dayCount = this.data.days.length

    return {
      protein: Math.round((totalMacros.protein / dayCount) * 10) / 10,
      carbs: Math.round((totalMacros.carbs / dayCount) * 10) / 10,
      fat: Math.round((totalMacros.fat / dayCount) * 10) / 10,
      calories: Math.round(totalMacros.calories / dayCount),
    }
  }

  /**
   * Get total number of days in the plan
   */
  get dayCount(): number {
    return this.data.days?.length || 0
  }

  /**
   * Get total number of meals across all days
   */
  get totalMealCount(): number {
    return (
      this.data.days?.reduce(
        (total, day) => total + (day.meals?.length || 0),
        0,
      ) || 0
    )
  }

  /**
   * Get plan duration range
   */
  get planDurationRange(): { minDay: number; maxDay: number } | null {
    if (!this.data.days || this.data.days.length === 0) {
      return null
    }

    const dayNumbers = this.data.days.map((day) => day.dayNumber)

    return {
      minDay: Math.min(...dayNumbers),
      maxDay: Math.max(...dayNumbers),
    }
  }

  /**
   * Check if plan has consecutive days
   */
  get hasConsecutiveDays(): boolean {
    if (!this.data.days || this.data.days.length <= 1) {
      return true
    }

    const sortedDayNumbers = this.data.days
      .map((day) => day.dayNumber)
      .sort((a, b) => a - b)

    for (let i = 1; i < sortedDayNumbers.length; i++) {
      if (sortedDayNumbers[i] !== sortedDayNumbers[i - 1] + 1) {
        return false
      }
    }

    return true
  }

  /**
   * Get plan completeness score (0-1)
   */
  get completenessScore(): number {
    if (!this.data.days || this.data.days.length === 0) {
      return 0
    }

    const daysWithMeals = this.data.days.filter(
      (day) => day.meals && day.meals.length > 0,
    ).length

    return daysWithMeals / this.data.days.length
  }

  /**
   * Get macro distribution for visualization
   */
  get macroDistribution(): {
    proteinPercentage: number
    carbsPercentage: number
    fatPercentage: number
  } {
    const avgMacros = this.averageDailyMacros

    // Calculate calories from each macro
    const proteinCalories = avgMacros.protein * 4
    const carbsCalories = avgMacros.carbs * 4
    const fatCalories = avgMacros.fat * 9

    const totalCalories = proteinCalories + carbsCalories + fatCalories

    if (totalCalories === 0) {
      return { proteinPercentage: 0, carbsPercentage: 0, fatPercentage: 0 }
    }

    return {
      proteinPercentage: Math.round((proteinCalories / totalCalories) * 100),
      carbsPercentage: Math.round((carbsCalories / totalCalories) * 100),
      fatPercentage: Math.round((fatCalories / totalCalories) * 100),
    }
  }
}
