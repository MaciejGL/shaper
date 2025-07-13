import {
  Meal as PrismaMeal,
  MealFood as PrismaMealFood,
  MealFoodLog as PrismaMealFoodLog,
  FoodProduct as PrismaMealFoodProduct,
  User as PrismaUser,
} from '@prisma/client'

import { GQLMealFood } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import MealFoodLog from '../meal-food-log/model'
import Meal from '../meal/model'
import UserPublic from '../user-public/model'

export default class MealFood implements GQLMealFood {
  constructor(
    protected data: PrismaMealFood & {
      meal?: PrismaMeal
      foodProduct?: PrismaMealFoodProduct
      addedBy?: PrismaUser | null
      logs?: PrismaMealFoodLog[]
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

  async logs() {
    if (!this.data.logs) return []
    return this.data.logs.map((log) => new MealFoodLog(log, this.context))
  }

  async addedBy() {
    if (!this.data.addedBy) return null
    return new UserPublic(this.data.addedBy, this.context)
  }

  async latestLog() {
    if (!this.data.logs || this.data.logs.length === 0) return null

    // Return the most recent log for this user
    const userId = this.context.user?.user?.id
    if (!userId) return null

    const userLogs = this.data.logs.filter((log) => log.userId === userId)
    if (userLogs.length === 0) return null

    const mostRecentLog = userLogs.reduce((latest, current) =>
      current.loggedAt > latest.loggedAt ? current : latest,
    )

    return new MealFoodLog(mostRecentLog, this.context)
  }

  get isCustomAddition() {
    // A food is considered a custom addition if it was added by a user
    return Boolean(this.data.addedById)
  }

  async log() {
    // Alias for latestLog to match GraphQL schema expectations
    return this.latestLog()
  }

  async meal() {
    if (!this.data.meal) {
      throw new Error('Meal relationship not loaded')
    }
    return new Meal(this.data.meal, this.context)
  }
}
