import { Crown, Dumbbell, Lock } from 'lucide-react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'

interface TrainingPlanPreviewFooterProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  onAssignTemplate: (planId: string) => void
  isAssigning: boolean
}

export function TrainingPlanPreviewFooter({
  plan,
  onAssignTemplate,
  isAssigning,
}: TrainingPlanPreviewFooterProps) {
  // const { hasPremium } = useUser()
  const hasPremium = false

  return (
    <div className="border-t p-4 flex-shrink-0">
      <div className="space-y-3">
        {plan.premium ? (
          // Premium plan - wrap with PremiumButtonWrapper
          <PremiumButtonWrapper
            hasPremium={hasPremium}
            tooltipText="Upgrade to Premium to access this training plan"
          >
            <Button
              className="w-full"
              size="lg"
              onClick={() => onAssignTemplate(plan.id)}
              loading={isAssigning}
              disabled={isAssigning || !hasPremium}
              iconStart={hasPremium ? <Crown /> : <Lock />}
            >
              {hasPremium ? 'Add to My Plans' : 'Premium Required'}
            </Button>
          </PremiumButtonWrapper>
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

        {plan.premium && !hasPremium && (
          <p className="text-xs text-center text-muted-foreground">
            Upgrade to Premium to access this training plan and unlock advanced
            features
          </p>
        )}
      </div>
    </div>
  )
}
