import { GQLExerciseSetLog } from '@/generated/graphql-server'
import { ExerciseSetLog as PrismaExerciseSetLog } from '@/generated/prisma/client'

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
