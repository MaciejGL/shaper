import { GQLExerciseLog } from '@/generated/graphql-server'
import { ExerciseLog as PrismaExerciseLog } from '@/generated/prisma/client'

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
