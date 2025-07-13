import {
  MealFood as PrismaMealFood,
  MealFoodLog as PrismaMealFoodLog,
  User as PrismaUser,
} from '@prisma/client'

import { GQLMealFoodLog } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import MealFood from '../meal-food/model'
import UserPublic from '../user-public/model'

export default class MealFoodLog implements GQLMealFoodLog {
  constructor(
    protected data: PrismaMealFoodLog & {
      mealFood?: PrismaMealFood
      user?: PrismaUser
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get quantity() {
    return this.data.quantity
  }

  get loggedQuantity() {
    return this.data.quantity
  }

  get unit() {
    return this.data.unit
  }

  get loggedAt() {
    return this.data.loggedAt.toISOString()
  }

  get notes() {
    return this.data.notes
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

  async mealFood() {
    if (!this.data.mealFood) {
      throw new Error('MealFood relationship not loaded')
    }
    return new MealFood(this.data.mealFood, this.context)
  }

  async user() {
    if (!this.data.user) {
      throw new Error('User relationship not loaded')
    }
    return new UserPublic(this.data.user, this.context)
  }
}
