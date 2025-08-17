import { JsonValue } from '@prisma/client/runtime/library'

import type {
  GQLServiceType,
  GQLUserSubscription,
  GQLUserSubscriptionStatus,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'
import type {
  ServiceUsageTracker,
  UserSubscriptionWithDetails,
} from '@/types/subscription'

import UserSubscription, {
  UserSubscriptionWithIncludes,
} from '../user-subscription/model'

export interface UserSubscriptionStatusData {
  hasPremium: boolean
  activeSubscriptions: UserSubscriptionWithDetails[]
  trainingPlanLimit: number
  usageTrackers: ServiceUsageTracker[]
  canAccessPremiumTrainingPlans: boolean
  canAccessPremiumExercises: boolean
  canAccessMealPlans: boolean
}

export default class UserSubscriptionStatus
  implements GQLUserSubscriptionStatus
{
  constructor(
    private data: UserSubscriptionStatusData,
    private context: GQLContext,
  ) {}

  get hasPremium() {
    return this.data.hasPremium
  }

  get trainingPlanLimit() {
    return this.data.trainingPlanLimit
  }

  get canAccessPremiumTrainingPlans() {
    return this.data.canAccessPremiumTrainingPlans
  }

  get canAccessPremiumExercises() {
    return this.data.canAccessPremiumExercises
  }

  get canAccessMealPlans() {
    return this.data.canAccessMealPlans
  }

  get activeSubscriptions(): GQLUserSubscription[] {
    return this.data.activeSubscriptions.map((sub) => {
      // Include all subscription data including package relationship
      const subscriptionData: UserSubscriptionWithIncludes = {
        id: sub.id,
        userId: sub.userId,
        packageId: sub.packageId,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        trainerId: sub.trainerId || null,
        stripeSubscriptionId: sub.stripeSubscriptionId || null,
        stripePriceId: sub.stripePriceId || null,
        mockPaymentStatus: sub.mockPaymentStatus || null,
        mockTransactionId: sub.mockTransactionId || null,
        usedServices: (sub.usedServices || []).map((service) => ({
          ...service,
          subscriptionId: sub.id,
          metadata: (service.metadata as JsonValue) || null,
        })),
        package: {
          ...sub.package,
          trainerId: sub.trainerId || null,
          description: sub.package.description || null,
          services: sub.package.services.map((service) => ({
            ...service,
            packageId: sub.packageId,
          })),
        },
      }

      return new UserSubscription(subscriptionData, this.context)
    })
  }

  get usageTrackers() {
    return this.data.usageTrackers.map((tracker) => ({
      serviceType: tracker.serviceType as unknown as GQLServiceType,
      usedThisMonth: tracker.usedThisMonth,
      allowedPerMonth: tracker.allowedPerMonth,
      remainingUsage: tracker.remainingUsage,
      nextResetDate: tracker.nextResetDate.toISOString(),
    }))
  }
}
