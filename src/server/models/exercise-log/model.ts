import { ExerciseLog as PrismaExerciseLog } from '@prisma/client'

import { GQLExerciseLog } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import ExerciseSetLog from '../exercise-set-log/model'

export default class ExerciseLog implements GQLExerciseLog {
  constructor(protected data: PrismaExerciseLog) {}

  get id() {
    return this.data.id
  }

  get performedAt() {
    return this.data.performedAt.toISOString()
  }

  get notes() {
    return this.data.notes
  }

  async setsLogs() {
    const setsLogs = await prisma.exerciseSetLog.findMany({
      where: {
        exerciseLogId: this.id,
      },
    })

    return setsLogs.map((setLog) => new ExerciseSetLog(setLog))
  }

  get exerciseId() {
    return this.data.exerciseId
  }
  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
