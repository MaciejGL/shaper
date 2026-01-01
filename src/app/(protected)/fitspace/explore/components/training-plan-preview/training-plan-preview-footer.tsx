import { Crown, Plus } from 'lucide-react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'

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
  const rules = usePaymentRules()
  const { openUrl, isLoading: isOpeningUrl } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
    openInApp: rules.canLinkToPayment,
  })
  const { data: subscriptionData } = useCurrentSubscription(user?.id)
  const hasPremium = subscriptionData?.hasPremiumAccess || false

  const handleAddPlan = () => {
    // If user doesn't have premium, redirect to offers page
    // This prevents hitting the backend training plan limit error
    if (!hasPremium) {
      openUrl(
        '/account-management/offers?redirectUrl=/fitspace/explore?tab=premium-plans',
      )
      return
    }

    // Add the plan to user's plans (they can activate it later from My Plans)
    onAssignTemplate(plan.id)
  }

  const isLoading = isAssigning || isOpeningUrl

  return (
    <DrawerFooter className="border-t">
      <PremiumButtonWrapper
        hasPremium={hasPremium}
        tooltipText="Requires additional access"
      >
        <Button
          className="w-full"
          size="lg"
          onClick={hasPremium ? handleAddPlan : undefined}
          disabled={isLoading || !hasPremium}
          loading={isLoading}
          iconStart={!plan.premium ? <Crown /> : <Plus />}
        >
          Add to My Plans
        </Button>
      </PremiumButtonWrapper>
    </DrawerFooter>
  )
}
