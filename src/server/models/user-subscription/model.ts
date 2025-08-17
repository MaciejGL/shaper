import type {
  PackageService as PrismaPackageService,
  PackageTemplate as PrismaPackageTemplate,
  ServiceUsage as PrismaServiceUsage,
  User as PrismaUser,
  UserSubscription as PrismaUserSubscription,
} from '@prisma/client'

import {
  GQLServiceType,
  GQLServiceUsage,
  GQLSubscriptionStatus,
  GQLUserSubscription,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'
import { SubscriptionStatus } from '@/types/subscription'

import PackageTemplate from '../package-template/model'

export type UserSubscriptionWithIncludes = PrismaUserSubscription & {
  user?: PrismaUser | null
  package?:
    | (PrismaPackageTemplate & {
        services: PrismaPackageService[]
        trainer?: PrismaUser | null
      })
    | null
  trainer?: PrismaUser | null
  usedServices?: PrismaServiceUsage[]
}

export default class UserSubscription implements GQLUserSubscription {
  constructor(
    private data: UserSubscriptionWithIncludes,
    private context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get userId() {
    return this.data.userId
  }

  get packageId() {
    return this.data.packageId
  }

  get trainerId() {
    return this.data.trainerId
  }

  get status() {
    switch (this.data.status) {
      case SubscriptionStatus.ACTIVE:
        return GQLSubscriptionStatus.Active
      case SubscriptionStatus.EXPIRED:
        return GQLSubscriptionStatus.Expired
      case SubscriptionStatus.CANCELLED:
        return GQLSubscriptionStatus.Cancelled
      case SubscriptionStatus.PENDING:
        return GQLSubscriptionStatus.Pending
    }
    return GQLSubscriptionStatus.Pending
  }

  get startDate() {
    return this.data.startDate.toISOString()
  }

  get endDate() {
    return this.data.endDate.toISOString()
  }

  get stripeSubscriptionId() {
    return this.data.stripeSubscriptionId
  }

  get stripePriceId() {
    return this.data.stripePriceId
  }

  get mockPaymentStatus() {
    return this.data.mockPaymentStatus
  }

  get mockTransactionId() {
    return this.data.mockTransactionId
  }

  get package() {
    if (!this.data.package) {
      throw new Error('Package data not included in subscription')
    }

    return new PackageTemplate(this.data.package, this.context)
  }

  get usedServices(): GQLServiceUsage[] {
    return (this.data.usedServices || []).map((usage) => ({
      id: usage.id,
      subscriptionId: usage.subscriptionId,
      serviceType: usage.serviceType as GQLServiceType,
      usedAt: usage.usedAt.toISOString(),
      quantity: usage.quantity,
      metadata: usage.metadata ? JSON.stringify(usage.metadata) : null,
    }))
  }

  get isActive() {
    return (
      this.data.status === SubscriptionStatus.ACTIVE &&
      this.data.endDate > new Date()
    )
  }

  get daysUntilExpiry() {
    const now = new Date()
    const expiry = new Date(this.data.endDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
