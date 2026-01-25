import { Play, Plus } from 'lucide-react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'
import { analyticsEvents } from '@/lib/analytics-events'

interface TrainingPlanPreviewFooterProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  onAssignTemplate: (planId: string) => void
  onStartNow: () => void
  hasDemoWorkoutDay: boolean
  onTryDemoWorkoutDay: () => void
  isAssigning: boolean
  isStartingNow: boolean
}

export function TrainingPlanPreviewFooter({
  plan,
  onAssignTemplate,
  onStartNow,
  hasDemoWorkoutDay,
  onTryDemoWorkoutDay,
  isAssigning,
  isStartingNow,
}: TrainingPlanPreviewFooterProps) {
  const { user } = useUser()
  const rules = usePaymentRules()
  const { openUrl, isLoading: isOpeningUrl } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
    openInApp: rules.canLinkToPayment,
  })
  const { data: subscriptionData } = useCurrentSubscription(user?.id)
  const hasPremium = subscriptionData?.hasPremiumAccess || false

  const trackProps = {
    plan_id: plan.id,
    plan_title: plan.title,
    has_premium: hasPremium,
    has_demo_workout_day: hasDemoWorkoutDay,
  }

  const handleAddPlan = () => {
    analyticsEvents.explorePlanAddToMyPlansTap(trackProps)

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
      <div className="flex flex-col gap-2">
        {hasPremium ? (
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              analyticsEvents.explorePlanStartNowTap(trackProps)
              onStartNow()
            }}
            disabled={isStartingNow}
            loading={isStartingNow}
            iconStart={<Play />}
          >
            Start now
          </Button>
        ) : hasDemoWorkoutDay ? (
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              analyticsEvents.explorePlanStartDemoTap(trackProps)
              onTryDemoWorkoutDay()
            }}
            disabled={isLoading}
            loading={isLoading}
            iconStart={<Play />}
          >
            Start preview session
          </Button>
        ) : null}

        <PremiumButtonWrapper
          hasPremium={hasPremium}
          tooltipText="Get full access to all trainer-designed plans and add them to your collection."
        >
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={handleAddPlan}
            disabled={isLoading}
            loading={isLoading}
            iconStart={<Plus />}
          >
            Add to My Plans
          </Button>
        </PremiumButtonWrapper>
      </div>
    </DrawerFooter>
  )
}
