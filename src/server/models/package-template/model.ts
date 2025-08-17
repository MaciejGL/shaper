import type {
  PackageService as PrismaPackageService,
  PackageTemplate as PrismaPackageTemplate,
  User as PrismaUser,
} from '@prisma/client'

import {
  type GQLPackageService,
  type GQLPackageTemplate,
  GQLServiceType,
  GQLSubscriptionDuration,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'
import { SubscriptionDuration } from '@/types/subscription'

import UserPublic from '../user-public/model'

export type PackageTemplateWithIncludes = PrismaPackageTemplate & {
  services: PrismaPackageService[]
  trainer?: PrismaUser | null
  _count?: {
    subscriptions: number
  }
}

export default class PackageTemplate implements GQLPackageTemplate {
  constructor(
    private data: PackageTemplateWithIncludes,
    private context: GQLContext,
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

  get priceNOK() {
    return this.data.priceNOK
  }

  get duration() {
    switch (this.data.duration) {
      case SubscriptionDuration.MONTHLY:
        return GQLSubscriptionDuration.Monthly
      case SubscriptionDuration.YEARLY:
        return GQLSubscriptionDuration.Yearly
    }
    return GQLSubscriptionDuration.Monthly
  }

  get isActive() {
    return this.data.isActive
  }

  get trainerId() {
    return this.data.trainerId
  }

  get trainer() {
    return this.data.trainer
      ? new UserPublic(this.data.trainer, this.context)
      : null
  }

  get services(): GQLPackageService[] {
    return this.data.services.map((service) => ({
      id: service.id,
      serviceType: service.serviceType as any, // Cast to GraphQL enum
      quantity: service.quantity,
    }))
  }

  get activeSubscriptionCount() {
    // This would need to be calculated in the factory/resolver
    return this.data._count?.subscriptions || 0
  }

  get totalSubscriptionCount() {
    // This would need to be calculated in the factory/resolver
    return this.data._count?.subscriptions || 0
  }

  get totalRevenue() {
    // This would need to be calculated in the factory/resolver
    return 0
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
