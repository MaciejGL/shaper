import { dayNames } from '@/app/(protected)/trainer/trainings/creator/utils'
import { GQLMealDay } from '@/generated/graphql-server'
import {
  Meal as PrismaMeal,
  MealDay as PrismaMealDay,
  MealFood as PrismaMealFood,
  MealFoodLog as PrismaMealFoodLog,
  MealWeek as PrismaMealWeek,
} from '@/generated/prisma/client'
import { openFoodFactsClient } from '@/lib/open-food-facts/client'
import { GQLContext } from '@/types/gql-context'

import MealWeek from '../meal-week/model'
import Meal from '../meal/model'

export default class MealDay implements GQLMealDay {
  constructor(
    protected data: PrismaMealDay & {
      week?: PrismaMealWeek
      meals?: (PrismaMeal & {
        foods?: (PrismaMealFood & {
          logs?: PrismaMealFoodLog[]
        })[]
      })[]
    },

    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get dayOfWeek() {
    return this.data.dayOfWeek
  }

  get name() {
    const days = dayNames
    return days[this.data.dayOfWeek]
  }

  get completedAt() {
    return this.data.completedAt?.toISOString() || null
  }

  get scheduledAt() {
    return this.data.scheduledAt?.toISOString() || null
  }

  get targetCalories() {
    return this.data.targetCalories
  }

  get targetProtein() {
    return this.data.targetProtein
  }

  get targetCarbs() {
    return this.data.targetCarbs
  }

  get targetFat() {
    return this.data.targetFat
  }

  async week() {
    return this.data.week ? new MealWeek(this.data.week, this.context) : null
  }

  async meals() {
    return this.data.meals?.map((meal) => new Meal(meal, this.context)) || []
  }

  // Calculated nutrition fields
  get totalCalories() {
    if (!this.data.meals) return 0

    let total = 0
    this.data.meals.forEach((meal) => {
      meal.foods?.forEach((food) => {
        if (food.caloriesPer100g && food.quantity && food.unit) {
          const nutrition = openFoodFactsClient.calculateNutrition(
            food,
            food.quantity,
            food.unit,
          )
          total += nutrition.calories
        }
      })
    })

    return Math.round(total * 100) / 100
  }

  get totalProtein() {
    if (!this.data.meals) return 0

    let total = 0
    this.data.meals.forEach((meal) => {
      meal.foods?.forEach((food) => {
        if (food.proteinPer100g && food.quantity && food.unit) {
          const nutrition = openFoodFactsClient.calculateNutrition(
            food,
            food.quantity,
            food.unit,
          )
          total += nutrition.protein
        }
      })
    })

    return Math.round(total * 100) / 100
  }

  get totalCarbs() {
    if (!this.data.meals) return 0

    let total = 0
    this.data.meals.forEach((meal) => {
      meal.foods?.forEach((food) => {
        if (food.carbsPer100g && food.quantity && food.unit) {
          const nutrition = openFoodFactsClient.calculateNutrition(
            food,
            food.quantity,
            food.unit,
          )
          total += nutrition.carbs
        }
      })
    })

    return Math.round(total * 100) / 100
  }

  get totalFat() {
    if (!this.data.meals) return 0

    let total = 0
    this.data.meals.forEach((meal) => {
      meal.foods?.forEach((food) => {
        if (food.fatPer100g && food.quantity && food.unit) {
          const nutrition = openFoodFactsClient.calculateNutrition(
            food,
            food.quantity,
            food.unit,
          )
          total += nutrition.fat
        }
      })
    })

    return Math.round(total * 100) / 100
  }

  // Alias methods for GraphQL schema compatibility
  get actualCalories() {
    return this.totalCalories
  }

  get actualProtein() {
    return this.totalProtein
  }

  get actualCarbs() {
    return this.totalCarbs
  }

  get actualFat() {
    return this.totalFat
  }

  get plannedCalories() {
    return this.totalCalories
  }

  get plannedProtein() {
    return this.totalProtein
  }

  get plannedCarbs() {
    return this.totalCarbs
  }

  get plannedFat() {
    return this.totalFat
  }
}
