import {
  MealFood as PrismaMealFood,
  MealFoodLog as PrismaMealFoodLog,
  User as PrismaUser,
} from '@prisma/client'

import { GQLMealFoodItem } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import MealFoodLog from '../meal-food-log/model'
import UserPublic from '../user-public/model'

export default class MealFoodItem implements GQLMealFoodItem {
  constructor(
    protected data: PrismaMealFood & {
      addedBy?: PrismaUser | null
      logs?: (PrismaMealFoodLog & {
        user?: PrismaUser
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

  get isCustomAddition() {
    // A food is considered a custom addition if it has an addedBy user
    return Boolean(this.data.addedById)
  }

  async addedBy() {
    if (!this.data.addedBy) {
      return null
    }
    return new UserPublic(this.data.addedBy, this.context)
  }

  async log() {
    // Return the latest log entry if it exists
    if (this.data.logs && this.data.logs.length > 0) {
      const latestLog = this.data.logs[0] // logs are ordered by loggedAt desc
      return new MealFoodLog(latestLog, this.context)
    }
    return null
  }

  async logs() {
    if (!this.data.logs) return []
    return this.data.logs.map((log) => new MealFoodLog(log, this.context))
  }
}
