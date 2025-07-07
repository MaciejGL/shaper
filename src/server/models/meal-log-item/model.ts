import {
  FoodProduct as PrismaMealFoodProduct,
  MealLog as PrismaMealLog,
  MealLogItem as PrismaMealLogItem,
} from '@prisma/client'

import { GQLMealLogItem } from '@/generated/graphql-server'
import { openFoodFactsClient } from '@/lib/open-food-facts/client'
import { GQLContext } from '@/types/gql-context'

import MealLog from '../meal-log/model'

export default class MealLogItem implements GQLMealLogItem {
  constructor(
    protected data: PrismaMealLogItem & {
      log?: PrismaMealLog
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

  get name() {
    return this.data.name
  }

  get barcode() {
    return this.data.barcode
  }

  get calories() {
    return this.data.calories
  }

  get protein() {
    return this.data.protein
  }

  get carbs() {
    return this.data.carbs
  }

  get fat() {
    return this.data.fat
  }

  get fiber() {
    return this.data.fiber
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  async log() {
    return this.data.log ? new MealLog(this.data.log, this.context) : null
  }

  // Calculated nutrition fields based on quantity
  get totalCalories() {
    if (!this.data.calories || !this.data.quantity || !this.data.unit) {
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
    if (!this.data.protein || !this.data.quantity || !this.data.unit) {
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
    if (!this.data.carbs || !this.data.quantity || !this.data.unit) {
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
    if (!this.data.fat || !this.data.quantity || !this.data.unit) {
      return 0
    }

    const nutrition = openFoodFactsClient.calculateNutrition(
      this.data,
      this.data.quantity,
      this.data.unit,
    )
    return Math.round(nutrition.fat * 100) / 100
  }
}
