import { MealLogItem as PrismaMealLogItem } from '@prisma/client'

import { GQLMealFoodLog } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

export default class MealFoodLog implements GQLMealFoodLog {
  constructor(
    protected data: PrismaMealLogItem,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get loggedQuantity() {
    return this.data.quantity
  }

  get unit() {
    return this.data.unit
  }

  get loggedAt() {
    return this.data.createdAt.toISOString()
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
}
