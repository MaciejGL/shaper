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

import MealFood from '../meal-food/model'
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
    return (
      this.data.foods?.map((food) => new MealFood(food, this.context)) || []
    )
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
    if (!this.data.logs) return 0

    let total = 0
    this.data.logs.forEach((log) => {
      log.items?.forEach((item) => {
        total += item.calories || 0
      })
    })

    return Math.round(total * 100) / 100
  }

  get loggedCarbs() {
    if (!this.data.logs) return 0

    let total = 0
    this.data.logs.forEach((log) => {
      log.items?.forEach((item) => {
        total += item.carbs || 0
      })
    })

    return Math.round(total * 100) / 100
  }

  get loggedFat() {
    if (!this.data.logs) return 0

    let total = 0
    this.data.logs.forEach((log) => {
      log.items?.forEach((item) => {
        total += item.fat || 0
      })
    })

    return Math.round(total * 100) / 100
  }

  get loggedProtein() {
    if (!this.data.logs) return 0

    let total = 0
    this.data.logs.forEach((log) => {
      log.items?.forEach((item) => {
        total += item.protein || 0
      })
    })

    return Math.round(total * 100) / 100
  }

  get completedAt() {
    // Find the most recent completion date from logs
    if (!this.data.logs || this.data.logs.length === 0) return null

    const completedLogs = this.data.logs.filter((log) => log.completedAt)
    if (completedLogs.length === 0) return null

    // Return the most recent completion date
    const latestCompletion = completedLogs.reduce((latest, log) => {
      if (
        !latest ||
        (log.completedAt && log.completedAt > latest.completedAt!)
      ) {
        return log
      }
      return latest
    })

    return latestCompletion.completedAt?.toISOString() || null
  }
}
