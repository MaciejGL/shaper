import type {
  GQLServiceType,
  GQLUserSubscription,
  GQLUserSubscriptionStatus,
} from '@/generated/graphql-server'
import type { ServiceUsageTracker } from '@/types/subscription'

import UserSubscription from '../user-subscription/model'

export interface UserSubscriptionStatusData {
  hasPremium: boolean
  activeSubscriptions: UserSubscription[]
  cancelledSubscriptions: UserSubscription[]
  trainingPlanLimit: number
  usageTrackers: ServiceUsageTracker[]
  canAccessPremiumTrainingPlans: boolean
  canAccessPremiumExercises: boolean
  canAccessMealPlans: boolean
  isInGracePeriod: boolean
  hasTrainerSubscription: boolean
  trainerId?: string | null
  subscriptionEndDate?: string | null
}

export default class UserSubscriptionStatus
  implements GQLUserSubscriptionStatus
{
  constructor(private data: UserSubscriptionStatusData) {}

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
    return this.data.activeSubscriptions
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

  get isInGracePeriod() {
    return this.data.isInGracePeriod
  }

  get hasTrainerSubscription() {
    return this.data.hasTrainerSubscription
  }

  get cancelledSubscriptions(): GQLUserSubscription[] {
    return this.data.cancelledSubscriptions
  }
}
