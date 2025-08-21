import {
  GQLCollaborationPermission,
  GQLMealPlanCollaborator,
} from '@/generated/graphql-server'
import {
  MealPlan as PrismaMealPlan,
  MealPlanCollaborator as PrismaMealPlanCollaborator,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import MealPlan from '../meal-plan/model'
import UserPublic from '../user-public/model'

export default class MealPlanCollaborator implements GQLMealPlanCollaborator {
  constructor(
    protected data: PrismaMealPlanCollaborator & {
      mealPlan?: PrismaMealPlan | null
      collaborator?: PrismaUser | null
      addedBy?: PrismaUser | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get mealPlanId() {
    return this.data.mealPlanId
  }

  get collaboratorId() {
    return this.data.collaboratorId
  }

  get addedById() {
    return this.data.addedById
  }

  get permission(): GQLCollaborationPermission {
    return this.data.permission as GQLCollaborationPermission
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  async mealPlan() {
    if (this.data.mealPlan) {
      return new MealPlan(this.data.mealPlan, this.context)
    } else {
      console.error(
        `[MealPlanCollaborator] No meal plan found for collaborator ${this.id}. Loading from database.`,
      )
      const mealPlan = await this.context.loaders.plan.mealPlanById.load(
        this.data.mealPlanId,
      )
      if (!mealPlan) {
        throw new Error(`Meal plan not found for collaborator ${this.id}`)
      }
      return new MealPlan(mealPlan, this.context)
    }
  }

  async collaborator() {
    if (this.data.collaborator) {
      return new UserPublic(this.data.collaborator, this.context)
    } else {
      console.error(
        `[MealPlanCollaborator] No collaborator found for collaborator ${this.id}. Loading from database.`,
      )
      const collaborator = await this.context.loaders.user.userById.load(
        this.data.collaboratorId,
      )
      if (!collaborator) {
        throw new Error(
          `Collaborator not found for meal plan collaborator ${this.id}`,
        )
      }
      return new UserPublic(collaborator, this.context)
    }
  }

  async addedBy() {
    if (this.data.addedBy) {
      return new UserPublic(this.data.addedBy, this.context)
    } else {
      console.error(
        `[MealPlanCollaborator] No addedBy user found for collaborator ${this.id}. Loading from database.`,
      )
      const addedBy = await this.context.loaders.user.userById.load(
        this.data.addedById,
      )
      if (!addedBy) {
        throw new Error(
          `AddedBy user not found for meal plan collaborator ${this.id}`,
        )
      }
      return new UserPublic(addedBy, this.context)
    }
  }
}
