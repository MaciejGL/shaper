import { TrainingDay as PrismaTrainingDay } from '@prisma/client'

import { GQLTrainingDay } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import TrainingExercise from '../training-exercise/model'

export default class TrainingDay implements GQLTrainingDay {
  constructor(protected data: PrismaTrainingDay) {}

  get id() {
    return this.data.id
  }

  get dayOfWeek() {
    return this.data.dayOfWeek
  }

  get trainingWeekId() {
    return this.data.weekId
  }

  get completedAt() {
    if (!this.data.completedAt) {
      return null
    }

    return this.data.completedAt.toISOString()
  }

  async exercises() {
    const exercises = await prisma.trainingExercise.findMany({
      where: {
        dayId: this.id,
      },
    })

    return exercises.map((exercise) => new TrainingExercise(exercise))
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
