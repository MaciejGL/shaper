import { ExerciseSet as PrismaExerciseSet } from '@prisma/client'

import { GQLExerciseSet } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import ExerciseSetLog from '../exercise-set-log/model'

export default class ExerciseSet implements GQLExerciseSet {
  constructor(protected data: PrismaExerciseSet) {}

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

  async logs() {
    const logs = await prisma.exerciseSetLog.findMany({
      where: {
        exerciseSetId: this.id,
      },
    })

    return logs.map((log) => new ExerciseSetLog(log))
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
