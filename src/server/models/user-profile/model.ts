import {
  GQLActivityLevel,
  GQLFitnessLevel,
  GQLGoal,
  GQLHeightUnit,
  GQLNotificationPreferences,
  GQLTheme,
  GQLTimeFormat,
  GQLTrainingView,
  GQLUserProfile,
  GQLWeightUnit,
} from '@/generated/graphql-server'
import {
  Location as PrismaLocation,
  User as PrismaUser,
  UserBodyMeasure as PrismaUserBodyMeasure,
  UserLocation as PrismaUserLocation,
  UserProfile as PrismaUserProfile,
} from '@/generated/prisma/client'

import Location from '../location/model'
import UserBodyMeasure from '../user-body-measure/model'

function toISOString(date: Date | string | null | undefined): string | null {
  if (!date) return null
  if (typeof date === 'string') return date
  return date.toISOString()
}

export default class UserProfile implements GQLUserProfile {
  constructor(
    protected data: PrismaUserProfile & {
      user?: PrismaUser & {
        locations?: (PrismaUserLocation & { location: PrismaLocation })[]
      }
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
    return toISOString(this.data.birthday)
  }

  get sex() {
    return this.data.sex
  }

  get avatarUrl() {
    return this.data.avatarUrl
  }

  get locations() {
    return (
      this.data.user?.locations?.map((ul) => new Location(ul.location)) || []
    )
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
      if (this.data.weight) {
        return this.data.weight
      }
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

  get specialization() {
    return this.data.specialization || []
  }

  get credentials() {
    return this.data.credentials || []
  }

  get successStories() {
    return this.data.successStories || []
  }

  get trainerSince() {
    if (!this.data.trainerSince) return null
    if (typeof this.data.trainerSince === 'string') {
      return this.data.trainerSince
    }

    return this.data.trainerSince?.toISOString() ?? null
  }

  get trainerCardBackgroundUrl() {
    return this.data.trainerCardBackgroundUrl || null
  }

  get createdAt() {
    return toISOString(this.data.createdAt) ?? ''
  }

  get updatedAt() {
    return toISOString(this.data.updatedAt) ?? ''
  }

  get weightUnit(): GQLWeightUnit {
    return (this.data.weightUnit as GQLWeightUnit) || GQLWeightUnit.Kg
  }

  get heightUnit(): GQLHeightUnit {
    return (this.data.heightUnit as GQLHeightUnit) || GQLHeightUnit.Cm
  }

  get theme(): GQLTheme {
    return (this.data.theme as GQLTheme) || GQLTheme.System
  }

  get timeFormat(): GQLTimeFormat {
    switch (this.data.timeFormat) {
      case GQLTimeFormat.H24:
        return GQLTimeFormat.H24
      case GQLTimeFormat.H12:
        return GQLTimeFormat.H12
      default:
        return GQLTimeFormat.H24
    }
  }

  get trainingView() {
    switch (this.data.trainingView) {
      case GQLTrainingView.Simple:
        return GQLTrainingView.Simple
      case GQLTrainingView.Advanced:
        return GQLTrainingView.Advanced
      default:
        return GQLTrainingView.Simple
    }
  }

  get weekStartsOn() {
    return this.data.weekStartsOn
  }

  get notificationPreferences(): GQLNotificationPreferences {
    return {
      workoutReminders: this.data.workoutReminders ?? true,
      progressUpdates: this.data.progressUpdates ?? true,
      systemNotifications: this.data.systemNotifications ?? true,
      emailNotifications: this.data.emailNotifications ?? true,
      pushNotifications: this.data.pushNotifications ?? false,
      checkinReminders: this.data.checkinReminders ?? true,
    }
  }

  get hasCompletedOnboarding() {
    return this.data.hasCompletedOnboarding ?? false
  }

  get timezone() {
    return this.data.timezone
  }

  get blurProgressSnapshots() {
    return this.data.blurProgressSnapshots ?? false
  }
}
