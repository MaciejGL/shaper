import { Crown, Dumbbell, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  GQLGetMySubscriptionStatusQuery,
  GQLGetPublicTrainingPlansQuery,
} from '@/generated/graphql-client'

interface TrainingPlanPreviewFooterProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  subscriptionData?: GQLGetMySubscriptionStatusQuery
  onAssignTemplate: (planId: string) => void
  isAssigning: boolean
}

export function TrainingPlanPreviewFooter({
  plan,
  subscriptionData,
  onAssignTemplate,
  isAssigning,
}: TrainingPlanPreviewFooterProps) {
  return (
    <div className="border-t p-4 flex-shrink-0">
      <div className="space-y-3">
        {plan.isPremium ? (
          // Premium plan - check if user has access
          subscriptionData?.getMySubscriptionStatus?.hasPremium ||
          subscriptionData?.getMySubscriptionStatus
            ?.canAccessPremiumTrainingPlans ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => onAssignTemplate(plan.id)}
              loading={isAssigning}
              disabled={isAssigning}
              iconStart={<Crown />}
            >
              Add to My Plans
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              disabled
              iconStart={<Lock />}
            >
              Premium Required
            </Button>
          )
        ) : (
          // Free plan
          <Button
            className="w-full"
            size="lg"
            onClick={() => onAssignTemplate(plan.id)}
            disabled={isAssigning}
            loading={isAssigning}
            iconStart={<Dumbbell />}
          >
            Add to My Plans
          </Button>
        )}

        {plan.isPremium && (
          <p className="text-xs text-center text-muted-foreground">
            Upgrade to Premium to access this training plan and unlock advanced
            features
          </p>
        )}
      </div>
    </div>
  )
}

