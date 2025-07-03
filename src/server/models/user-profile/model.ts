import {
  User as PrismaUser,
  UserBodyMeasure as PrismaUserBodyMeasure,
  UserProfile as PrismaUserProfile,
} from '@prisma/client'

import {
  GQLActivityLevel,
  GQLFitnessLevel,
  GQLGoal,
  GQLUserProfile,
} from '@/generated/graphql-server'

import UserBodyMeasure from '../user-body-measure/model'

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
    const bodyMeasures = this.data.bodyMeasures
    if (bodyMeasures) {
      const latestMeasure = bodyMeasures.at(0)
      return latestMeasure?.weight ?? this.data.weight
    } else {
      console.error(
        `[UserProfile] No body measures (Weight) found for user ${this.id}. Loading from database.`,
      )
      return null
    }
  }

  async bodyMeasures() {
    const bodyMeasures = this.data.bodyMeasures
    if (bodyMeasures) {
      return bodyMeasures.map((measure) => new UserBodyMeasure(measure))
    } else {
      console.error(
        `[UserProfile] No body measures (Body Measures) found for user ${this.id}. Loading from database.`,
      )
      return []
    }
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
