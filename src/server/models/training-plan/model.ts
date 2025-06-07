import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  TrainingPlan as PrismaTrainingPlan,
  TrainingWeek as PrismaTrainingWeek,
  User as PrismaUser,
} from '@prisma/client'
import { getWeekYear } from 'date-fns'

import { GQLDifficulty, GQLTrainingPlan } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import TrainingWeek from '../training-week/model'
import UserPublic from '../user-public/model'

export default class TrainingPlan implements GQLTrainingPlan {
  constructor(
    protected data: PrismaTrainingPlan & {
      createdBy?: PrismaUser
      weeks?: (PrismaTrainingWeek & {
        days?: (PrismaTrainingDay & {
          exercises?: (PrismaTrainingExercise & {
            sets?: PrismaExerciseSet[]
            base?: PrismaBaseExercise
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
    if (!this.data.startDate) {
      return null
    }

    const weeks = this.data.weeks ?? []
    const endDate = new Date(this.data.startDate)
    endDate.setDate(endDate.getDate() + weeks.length * 7 - 1)

    return endDate.toISOString()
  }

  get nextSession() {
    // TODO: Implement this
    return null
  }

  get progress() {
    return this.calculateProgress()
  }

  async createdBy() {
    if (!this.data.createdBy) {
      return null
    }

    return new UserPublic(this.data.createdBy)
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
  get currentWeekNumber() {
    // we need to get when training has Started first, then check how many weeks have passed. Then find week that we expect to match that week number

    const startDate = this.data.startDate
    if (!startDate) {
      return null
    }
    const startDateWeek = getWeekYear(startDate)
    const currentWeek = getWeekYear(new Date())

    const weeksPassed = currentWeek - startDateWeek
    const currentWeekNumber = weeksPassed + 1

    return currentWeekNumber
  }

  get completedWorkoutsDays() {
    const weeks = this.data.weeks ?? []
    const completedWorkoutsDays = weeks.reduce(
      (acc, week) =>
        acc + (week.days?.filter((day) => day.completedAt).length ?? 0),
      0,
    )
    return completedWorkoutsDays
  }

  get adherence() {
    const weeks = this.data.weeks ?? []
    const adherence = weeks.reduce(
      (acc, week) => acc + (week.completedAt ? 1 : 0),
      0,
    )
    return adherence
  }

  get totalWorkouts() {
    const weeks = this.data.weeks ?? []
    const totalWorkoutDays =
      weeks?.reduce(
        (acc, week) =>
          acc + (week.days?.filter((day) => !day.isRestDay)?.length ?? 0),
        0,
      ) ?? 0

    return totalWorkoutDays
  }

  get difficulty() {
    // TODO: Implement this
    return GQLDifficulty.Beginner
  }

  async rating() {
    // TODO: Implement this
    const reviews = await this.reviews()
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0)
    return totalRating / reviews.length
  }

  get totalReviews() {
    // TODO: Implement this
    return 3
  }

  async reviews() {
    // TODO: Implement this
    const createdBy = await this.createdBy()
    return [
      {
        id: '1',
        rating: 5,
        comment: 'This plan is great!',
        createdBy: createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        rating: 4,
        comment: 'This plan is good!',
        createdBy: createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        rating: 3,
        comment: 'This plan is okay.',
        createdBy: createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
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
