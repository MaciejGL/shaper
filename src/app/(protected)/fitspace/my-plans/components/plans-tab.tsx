import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { CardSkeleton } from '@/components/card-skeleton'
import { TrainerDiscoveryCta } from '@/components/trainer-discovery-cta'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { GQLTrainingPlan } from '@/generated/graphql-client'

import {
  ActivePlan,
  AvailablePlan,
  CompletedPlan,
  PlanAction,
  UnifiedPlan,
} from '../types'

import { PlanCard } from './plan-card'
import { PlanDetailsDrawer } from './plan-details-drawer'

interface PlansTabProps {
  activePlan: ActivePlan | null
  availablePlans?: AvailablePlan[]
  completedPlans?: CompletedPlan[]
  handlePlanAction: (
    action: PlanAction,
    plan: Pick<
      GQLTrainingPlan,
      'title' | 'weekCount' | 'totalWorkouts' | 'id' | 'startDate'
    > | null,
  ) => void
  loading: boolean
}

export function PlansTab({
  activePlan,
  availablePlans = [],
  completedPlans = [],
  handlePlanAction,
  loading,
}: PlansTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<UnifiedPlan | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Combine all plans into a single array
  const allPlans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[] = [
    ...(activePlan ? [{ plan: activePlan, isActive: true }] : []),
    ...availablePlans.map((plan) => ({ plan, isActive: false })),
    ...completedPlans.map((plan) => ({ plan, isActive: false })),
  ]

  const handlePlanClick = (plan: UnifiedPlan) => {
    setSelectedPlan(plan)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedPlan(null)
  }

  const handleAction = (action: PlanAction, plan: UnifiedPlan) => {
    if (!plan) return
    handlePlanAction(action, plan)
    // Close drawer after action for better UX
    setIsDrawerOpen(false)
    setSelectedPlan(null)
  }

  if (loading) {
    return (
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (allPlans.length === 0) {
    return <EmptyPlansState />
  }

  return (
    <>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          {activePlan ? (
            <>
              <p className="text-base font-medium">Active Plan</p>
              <PlanCard plan={activePlan} isActive onClick={handlePlanClick} />
            </>
          ) : (
            <EmptyActivePlansState />
          )}
        </div>

        {availablePlans.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium">Training Templates</p>
            {availablePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onClick={handlePlanClick} />
            ))}
          </div>
        )}

        {completedPlans.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium">Completed</p>
            {completedPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onClick={handlePlanClick} />
            ))}
          </div>
        )}
      </div>

      <PlanDetailsDrawer
        plan={selectedPlan}
        isActive={selectedPlan?.id === activePlan?.id}
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAction={handleAction}
        isLoading={loading}
      />
    </>
  )
}

function EmptyActivePlansState() {
  const { user } = useUser()
  const hasTrainer = user?.trainer?.id
  return (
    <Card borderless>
      <CardContent className="flex-center flex-col gap-4 py-6">
        <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <svg
            className="size-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="font-semibold">No Active Plan</h3>
        {hasTrainer ? (
          <p className="text-muted-foreground text-center max-w-md">
            You don't have any active plan yet. Activate one of your template
            plans or the one assigned by your trainer.
          </p>
        ) : (
          <p className="text-muted-foreground text-center max-w-md">
            You don't have any active plan yet. Activate one of your template
            plans or find a plan that suits you best.
          </p>
        )}

        {!hasTrainer && (
          <ButtonLink
            href="/fitspace/explore?tab=plans"
            iconEnd={<ChevronRight />}
          >
            Explore Plans
          </ButtonLink>
        )}
        {!hasTrainer && (
          <TrainerDiscoveryCta
            variant="compact"
            title="Need Help Getting Started?"
            subtitle="Connect with a trainer for personalized guidance"
          />
        )}
      </CardContent>
    </Card>
  )
}

function EmptyPlansState() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex-center flex-col gap-4 py-12">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <svg
              className="size-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="font-semibold">No Training Plans</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have any training plans yet. Create your first plan or
            check our ready plans!
          </p>

          <ButtonLink
            href="/fitspace/explore?tab=plans"
            iconEnd={<ChevronRight />}
          >
            Explore Plans
          </ButtonLink>
        </CardContent>
      </Card>

      <TrainerDiscoveryCta
        variant="compact"
        title="Need Help Getting Started?"
        subtitle="Connect with a trainer for personalized guidance"
      />
    </div>
  )
}
