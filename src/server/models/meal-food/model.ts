import {
  Meal as PrismaMeal,
  MealFood as PrismaMealFood,
  FoodProduct as PrismaMealFoodProduct,
} from '@prisma/client'

import { GQLMealFood } from '@/generated/graphql-server'
import { openFoodFactsClient } from '@/lib/open-food-facts/client'
import { GQLContext } from '@/types/gql-context'

import Meal from '../meal/model'

export default class MealFood implements GQLMealFood {
  constructor(
    protected data: PrismaMealFood & {
      meal?: PrismaMeal
      foodProduct?: PrismaMealFoodProduct
    },

    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get quantity() {
    return this.data.quantity
  }

  get unit() {
    return this.data.unit
  }

  get order() {
    return this.data.order
  }

  get name() {
    return this.data.name
  }

  get barcode() {
    return this.data.openFoodFactsId || null
  }

  get brand() {
    return null // Will be extracted from productData JSON when needed
  }

  get caloriesPer100g() {
    return this.data.caloriesPer100g
  }

  get proteinPer100g() {
    return this.data.proteinPer100g
  }

  get carbsPer100g() {
    return this.data.carbsPer100g
  }

  get fatPer100g() {
    return this.data.fatPer100g
  }

  get fiberPer100g() {
    return this.data.fiberPer100g
  }

  get sugarPer100g() {
    return null // Not stored in database schema
  }

  get sodiumPer100g() {
    return null // Not stored in database schema
  }

  async meal() {
    if (!this.data.meal) {
      throw new Error('Meal relationship not loaded')
    }
    return this.data.meal ? new Meal(this.data.meal, this.context) : null
  }

  // Calculated nutrition fields based on quantity
  get totalCalories() {
    if (!this.data.caloriesPer100g || !this.data.quantity || !this.data.unit) {
      return 0
    }

    const nutrition = openFoodFactsClient.calculateNutrition(
      this.data,
      this.data.quantity,
      this.data.unit,
    )
    return Math.round(nutrition.calories * 100) / 100
  }

  get totalProtein() {
    if (!this.data.proteinPer100g || !this.data.quantity || !this.data.unit) {
      return 0
    }

    const nutrition = openFoodFactsClient.calculateNutrition(
      this.data,
      this.data.quantity,
      this.data.unit,
    )
    return Math.round(nutrition.protein * 100) / 100
  }

  get totalCarbs() {
    if (!this.data.carbsPer100g || !this.data.quantity || !this.data.unit) {
      return 0
    }

    const nutrition = openFoodFactsClient.calculateNutrition(
      this.data,
      this.data.quantity,
      this.data.unit,
    )
    return Math.round(nutrition.carbs * 100) / 100
  }

  get totalFat() {
    if (!this.data.fatPer100g || !this.data.quantity || !this.data.unit) {
      return 0
    }

    const nutrition = openFoodFactsClient.calculateNutrition(
      this.data,
      this.data.quantity,
      this.data.unit,
    )
    return Math.round(nutrition.fat * 100) / 100
  }

  get totalFiber() {
    if (!this.data.fiberPer100g || !this.data.quantity || !this.data.unit) {
      return 0
    }

    const nutrition = openFoodFactsClient.calculateNutrition(
      this.data,
      this.data.quantity,
      this.data.unit,
    )
    return Math.round(nutrition.fiber * 100) / 100
  }
}
