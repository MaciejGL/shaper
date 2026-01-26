import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { TrainerDiscoveryCta } from '@/components/trainer-discovery-cta'
import { ButtonLink } from '@/components/ui/button-link'
// import { Card, CardContent } from '@/components/ui/card'
import { GQLTrainingPlan } from '@/generated/graphql-client'

import {
  ActivePlan,
  AvailablePlan,
  CompletedPlan,
  PlanAction,
  PlanStatus,
  UnifiedPlan,
  getPlanStatus,
} from '../types'

import { PlanDetailsDrawer } from './plan-details-drawer'
import { PlanSection } from './plan-section'

interface CoachingPlansProps {
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

// Status priority for sorting (lower number = higher priority)
const STATUS_PRIORITY: Record<PlanStatus, number> = {
  [PlanStatus.Active]: 1,
  [PlanStatus.Template]: 2,
  [PlanStatus.Paused]: 3,
  [PlanStatus.Completed]: 4,
}

// Helper function to get date for sorting
function getPlanDate(plan: UnifiedPlan): Date {
  if (plan && 'startDate' in plan && plan.startDate) {
    return new Date(plan.startDate)
  }
  if (plan && 'updatedAt' in plan && plan.updatedAt) {
    return new Date(plan.updatedAt)
  }
  return new Date(0) // Fallback to epoch
}

// Helper function to sort plans by status priority and date
function sortPlans(
  plans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[],
): { plan: NonNullable<UnifiedPlan>; isActive: boolean }[] {
  return [...plans].sort((a, b) => {
    const statusA = getPlanStatus(a.plan, a.isActive)
    const statusB = getPlanStatus(b.plan, b.isActive)

    // First sort by status priority
    const priorityDiff = STATUS_PRIORITY[statusA] - STATUS_PRIORITY[statusB]
    if (priorityDiff !== 0) return priorityDiff

    // Then sort by date (newest first)
    const dateA = getPlanDate(a.plan)
    const dateB = getPlanDate(b.plan)
    return dateB.getTime() - dateA.getTime()
  })
}

// Compact empty state card for list sections
// interface EmptyStatusCardProps {
//   status: PlanStatus.Active | PlanStatus.Template
// }

// function EmptyStatusCard({ status }: EmptyStatusCardProps) {
//   if (status === PlanStatus.Active) {
//     return (
//       <Card>
//         <CardContent className="flex items-center gap-4">
//           <div className="flex-1 min-w-0">
//             <h4 className="font-semibold text-base mb-1">Activate Plan</h4>
//             <p className="text-sm text-muted-foreground">
//               Select one of plans from your personal plans or explore our
//               ready-made programs
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   // Template status
//   return (
//     <div className="space-y-3">
//       <CardContent className="flex items-center gap-4 py-6">
//         <div className="flex-1 min-w-0">
//           <h4 className="font-semibold text-sm mb-1">No Plans Yet</h4>
//           <p className="text-sm text-muted-foreground">
//             Get plans from your trainer or explore our ready-made programs
//           </p>
//         </div>
//         <ButtonLink
//           href="/fitspace/explore?tab=plans"
//           size="sm"
//           iconEnd={<ChevronRight />}
//         >
//           Explore
//         </ButtonLink>
//       </CardContent>
//     </div>
//   )
// }

// Plans list component with status dividers
interface PlansListProps {
  plans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[]
  onPlanClick: (plan: UnifiedPlan) => void
  // hasActivePlan: boolean
}

function PlansList({ plans, onPlanClick }: PlansListProps) {
  const templatePlans = plans.filter(
    ({ plan }) => getPlanStatus(plan, false) === PlanStatus.Template,
  )

  // Split template plans by origin
  // Ready-made plans have sourceTrainingPlanId (public plans that were assigned)
  const readymadePlans = templatePlans.filter(
    ({ plan }) => 'sourceTrainingPlanId' in plan && plan.sourceTrainingPlanId,
  )
  // Trainer plans don't have sourceTrainingPlanId (created by trainer for user)
  const trainerPlans = templatePlans.filter(
    ({ plan }) =>
      !('sourceTrainingPlanId' in plan) || !plan.sourceTrainingPlanId,
  )

  const coachingPlans = [...trainerPlans, ...readymadePlans]

  const pausedPlans = plans.filter(
    ({ plan }) => getPlanStatus(plan, false) === PlanStatus.Paused,
  )
  const completedPlans = plans.filter(
    ({ plan }) => getPlanStatus(plan, false) === PlanStatus.Completed,
  )

  return (
    <div className="space-y-4">
      {/* {!hasActivePlan && <EmptyStatusCard status={PlanStatus.Active} />} */}

      {coachingPlans.length > 0 && (
        <PlanSection
          title="Plans from coaching"
          plans={coachingPlans.map(({ plan }) => plan)}
          onPlanClick={onPlanClick}
          showProgress={false}
          showCoachingBadge={true}
        />
      )}

      <PlanSection
        title="Paused Plans"
        plans={pausedPlans.map(({ plan }) => plan)}
        onPlanClick={onPlanClick}
        showProgress={true}
        showEmptyState={false}
      />

      <PlanSection
        title="Completed Plans"
        plans={completedPlans.map(({ plan }) => plan)}
        onPlanClick={onPlanClick}
        showProgress={true}
        showEmptyState={false}
      />
    </div>
  )
}

export function CoachingPlans({
  activePlan,
  availablePlans = [],
  completedPlans = [],
  handlePlanAction,
  loading,
}: CoachingPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<UnifiedPlan | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Combine available and completed plans (active plan shown in header)
  const allPlans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[] = [
    ...availablePlans.map((plan) => ({ plan, isActive: false })),
    ...completedPlans.map((plan) => ({ plan, isActive: false })),
  ]

  // Count plans by status (include active plan in counts)

  // Filter and sort plans
  const sortedPlans = sortPlans(allPlans)

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
      <div className="space-y-4">
        <LoadingSkeleton count={3} variant="light" />
      </div>
    )
  }

  if (allPlans.length === 0) {
    return <EmptyPlansState />
  }

  return (
    <>
      <div className="space-y-4">
        <PlansList
          plans={sortedPlans}
          onPlanClick={handlePlanClick}
          // hasActivePlan={!!activePlan}
        />
        <ButtonLink
          href="/fitspace/explore?tab=plans"
          variant="default"
          size="lg"
          iconEnd={<ChevronRight />}
          className="w-full mt-6"
        >
          Find More Plans
        </ButtonLink>
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

function EmptyPlansState() {
  return (
    <div className="space-y-4">
      <TrainerDiscoveryCta
        variant="banner"
        title="Check our trainers plans"
        subtitle="Explore our ready-made plans and find the perfect one for you"
        href="/fitspace/explore?tab=premium-plans"
        showBadge={false}
      />

      <TrainerDiscoveryCta
        variant="banner"
        title="Need Help From a Trainer?"
        subtitle="Reach out to a trainer for personalized guidance"
        href="/fitspace/explore?tab=trainers"
      />
    </div>
  )
}
