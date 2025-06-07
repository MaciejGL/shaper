import {
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
} from '@prisma/client'

import { GQLExerciseSet } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import ExerciseSetLog from '../exercise-set-log/model'

export default class ExerciseSet implements GQLExerciseSet {
  constructor(
    protected data: PrismaExerciseSet & {
      log?: PrismaExerciseSetLog
    },
  ) {}

  get id() {
    return this.data.id
  }

  get order() {
    return this.data.order
  }

  get reps() {
    return this.data.reps
  }

  get minReps() {
    return this.data.minReps
  }

  get maxReps() {
    return this.data.maxReps
  }

  get weight() {
    return this.data.weight
  }

  get rpe() {
    return this.data.rpe
  }

  get exerciseId() {
    return this.data.exerciseId
  }

  get completedAt() {
    return this.data.completedAt?.toISOString() ?? null
  }

  async log() {
    if (this.data.log) {
      return new ExerciseSetLog(this.data.log)
    }

    const log = await prisma.exerciseSetLog.findFirst({
      where: {
        ExerciseSet: {
          id: this.id,
        },
      },
    })

    return log ? new ExerciseSetLog(log) : null
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
