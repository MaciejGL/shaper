import { GQLIngredient } from '@/generated/graphql-server'
import {
  Ingredient as PrismaIngredient,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import UserPublic from '../user-public/model'

export interface MacroTotals {
  protein: number
  carbs: number
  fat: number
  calories: number
}

export default class Ingredient implements GQLIngredient {
  constructor(
    protected data: PrismaIngredient & {
      createdBy?: PrismaUser | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
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

  get caloriesPer100g() {
    return this.data.caloriesPer100g
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  async createdBy() {
    const createdBy = this.data.createdBy
    if (createdBy) {
      return new UserPublic(createdBy, this.context)
    }
    return null
  }

  /**
   * Calculate macros for a given amount of this ingredient
   */
  calculateMacrosForAmount(grams: number): MacroTotals {
    const multiplier = grams / 100

    return {
      protein: this.data.proteinPer100g * multiplier,
      carbs: this.data.carbsPer100g * multiplier,
      fat: this.data.fatPer100g * multiplier,
      calories: this.data.caloriesPer100g * multiplier,
    }
  }
}
