import {
  User as PrismaUser,
  UserBodyMeasure as PrismaUserBodyMeasure,
  UserProfile as PrismaUserProfile,
} from '@prisma/client'

import {
  GQLActivityLevel,
  GQLFitnessLevel,
  GQLGoal,
  GQLUserBodyMeasure,
  GQLUserProfile,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

export default class UserProfile implements GQLUserProfile {
  constructor(
    protected data: PrismaUserProfile & {
      user?: PrismaUser
      bodyMeasures?: PrismaUserBodyMeasure[]
    },
  ) {}

  get id() {
    return this.data.id
  }

  get firstName() {
    return this.data.firstName
  }

  get lastName() {
    return this.data.lastName
  }

  get email() {
    return this.data.user?.email
  }

  get phone() {
    return this.data.phone
  }

  get birthday() {
    return this.data.birthday?.toISOString()
  }

  get sex() {
    return this.data.sex
  }

  get avatarUrl() {
    return this.data.avatarUrl
  }

  get height() {
    return this.data.height
  }

  async weight() {
    let bodyMeasures = this.data.bodyMeasures ?? null
    if (!bodyMeasures) {
      console.warn(
        `[UserProfile] No body measures found for user ${this.id}. Loading from database.`,
      )
      bodyMeasures = await prisma.userBodyMeasure.findMany({
        where: {
          userProfileId: this.data.id,
        },
        orderBy: {
          measuredAt: 'desc',
        },
      })
    }
    const latestMeasure = bodyMeasures?.at(0)

    return latestMeasure?.weight ?? this.data.weight
  }

  async bodyMeasures() {
    let bodyMeasures = this.data.bodyMeasures ?? null
    if (!bodyMeasures) {
      console.warn(
        `[UserProfile] No body measures found for user ${this.id}. Loading from database.`,
      )
      bodyMeasures = await prisma.userBodyMeasure.findMany({
        where: {
          userProfileId: this.data.id,
        },
        orderBy: {
          measuredAt: 'desc',
        },
      })
    }

    if (!bodyMeasures) {
      return []
    }

    // TODO: fix this
    return bodyMeasures.map(
      (measure) => measure as unknown as GQLUserBodyMeasure,
    )
  }

  get fitnessLevel() {
    switch (this.data.fitnessLevel) {
      case 'BEGINNER':
        return GQLFitnessLevel.Beginner
      case 'INTERMEDIATE':
        return GQLFitnessLevel.Intermediate
      case 'ADVANCED':
        return GQLFitnessLevel.Advanced
      case 'EXPERT':
        return GQLFitnessLevel.Expert
      default:
        return null
    }
  }

  get allergies() {
    return this.data.allergies
  }

  get activityLevel() {
    switch (this.data.activityLevel) {
      case 'SEDENTARY':
        return GQLActivityLevel.Sedentary
      case 'LIGHT':
        return GQLActivityLevel.Light
      case 'MODERATE':
        return GQLActivityLevel.Moderate
      case 'ACTIVE':
        return GQLActivityLevel.Active
      case 'ATHLETE':
        return GQLActivityLevel.Athlete
      default:
        return null
    }
  }

  get goals() {
    const goals: GQLGoal[] = []
    this.data.goals.forEach((goal) => {
      goals.push(goal as GQLGoal)
    })

    return goals
  }

  get bio() {
    return this.data.bio
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
