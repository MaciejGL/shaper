import {
  Meal as PrismaMeal,
  MealLog as PrismaMealLog,
  MealLogItem as PrismaMealLogItem,
  User as PrismaUser,
} from '@prisma/client'

import { GQLMealLog } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import MealLogItem from '../meal-log-item/model'
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
    return null
  }

  async user() {
    if (!this.data.user) {
      throw new Error('User relationship not loaded')
    }
    return new UserPublic(this.data.user, this.context)
  }

  async items() {
    if (!this.data.items) return []

    return this.data.items.map((item) => new MealLogItem(item, this.context))
  }

  get totalCalories() {
    if (!this.data.items) return 0
    return this.data.items.reduce(
      (total, item) => total + (item.calories || 0),
      0,
    )
  }

  get totalCarbs() {
    if (!this.data.items) return 0
    return this.data.items.reduce((total, item) => total + (item.carbs || 0), 0)
  }

  get totalFat() {
    if (!this.data.items) return 0
    return this.data.items.reduce((total, item) => total + (item.fat || 0), 0)
  }

  get totalProtein() {
    if (!this.data.items) return 0
    return this.data.items.reduce(
      (total, item) => total + (item.protein || 0),
      0,
    )
  }
  get totalFiber() {
    if (!this.data.items) return 0
    return this.data.items.reduce((total, item) => total + (item.fiber || 0), 0)
  }
}
