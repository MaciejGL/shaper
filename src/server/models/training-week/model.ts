import { GQLTrainingWeek } from '@/generated/graphql-server'
import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  MuscleGroup as PrismaMuscleGroup,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  TrainingWeek as PrismaTrainingWeek,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import TrainingDay from '../training-day/model'

export default class TrainingWeek implements GQLTrainingWeek {
  constructor(
    protected data: PrismaTrainingWeek & {
      days?: (PrismaTrainingDay & {
        exercises?: (PrismaTrainingExercise & {
          substitutedBy?: PrismaTrainingExercise & {
            base?: PrismaBaseExercise & {
              muscleGroups: PrismaMuscleGroup[]
            }
            sets?: (PrismaExerciseSet & {
              log?: PrismaExerciseSetLog
            })[]
          }
          sets?: (PrismaExerciseSet & {
            log?: PrismaExerciseSetLog
          })[]
          base?: PrismaBaseExercise & {
            muscleGroups: PrismaMuscleGroup[]
          }
        })[]
      })[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get completedAt() {
    if (!this.data.completedAt) {
      return null
    }

    return this.data.completedAt.toISOString()
  }

  get scheduledAt() {
    if (!this.data.scheduledAt) {
      return null
    }

    return this.data.scheduledAt.toISOString()
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  get trainingPlanId() {
    return this.data.planId
  }

  get weekNumber() {
    return this.data.weekNumber
  }

  get name() {
    return this.data.name
  }

  get description() {
    return this.data.description
  }

  get isExtra() {
    return this.data.isExtra
  }

  async days() {
    const days = this.data.days
    if (days) {
      return days.map((day) => new TrainingDay(day, this.context))
    } else {
      console.error(
        `[TrainingWeek] No days found for week ${this.id}. Loading from database.`,
      )
      return []
    }
  }
}
