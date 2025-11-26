import {
  GQLPackageSummaryItem,
  GQLTrainerOffer,
  GQLTrainerOfferStatus,
} from '@/generated/graphql-server'
import {
  ServiceDelivery as PrismaServiceDelivery,
  TrainerOffer as PrismaTrainerOffer,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import { ServiceDelivery } from '../subscription/model'
import User from '../user/model'

export default class TrainerOffer implements GQLTrainerOffer {
  constructor(
    protected data: PrismaTrainerOffer & {
      trainer?: PrismaUser & {
        profile?: PrismaUserProfile | null
      }
      serviceDeliveries?: PrismaServiceDelivery[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get token() {
    return this.data.token
  }

  get trainerId() {
    return this.data.trainerId
  }

  get clientEmail() {
    return this.data.clientEmail
  }

  get personalMessage() {
    return this.data.personalMessage
  }

  get status(): GQLTrainerOfferStatus {
    switch (this.data.status) {
      case 'PAID':
        return GQLTrainerOfferStatus.Paid
      case 'EXPIRED':
        return GQLTrainerOfferStatus.Expired
      case 'CANCELLED':
        return GQLTrainerOfferStatus.Cancelled
      default:
        return GQLTrainerOfferStatus.Pending
    }
  }

  get packageSummary(): GQLPackageSummaryItem[] {
    if (!this.data.packageSummary) {
      return []
    }

    try {
      const summary = this.data.packageSummary as {
        packageId: string
        quantity: number
        name: string
      }[]

      return summary.map((item) => ({
        packageId: item.packageId,
        quantity: item.quantity,
        name: item.name,
      }))
    } catch {
      return []
    }
  }

  get stripeCheckoutSessionId() {
    return this.data.stripeCheckoutSessionId
  }

  get stripePaymentIntentId() {
    return this.data.stripePaymentIntentId
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  get expiresAt() {
    return this.data.expiresAt.toISOString()
  }

  get completedAt() {
    return this.data.completedAt?.toISOString() || null
  }

  get trainer() {
    if (!this.data.trainer) {
      throw new Error('Trainer data not loaded')
    }
    return new User(this.data.trainer, this.context)
  }

  get serviceDeliveries() {
    if (!this.data.serviceDeliveries) {
      return []
    }
    return this.data.serviceDeliveries.map(
      (delivery) => new ServiceDelivery(delivery, this.context),
    )
  }
}
