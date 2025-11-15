import { Crown, Dumbbell } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
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

  const handleAddPlan = () => {
    // If user doesn't have premium, redirect to offers page
    // This prevents hitting the backend training plan limit error
    if (!hasPremium) {
      openUrl(
        `/account-management/offers?redirectUrl=/fitspace/explore/plan/${plan.id}`,
      )
      return
    }

    // Add the plan to user's plans (they can activate it later from My Plans)
    onAssignTemplate(plan.id)
  }

  const isLoading = isAssigning || isOpeningUrl

  return (
    <DrawerFooter className="border-t">
      <Button
        className="w-full"
        size="lg"
        onClick={handleAddPlan}
        disabled={isLoading}
        loading={isLoading}
        iconStart={plan.premium ? <Crown /> : <Dumbbell />}
      >
        Add to My Plans
      </Button>
    </DrawerFooter>
  )
}
