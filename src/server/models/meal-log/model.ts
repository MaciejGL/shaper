import {
  Meal as PrismaMeal,
  MealLog as PrismaMealLog,
  MealLogItem as PrismaMealLogItem,
  User as PrismaUser,
} from '@prisma/client'

import { GQLMealLog } from '@/generated/graphql-server'
import { openFoodFactsClient } from '@/lib/open-food-facts/client'
import { GQLContext } from '@/types/gql-context'

import MealLogItem from '../meal-log-item/model'
import Meal from '../meal/model'
import UserPublic from '../user-public/model'

export default class MealLog implements GQLMealLog {
  constructor(
    protected data: PrismaMealLog & {
      meal?: PrismaMeal
      user?: PrismaUser
      items?: PrismaMealLogItem[]
    },

    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get loggedAt() {
    return this.data.loggedAt.toISOString()
  }

  get completedAt() {
    return this.data.completedAt?.toISOString() || null
  }

  async meal() {
    return this.data.meal ? new Meal(this.data.meal, this.context) : null
  }

  async user() {
    if (!this.data.user) {
      throw new Error('User relationship not loaded')
    }
    return new UserPublic(this.data.user, this.context)
  }

  async items() {
    return (
      this.data.items?.map((item) => new MealLogItem(item, this.context)) || []
    )
  }

  // Calculated nutrition fields
  get totalCalories() {
    if (!this.data.items) return 0

    let total = 0
    this.data.items.forEach((item) => {
      if (item.calories && item.quantity && item.unit) {
        const nutrition = openFoodFactsClient.calculateNutrition(
          item,
          item.quantity,
          item.unit,
        )
        total += nutrition.calories
      }
    })

    return Math.round(total * 100) / 100
  }

  get totalProtein() {
    if (!this.data.items) return 0

    let total = 0
    this.data.items.forEach((item) => {
      if (item.protein && item.quantity && item.unit) {
        const nutrition = openFoodFactsClient.calculateNutrition(
          item,
          item.quantity,
          item.unit,
        )
        total += nutrition.protein
      }
    })

    return Math.round(total * 100) / 100
  }

  get totalCarbs() {
    if (!this.data.items) return 0

    let total = 0
    this.data.items.forEach((item) => {
      if (item.carbs && item.quantity && item.unit) {
        const nutrition = openFoodFactsClient.calculateNutrition(
          item,
          item.quantity,
          item.unit,
        )
        total += nutrition.carbs
      }
    })

    return Math.round(total * 100) / 100
  }

  get totalFat() {
    if (!this.data.items) return 0

    let total = 0
    this.data.items.forEach((item) => {
      if (item.fat && item.quantity && item.unit) {
        const nutrition = openFoodFactsClient.calculateNutrition(
          item,
          item.quantity,
          item.unit,
        )
        total += nutrition.fat
      }
    })

    return Math.round(total * 100) / 100
  }
}
