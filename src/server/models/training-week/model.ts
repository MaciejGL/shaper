import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  TrainingWeek as PrismaTrainingWeek,
} from '@prisma/client'

import { GQLTrainingWeek } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import TrainingDay from '../training-day/model'

export default class TrainingWeek implements GQLTrainingWeek {
  constructor(
    protected data: PrismaTrainingWeek & {
      days?: (PrismaTrainingDay & {
        exercises?: (PrismaTrainingExercise & {
          sets?: (PrismaExerciseSet & {
            log?: PrismaExerciseSetLog
          })[]
          base?: PrismaBaseExercise
        })[]
      })[]
    },
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

  async days() {
    let days = this.data.days
    if (!days || days.length === 0) {
      console.warn(
        `[TrainingWeek] No days found for week ${this.id}. Loading from database.`,
      )
      days = await prisma.trainingDay.findMany({
        where: {
          weekId: this.id,
        },
      })
    }

    return days.map((day) => new TrainingDay(day))
  }
}
