import {
  Meal as PrismaMeal,
  MealDay as PrismaMealDay,
  MealFood as PrismaMealFood,
  MealLog as PrismaMealLog,
  MealLogItem as PrismaMealLogItem,
} from '@prisma/client'

import { GQLMeal } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import MealFoodItem from '../meal-food-item/model'

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

  get dateTime() {
    return this.data.dateTime.toISOString()
  }

  get instructions() {
    return this.data.instructions
  }

  async foods() {
    const foodItems: MealFoodItem[] = []

    // Add planned foods with their consumption logs
    if (this.data.foods) {
      // Get all consumption logs (not custom additions) for this meal
      const consumptionLogs = new Map<string, PrismaMealLogItem>()

      this.data.logs?.forEach((log) => {
        log.items?.forEach((item) => {
          if (!item.isCustomAddition) {
            // Keep only the latest log for each food name
            const existing = consumptionLogs.get(item.name.toLowerCase())
            if (!existing || item.createdAt > existing.createdAt) {
              consumptionLogs.set(item.name.toLowerCase(), item)
            }
          }
        })
      })

      // Add planned foods with their latest consumption logs
      this.data.foods.forEach((plannedFood) => {
        const latestLog =
          consumptionLogs.get(plannedFood.name.toLowerCase()) || null
        const foodItem = new MealFoodItem(
          { ...plannedFood, latestLog },
          this.context,
        )
        foodItems.push(foodItem)
      })
    }

    // Add custom additions
    if (this.data.logs) {
      this.data.logs.forEach((log) => {
        log.items?.forEach((item) => {
          if (item.isCustomAddition) {
            const foodItem = new MealFoodItem(item, this.context)
            foodItems.push(foodItem)
          }
        })
      })
    }

    return foodItems
  }

  get plannedCalories() {
    if (!this.data.foods) return 0

    let total = 0
    this.data.foods.forEach((food) => {
      const caloriesPer100g = food.caloriesPer100g
      if (caloriesPer100g) {
        total += (caloriesPer100g * food.quantity) / 100
      }
    })

    return Math.round(total * 100) / 100
  }

  get plannedProtein() {
    if (!this.data.foods) return 0

    let total = 0
    this.data.foods.forEach((food) => {
      const proteinPer100g = food.proteinPer100g
      if (proteinPer100g) {
        total += (proteinPer100g * food.quantity) / 100
      }
    })

    return Math.round(total * 100) / 100
  }

  get plannedCarbs() {
    if (!this.data.foods) return 0

    let total = 0
    this.data.foods.forEach((food) => {
      const carbsPer100g = food.carbsPer100g
      if (carbsPer100g) {
        total += (carbsPer100g * food.quantity) / 100
      }
    })

    return Math.round(total * 100) / 100
  }

  get plannedFat() {
    if (!this.data.foods) return 0

    let total = 0
    this.data.foods.forEach((food) => {
      const fatPer100g = food.fatPer100g
      if (fatPer100g) {
        total += (fatPer100g * food.quantity) / 100
      }
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
