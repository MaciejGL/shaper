import {
  Meal as PrismaMeal,
  MealDay as PrismaMealDay,
  MealFood as PrismaMealFood,
  MealLog as PrismaMealLog,
  MealLogItem as PrismaMealLogItem,
} from '@prisma/client'

import { GQLMeal } from '@/generated/graphql-server'
import { openFoodFactsClient } from '@/lib/open-food-facts/client'
import { GQLContext } from '@/types/gql-context'

import MealLog from '../meal-log/model'

export default class Meal implements GQLMeal {
  constructor(
    protected data: PrismaMeal & {
      day?: PrismaMealDay
      foods?: PrismaMealFood[]
      logs?: (PrismaMealLog & {
        items?: PrismaMealLogItem[]
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
    return this.data.instructions
  }

  get dateTime() {
    return this.data.dateTime.toISOString()
  }

  get instructions() {
    return this.data.instructions
  }

  async day() {
    return null
  }

  async foods() {
    return []
  }

  async logs() {
    return this.data.logs?.map((log) => new MealLog(log, this.context)) || []
  }

  // Calculated nutrition fields from planned foods
  get plannedCalories() {
    if (!this.data.foods) return 0

    let total = 0
    this.data.foods.forEach((food) => {
      if (food.caloriesPer100g && food.quantity && food.unit) {
        const nutrition = openFoodFactsClient.calculateNutrition(
          food,
          food.quantity,
          food.unit,
        )
        total += nutrition.calories
      }
    })

    return Math.round(total * 100) / 100
  }

  get plannedProtein() {
    if (!this.data.foods) return 0

    let total = 0
    this.data.foods.forEach((food) => {
      if (food.proteinPer100g && food.quantity && food.unit) {
        const nutrition = openFoodFactsClient.calculateNutrition(
          food,
          food.quantity,
          food.unit,
        )
        total += nutrition.protein
      }
    })

    return Math.round(total * 100) / 100
  }

  get plannedCarbs() {
    if (!this.data.foods) return 0

    let total = 0
    this.data.foods.forEach((food) => {
      if (food.carbsPer100g && food.quantity && food.unit) {
        const nutrition = openFoodFactsClient.calculateNutrition(
          food,
          food.quantity,
          food.unit,
        )
        total += nutrition.carbs
      }
    })

    return Math.round(total * 100) / 100
  }

  get plannedFat() {
    if (!this.data.foods) return 0

    let total = 0
    this.data.foods.forEach((food) => {
      if (food.fatPer100g && food.quantity && food.unit) {
        const nutrition = openFoodFactsClient.calculateNutrition(
          food,
          food.quantity,
          food.unit,
        )
        total += nutrition.fat
      }
    })

    return Math.round(total * 100) / 100
  }

  get loggedCalories() {
    return 0
  }
  get loggedCarbs() {
    return 0
  }
  get loggedFat() {
    return 0
  }
  get loggedProtein() {
    return 0
  }
}
