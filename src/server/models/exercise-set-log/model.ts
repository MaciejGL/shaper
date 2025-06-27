import { ExerciseSetLog as PrismaExerciseSetLog } from '@prisma/client'

import { GQLExerciseSetLog } from '@/generated/graphql-server'

export default class ExerciseSetLog implements GQLExerciseSetLog {
  constructor(protected data: PrismaExerciseSetLog) {}

  get id() {
    return this.data.id
  }

  get reps() {
    return this.data.reps
  }

  get weight() {
    return this.data.weight
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
