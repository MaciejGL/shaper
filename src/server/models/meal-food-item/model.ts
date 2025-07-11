import {
  MealFood as PrismaMealFood,
  MealLogItem as PrismaMealLogItem,
} from '@prisma/client'

import { GQLMealFoodItem } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import MealFoodLog from '../meal-food-log/model'

export default class MealFoodItem implements GQLMealFoodItem {
  constructor(
    // Can be either planned food or custom addition data
    protected data: (PrismaMealFood | PrismaMealLogItem) & {
      // For planned foods, this will be the latest consumption log
      // For custom additions, this will be null (the item itself is the log)
      latestLog?: PrismaMealLogItem | null
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

  get caloriesPer100g() {
    // For MealFood, access directly. For MealLogItem, need to calculate from actual values
    if ('mealId' in this.data) {
      // This is a MealFood
      return this.data.caloriesPer100g
    } else {
      // This is a MealLogItem (custom addition)
      // Calculate per 100g from actual values if available
      if (this.data.calories && this.data.quantity) {
        return (
          Math.round((this.data.calories / this.data.quantity) * 100 * 100) /
          100
        )
      }
      return null
    }
  }

  get proteinPer100g() {
    if ('mealId' in this.data) {
      return this.data.proteinPer100g
    } else {
      if (this.data.protein && this.data.quantity) {
        return (
          Math.round((this.data.protein / this.data.quantity) * 100 * 100) / 100
        )
      }
      return null
    }
  }

  get carbsPer100g() {
    if ('mealId' in this.data) {
      return this.data.carbsPer100g
    } else {
      if (this.data.carbs && this.data.quantity) {
        return (
          Math.round((this.data.carbs / this.data.quantity) * 100 * 100) / 100
        )
      }
      return null
    }
  }

  get fatPer100g() {
    if ('mealId' in this.data) {
      return this.data.fatPer100g
    } else {
      if (this.data.fat && this.data.quantity) {
        return (
          Math.round((this.data.fat / this.data.quantity) * 100 * 100) / 100
        )
      }
      return null
    }
  }

  get fiberPer100g() {
    if ('mealId' in this.data) {
      return this.data.fiberPer100g
    } else {
      if (this.data.fiber && this.data.quantity) {
        return (
          Math.round((this.data.fiber / this.data.quantity) * 100 * 100) / 100
        )
      }
      return null
    }
  }

  get openFoodFactsId() {
    return this.data.openFoodFactsId || null
  }

  get productData() {
    return this.data.productData ? JSON.stringify(this.data.productData) : null
  }

  get totalCalories() {
    // For MealFood, calculate from per100g values
    if ('mealId' in this.data) {
      const caloriesPer100g = this.caloriesPer100g
      if (!caloriesPer100g) return 0
      return Math.round(((caloriesPer100g * this.quantity) / 100) * 100) / 100
    } else {
      // For MealLogItem, use actual logged values
      return this.data.calories || 0
    }
  }

  get totalProtein() {
    if ('mealId' in this.data) {
      const proteinPer100g = this.proteinPer100g
      if (!proteinPer100g) return 0
      return Math.round(((proteinPer100g * this.quantity) / 100) * 100) / 100
    } else {
      return this.data.protein || 0
    }
  }

  get totalCarbs() {
    if ('mealId' in this.data) {
      const carbsPer100g = this.carbsPer100g
      if (!carbsPer100g) return 0
      return Math.round(((carbsPer100g * this.quantity) / 100) * 100) / 100
    } else {
      return this.data.carbs || 0
    }
  }

  get totalFat() {
    if ('mealId' in this.data) {
      const fatPer100g = this.fatPer100g
      if (!fatPer100g) return 0
      return Math.round(((fatPer100g * this.quantity) / 100) * 100) / 100
    } else {
      return this.data.fat || 0
    }
  }

  get totalFiber() {
    if ('mealId' in this.data) {
      const fiberPer100g = this.fiberPer100g
      if (!fiberPer100g) return 0
      return Math.round(((fiberPer100g * this.quantity) / 100) * 100) / 100
    } else {
      return this.data.fiber || 0
    }
  }

  get isCustomAddition() {
    // Check if this is a MealLogItem with isCustomAddition = true
    if ('isCustomAddition' in this.data) {
      return this.data.isCustomAddition
    }
    // If it's a MealFood, it's not a custom addition
    return false
  }

  get log() {
    // For planned foods, return the latest consumption log if it exists
    if (!this.isCustomAddition && this.data.latestLog) {
      return new MealFoodLog(this.data.latestLog, this.context)
    }

    // For custom additions, the item itself is the log
    if (this.isCustomAddition && 'isCustomAddition' in this.data) {
      return new MealFoodLog(this.data as PrismaMealLogItem, this.context)
    }

    return null
  }
}
