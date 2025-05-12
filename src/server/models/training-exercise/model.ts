import { TrainingExercise as PrismaTrainingExercise } from '@prisma/client'

import { GQLTrainingExercise } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import ExerciseLog from '../exercise-log/model'
import ExerciseSet from '../exercise-set/model'

export default class TrainingExercise implements GQLTrainingExercise {
  constructor(protected data: PrismaTrainingExercise) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get restSeconds() {
    return this.data.restSeconds
  }

  get tempo() {
    return this.data.tempo
  }

  get instructions() {
    return this.data.instructions
  }

  get order() {
    return this.data.order
  }

  get dayId() {
    return this.data.dayId
  }

  async sets() {
    const sets = await prisma.exerciseSet.findMany({
      where: {
        exerciseId: this.id,
      },
    })

    return sets.map((set) => new ExerciseSet(set))
  }

  async logs() {
    const logs = await prisma.exerciseLog.findMany({
      where: {
        exerciseId: this.id,
      },
    })

    return logs.map((log) => new ExerciseLog(log))
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
