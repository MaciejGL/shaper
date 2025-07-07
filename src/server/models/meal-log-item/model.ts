import {
  FoodProduct as PrismaMealFoodProduct,
  MealLog as PrismaMealLog,
  MealLogItem as PrismaMealLogItem,
} from '@prisma/client'

import { GQLMealLogItem } from '@/generated/graphql-server'
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
}
