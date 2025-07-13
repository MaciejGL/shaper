import {
  Meal as PrismaMeal,
  MealDay as PrismaMealDay,
  MealFood as PrismaMealFood,
  MealFoodLog as PrismaMealFoodLog,
  MealPlan as PrismaMealPlan,
  MealWeek as PrismaMealWeek,
} from '@prisma/client'

import { GQLMealWeek } from '@/generated/graphql-server'
import { openFoodFactsClient } from '@/lib/open-food-facts/client'
import { GQLContext } from '@/types/gql-context'

import MealDay from '../meal-day/model'
import MealPlan from '../meal-plan/model'

export default class MealWeek implements GQLMealWeek {
  constructor(
    protected data: PrismaMealWeek & {
      plan?: PrismaMealPlan
      days?: (PrismaMealDay & {
        meals?: (PrismaMeal & {
          foods?: (PrismaMealFood & {
            logs?: PrismaMealFoodLog[]
          })[]
        })[]
      })[]
    },

    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get weekNumber() {
    return this.data.weekNumber
  }

  get name() {
    return this.data.name
  }

  get description() {
    return this.data.description
  }

  get completedAt() {
    return this.data.completedAt?.toISOString() || null
  }

  get isExtra() {
    return this.data.isExtra || false
  }

  async days() {
    return this.data.days?.map((day) => new MealDay(day, this.context)) || []
  }

  async plan() {
    return this.data.plan ? new MealPlan(this.data.plan, this.context) : null
  }

  // Calculated nutrition fields
  get totalCalories() {
    if (!this.data.days) return 0

    let total = 0
    this.data.days.forEach((day) => {
      day.meals?.forEach((meal) => {
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
    })

    return Math.round(total * 100) / 100
  }

  get totalProtein() {
    if (!this.data.days) return 0

    let total = 0
    this.data.days.forEach((day) => {
      day.meals?.forEach((meal) => {
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
    })

    return Math.round(total * 100) / 100
  }

  get totalCarbs() {
    if (!this.data.days) return 0

    let total = 0
    this.data.days.forEach((day) => {
      day.meals?.forEach((meal) => {
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
    })

    return Math.round(total * 100) / 100
  }

  get totalFat() {
    if (!this.data.days) return 0

    let total = 0
    this.data.days.forEach((day) => {
      day.meals?.forEach((meal) => {
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
    })

    return Math.round(total * 100) / 100
  }
}
