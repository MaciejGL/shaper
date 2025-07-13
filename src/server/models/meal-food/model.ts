import {
  Meal as PrismaMeal,
  MealFood as PrismaMealFood,
  FoodProduct as PrismaMealFoodProduct,
} from '@prisma/client'

import { GQLMealFood } from '@/generated/graphql-server'
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

  get name() {
    return this.data.name
  }

  get quantity() {
    return this.data.quantity
  }

  get unit() {
    return this.data.unit
  }

  get addedAt() {
    // Provide a fallback if addedAt is somehow null
    return this.data.addedAt
      ? this.data.addedAt.toISOString()
      : this.data.createdAt.toISOString()
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

  get openFoodFactsId() {
    return this.data.openFoodFactsId
  }

  get productData() {
    return this.data.productData ? JSON.stringify(this.data.productData) : null
  }

  get totalCalories() {
    const per100g = this.data.caloriesPer100g || 0
    const factor = this.data.quantity / 100
    return per100g * factor
  }

  get totalProtein() {
    const per100g = this.data.proteinPer100g || 0
    const factor = this.data.quantity / 100
    return per100g * factor
  }

  get totalCarbs() {
    const per100g = this.data.carbsPer100g || 0
    const factor = this.data.quantity / 100
    return per100g * factor
  }

  get totalFat() {
    const per100g = this.data.fatPer100g || 0
    const factor = this.data.quantity / 100
    return per100g * factor
  }

  get totalFiber() {
    const per100g = this.data.fiberPer100g || 0
    const factor = this.data.quantity / 100
    return per100g * factor
  }

  // TODO: Add other required fields for GQLMealFood interface
  async logs() {
    return []
  }

  async addedBy() {
    return null
  }

  get latestLog() {
    return null
  }

  async meal() {
    if (!this.data.meal) {
      throw new Error('Meal relationship not loaded')
    }
    return new Meal(this.data.meal, this.context)
  }
}
