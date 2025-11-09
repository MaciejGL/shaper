import { GQLFreeWorkoutDay } from '@/generated/graphql-server'
import {
  FreeWorkoutDay as PrismaFreeWorkoutDay,
  TrainingDay as PrismaTrainingDay,
  TrainingPlan as PrismaTrainingPlan,
  TrainingWeek as PrismaTrainingWeek,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import TrainingDay from '../training-day/model'
import TrainingPlan from '../training-plan/model'

export default class FreeWorkoutDay implements GQLFreeWorkoutDay {
  constructor(
    protected data: PrismaFreeWorkoutDay & {
      trainingDay?: PrismaTrainingDay & {
        week?: PrismaTrainingWeek & {
          plan?: PrismaTrainingPlan & {
            createdBy?: PrismaUser
          }
        }
      }
      plan?: PrismaTrainingPlan & {
        createdBy?: PrismaUser
      }
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get trainingDayId() {
    return this.data.trainingDayId
  }

  get planId() {
    return this.data.planId
  }

  get isVisible() {
    return this.data.isVisible
  }

  get heroImageUrl() {
    return this.data.heroImageUrl ?? null
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  async trainingDay() {
    if (!this.data.trainingDay) {
      return null
    }
    return new TrainingDay(this.data.trainingDay, this.context)
  }

  async plan() {
    if (!this.data.plan) {
      return null
    }
    return new TrainingPlan(this.data.plan, this.context)
  }
}
