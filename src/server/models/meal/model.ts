import {
  Meal as PrismaMeal,
  MealDay as PrismaMealDay,
  MealFood as PrismaMealFood,
  MealFoodLog as PrismaMealFoodLog,
} from '@prisma/client'

import { GQLMeal } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import MealFood from '../meal-food/model'

export default class Meal implements GQLMeal {
  constructor(
    protected data: PrismaMeal & {
      day?: PrismaMealDay
      foods?: (PrismaMealFood & {
        logs?: PrismaMealFoodLog[]
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
    const foodItems: MealFood[] = []

    // Add planned foods with their consumption logs
    if (this.data.foods) {
      this.data.foods.forEach((food) => {
        const foodItem = new MealFood(food, this.context)
        foodItems.push(foodItem)
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
    return this.data.completedAt?.toISOString() || null
  }
}
