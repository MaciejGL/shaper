import {
  Meal as PrismaMeal,
  MealLog as PrismaMealLog,
  MealLogItem as PrismaMealLogItem,
  User as PrismaUser,
} from '@prisma/client'

import { GQLMealLog } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

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
    return []
  }

  get totalCalories() {
    return 0
  }
  get totalCarbs() {
    return 0
  }
  get totalFat() {
    return 0
  }
  get totalProtein() {
    return 0
  }
  get totalFiber() {
    return 0
  }
  get totalSugar() {
    return 0
  }
  get totalSodium() {
    return 0
  }
}
