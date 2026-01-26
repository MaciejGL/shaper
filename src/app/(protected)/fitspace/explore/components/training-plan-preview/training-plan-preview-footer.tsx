import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'
import { ANALYTICS_EVENTS, analyticsEvents } from '@/lib/analytics-events'
import { captureEvent } from '@/lib/posthog'

interface TrainingPlanPreviewFooterProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  onStartNow?: () => void | Promise<void>
  hasDemoWorkoutDay: boolean
  onTryDemoWorkoutDay: () => void
  isStartingNow: boolean
  hasActivePlan: boolean
}

export function TrainingPlanPreviewFooter({
  plan,
  onStartNow,
  hasDemoWorkoutDay,
  onTryDemoWorkoutDay,
  isStartingNow,
  hasActivePlan,
}: TrainingPlanPreviewFooterProps) {
  const { user } = useUser()
  const { data: subscriptionData } = useCurrentSubscription(user?.id)
  const { openModal } = useConfirmationModalContext()
  const hasPremium = subscriptionData?.hasPremiumAccess || false
  const rules = usePaymentRules()
  const { openUrl, isLoading: isOpeningUrl } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
    openInApp: rules.canLinkToPayment,
  })

  const trackProps = {
    plan_id: plan.id,
    plan_title: plan.title,
    has_premium: hasPremium,
    has_demo_workout_day: hasDemoWorkoutDay,
  }

  const showUpgradeCta = !hasPremium && plan.premium
  const isUpgradeLoading = showUpgradeCta && isOpeningUrl

  return (
    <DrawerFooter className="border-t">
      <div className="flex flex-col gap-2">
        {hasPremium && onStartNow ? (
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              if (!onStartNow) return

              if (hasActivePlan) {
                openModal({
                  title: 'You already have an active plan',
                  description:
                    'Starting this plan will pause your current plan. You can resume paused plans or mark them as done any time in My Plans.',
                  cancelText: 'Keep current plan',
                  confirmText: 'Start new plan',
                  onConfirm: async () => {
                    analyticsEvents.explorePlanStartNowTap(trackProps)
                    await onStartNow()
                  },
                  children: (
                    <p className="text-sm text-muted-foreground">
                      Manage your paused plans in{' '}
                      <Link
                        href="/fitspace/my-plans"
                        className="text-primary underline"
                      >
                        My Plans
                      </Link>
                      .
                    </p>
                  ),
                })
                return
              }

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
            iconEnd={<Play />}
          >
            View and start preview session
          </Button>
        ) : null}

        {showUpgradeCta ? (
          <PremiumButtonWrapper
            hasPremium={hasPremium}
            tooltipText="Upgrade to get full access to all plans made by coaches."
          >
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={() => {
                captureEvent(
                  ANALYTICS_EVENTS.EXPLORE_PLAN_UPGRADE_TAP,
                  trackProps,
                )
                if (hasPremium) {
                  openUrl(
                    `/account-management/offers?redirectUrl=/fitspace/explore?tab=premium-plans&plan=${plan.id}`,
                  )
                }
              }}
              disabled={isUpgradeLoading}
              loading={isUpgradeLoading}
              iconEnd={<ArrowRight />}
            >
              Get full plan
            </Button>
          </PremiumButtonWrapper>
        ) : null}
      </div>
    </DrawerFooter>
  )
}
