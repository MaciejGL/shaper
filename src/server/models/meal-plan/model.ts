import {
  Meal as PrismaMeal,
  MealDay as PrismaMealDay,
  MealFood as PrismaMealFood,
  MealFoodLog as PrismaMealFoodLog,
  MealPlan as PrismaMealPlan,
  MealWeek as PrismaMealWeek,
  User as PrismaUser,
} from '@prisma/client'

import { GQLMealPlan } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import MealWeek from '../meal-week/model'
import UserPublic from '../user-public/model'

export default class MealPlan implements GQLMealPlan {
  constructor(
    protected data: PrismaMealPlan & {
      createdBy?: PrismaUser
      assignedTo?: PrismaUser | null
      weeks?: (PrismaMealWeek & {
        days?: (PrismaMealDay & {
          meals?: (PrismaMeal & {
            foods?: (PrismaMealFood & {
              logs?: PrismaMealFoodLog[]
            })[]
          })[]
        })[]
      })[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get title() {
    return this.data.title
  }

  get description() {
    return this.data.description
  }

  get completedAt() {
    return this.data.completedAt?.toISOString() || null
  }

  get isPublic() {
    return this.data.isPublic
  }

  get isTemplate() {
    return this.data.isTemplate
  }

  get isDraft() {
    return this.data.isDraft
  }

  get active() {
    return this.data.active
  }

  get startDate() {
    return this.data.startDate?.toISOString() || null
  }

  get endDate() {
    return this.data.endDate?.toISOString() || null
  }

  get dailyCalories() {
    return this.data.dailyCalories
  }

  get dailyProtein() {
    return this.data.dailyProtein
  }

  get dailyCarbs() {
    return this.data.dailyCarbs
  }

  get dailyFat() {
    return this.data.dailyFat
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  get createdBy() {
    return this.data.createdBy
      ? new UserPublic(this.data.createdBy, this.context)
      : null
  }

  get assignedTo() {
    return this.data.assignedTo
      ? new UserPublic(this.data.assignedTo, this.context)
      : null
  }

  get weeks() {
    return (
      this.data.weeks?.map((week) => new MealWeek(week, this.context)) || []
    )
  }

  get weekCount() {
    return this.data.weeks?.length || 0
  }

  get assignedCount() {
    // TODO: Implement count of how many clients have this plan assigned
    return 0
  }

  async collaboratorCount() {
    return this.context.loaders.plan.collaboratorCountByMealPlanId.load(
      this.data.id,
    )
  }

  async collaborators() {
    const collaborators =
      await this.context.loaders.plan.collaboratorsByMealPlanId.load(
        this.data.id,
      )
    return collaborators
  }
}
