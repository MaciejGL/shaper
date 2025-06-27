import {
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
} from '@prisma/client'

import { GQLExerciseSet } from '@/generated/graphql-server'

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

  get isExtra() {
    return this.data.isExtra
  }

  get exerciseId() {
    return this.data.exerciseId
  }

  get completedAt() {
    return this.data.completedAt?.toISOString() ?? null
  }

  async log() {
    const log = this.data.log

    if (!log) {
      return null
    }

    return new ExerciseSetLog(log)
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
