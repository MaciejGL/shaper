import {
  GQLDeliveryStatus,
  GQLPackageTemplate,
  GQLServiceDelivery,
  GQLServiceType,
  GQLSubscriptionDuration,
} from '@/generated/graphql-server'
import {
  PackageTemplate as PrismaPackageTemplate,
  ServiceDelivery as PrismaServiceDelivery,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import User from '../user/model'

export class PackageTemplate implements GQLPackageTemplate {
  constructor(
    protected data: PrismaPackageTemplate & {
      trainer?:
        | (PrismaUser & {
            profile?: PrismaUserProfile | null
          })
        | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get description() {
    return this.data.description
  }

  get duration(): GQLSubscriptionDuration {
    return this.data.duration as GQLSubscriptionDuration
  }

  get isActive() {
    return this.data.isActive
  }

  get serviceType() {
    const metadata = this.data.metadata as {
      service_type?: GQLServiceType
    } | null

    switch (metadata?.service_type) {
      case 'workout_plan':
        return GQLServiceType.WorkoutPlan
      case 'meal_plan':
        return GQLServiceType.MealPlan
      case 'coaching_complete':
        return GQLServiceType.CoachingComplete
      case 'in_person_meeting':
        return GQLServiceType.InPersonMeeting
      case 'premium_access':
        return GQLServiceType.PremiumAccess
      default:
        return null
    }
  }

  get stripePriceId() {
    return this.data.stripePriceId
  }

  get stripeProductId() {
    return this.data.stripeProductId
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get trainer() {
    return this.data.trainer ? new User(this.data.trainer, this.context) : null
  }

  get trainerId() {
    return this.data.trainerId
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}

export class ServiceDelivery implements GQLServiceDelivery {
  constructor(
    protected data: PrismaServiceDelivery & {
      trainer?:
        | (PrismaUser & {
            profile?: PrismaUserProfile | null
          })
        | null
      client?:
        | (PrismaUser & {
            profile?: PrismaUserProfile | null
          })
        | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get clientId() {
    return this.data.clientId
  }

  get packageName() {
    return this.data.packageName
  }

  get quantity() {
    return this.data.quantity
  }

  get serviceType(): GQLServiceType {
    return this.data.serviceType as GQLServiceType
  }

  get status(): GQLDeliveryStatus {
    return this.data.status as GQLDeliveryStatus
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  get deliveredAt() {
    return this.data.deliveredAt?.toISOString() || null
  }

  get deliveryNotes() {
    return this.data.deliveryNotes
  }

  get trainer() {
    if (!this.data.trainer) {
      throw new Error('Trainer data not loaded')
    }
    return new User(this.data.trainer, this.context)
  }

  get trainerId() {
    return this.data.trainerId
  }

  get client() {
    if (!this.data.client) {
      throw new Error('Client data not loaded')
    }
    return new User(this.data.client, this.context)
  }
}
