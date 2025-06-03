import {
  ExerciseSet as PrismaExerciseSet,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  TrainingPlan as PrismaTrainingPlan,
  TrainingWeek as PrismaTrainingWeek,
} from '@prisma/client'

import { GQLTrainingPlan } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import TrainingWeek from '../training-week/model'
import UserPublic from '../user-public/model'

export default class TrainingPlan implements GQLTrainingPlan {
  constructor(
    protected data: PrismaTrainingPlan & {
      weeks?: (PrismaTrainingWeek & {
        days?: (PrismaTrainingDay & {
          exercises?: (PrismaTrainingExercise & {
            sets?: PrismaExerciseSet[]
          })[]
        })[]
      })[]
    },
  ) {}

  get id() {
    return this.data.id
  }

  get title() {
    return this.data.title
  }

  get description() {
    return this.data.description
  }

  get isPublic() {
    return this.data.isPublic
  }

  get isTemplate() {
    return this.data.isTemplate
  }

  get isDraft() {
    return this.data.isDraft
  }

  get active() {
    return this.data.active
  }

  get startDate() {
    return this.data.startDate?.toISOString()
  }

  get endDate() {
    return this.data.endDate?.toISOString()
  }

  get nextSession() {
    // TODO: Implement this
    return null
  }

  get progress() {
    return this.calculateProgress()
  }

  async createdBy() {
    const user = await prisma.user.findUnique({
      where: {
        id: this.data.createdById,
      },
    })

    if (!user) {
      return null
    }

    return new UserPublic(user)
  }

  async assignedTo() {
    if (!this.data.assignedToId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: {
        id: this.data.assignedToId,
      },
    })

    if (!user) {
      return null
    }

    return new UserPublic(user)
  }

  async weekCount() {
    return prisma.trainingWeek.count({
      where: {
        planId: this.data.id,
      },
    })
  }

  async assignedCount() {
    return prisma.user.count({
      where: {
        assignedPlans: {
          some: {
            id: this.data.id,
          },
        },
      },
    })
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

  async weeks() {
    let weeks = this.data.weeks

    if (!weeks) {
      weeks = await prisma.trainingWeek.findMany({
        where: {
          planId: this.data.id,
        },
        include: {
          days: true,
        },
      })
    }

    return weeks.map((week) => new TrainingWeek(week))
  }

  private calculateProgress() {
    const totalDays =
      this.data.weeks?.reduce(
        (acc, week) => acc + (week.days?.length ?? 0),
        0,
      ) ?? 0
    const completedDays =
      this.data.weeks?.reduce(
        (acc, week) =>
          acc + (week.days?.filter((day) => day.completedAt).length ?? 0),
        0,
      ) ?? 0

    // Prevent division by zero, which would return NaN and break GraphQL Float
    if (totalDays === 0) {
      return 0
    }

    return (completedDays / totalDays) * 100
  }
}
