import { Crown, Dumbbell, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { useOpenUrl } from '@/hooks/use-open-url'

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
  const { user } = useUser()
  const { openUrl, isLoading: isOpeningUrl } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
  })
  const { data: subscriptionData } = useCurrentSubscription(user?.id)
  const hasPremium = subscriptionData?.hasPremiumAccess || false

  const handleStartPlan = () => {
    // If user doesn't have premium, redirect to offers page
    // This prevents hitting the backend training plan limit error
    if (!hasPremium) {
      openUrl(
        `/account-management/offers?redirectUrl=/fitspace/explore/plan/${plan.id}`,
      )
      return
    }

    // Premium users can start the plan directly
    onAssignTemplate(plan.id)
  }

  const isLoading = isAssigning || isOpeningUrl

  return (
    <div className="border-t p-4 flex-shrink-0">
      <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
          onClick={handleStartPlan}
          disabled={isLoading}
          loading={isLoading}
          iconStart={plan.premium ? <Crown /> : <Dumbbell />}
        >
          Start Training Plan
          </Button>
      </div>
    </div>
  )
}
