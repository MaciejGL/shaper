import {
  GQLCollaborationPermission,
  GQLTrainingPlanCollaborator,
} from '@/generated/graphql-server'
import {
  TrainingPlan as PrismaTrainingPlan,
  TrainingPlanCollaborator as PrismaTrainingPlanCollaborator,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import TrainingPlan from '../training-plan/model'
import UserPublic from '../user-public/model'

export default class TrainingPlanCollaborator
  implements GQLTrainingPlanCollaborator
{
  constructor(
    protected data: PrismaTrainingPlanCollaborator & {
      trainingPlan?: PrismaTrainingPlan | null
      collaborator?: PrismaUser | null
      addedBy?: PrismaUser | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get trainingPlanId() {
    return this.data.trainingPlanId
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

  async trainingPlan() {
    if (this.data.trainingPlan) {
      return new TrainingPlan(this.data.trainingPlan, this.context)
    } else {
      console.error(
        `[TrainingPlanCollaborator] No training plan found for collaborator ${this.id}. Loading from database.`,
      )
      const trainingPlan =
        await this.context.loaders.plan.trainingPlanById.load(
          this.data.trainingPlanId,
        )
      if (!trainingPlan) {
        throw new Error(`Training plan not found for collaborator ${this.id}`)
      }
      return new TrainingPlan(trainingPlan, this.context)
    }
  }

  async collaborator() {
    if (this.data.collaborator) {
      return new UserPublic(this.data.collaborator, this.context)
    } else {
      console.error(
        `[TrainingPlanCollaborator] No collaborator found for collaborator ${this.id}. Loading from database.`,
      )
      const collaborator = await this.context.loaders.user.userById.load(
        this.data.collaboratorId,
      )
      if (!collaborator) {
        throw new Error(
          `Collaborator not found for training plan collaborator ${this.id}`,
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
        `[TrainingPlanCollaborator] No addedBy user found for collaborator ${this.id}. Loading from database.`,
      )
      const addedBy = await this.context.loaders.user.userById.load(
        this.data.addedById,
      )
      if (!addedBy) {
        throw new Error(
          `AddedBy user not found for training plan collaborator ${this.id}`,
        )
      }
      return new UserPublic(addedBy, this.context)
    }
  }
}
