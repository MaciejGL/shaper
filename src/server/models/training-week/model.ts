import { TrainingWeek as PrismaTrainingWeek } from '@prisma/client'

import { GQLTrainingWeek } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import TrainingDay from '../training-day/model'

export default class TrainingWeek implements GQLTrainingWeek {
  constructor(protected data: PrismaTrainingWeek) {}

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

  async days() {
    const days = await prisma.trainingDay.findMany({
      where: {
        weekId: this.id,
      },
    })

    return days.map((day) => new TrainingDay(day))
  }
}
