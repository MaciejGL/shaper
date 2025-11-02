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
  PlanStatus,
  UnifiedPlan,
  getPlanStatus,
} from '../types'

import { PlanCard } from './plan-card'
import { PlanDetailsDrawer } from './plan-details-drawer'
import { FilterOption, PlanStatusFilter } from './plan-status-filter'

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

// Status priority for sorting (lower number = higher priority)
const STATUS_PRIORITY: Record<PlanStatus, number> = {
  [PlanStatus.Active]: 1,
  [PlanStatus.Paused]: 2,
  [PlanStatus.Template]: 3,
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

// Helper function to count plans by status
function countPlansByStatus(
  allPlans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[],
): Record<FilterOption, number> {
  const counts: Record<FilterOption, number> = {
    all: allPlans.length,
    [PlanStatus.Active]: 0,
    [PlanStatus.Paused]: 0,
    [PlanStatus.Template]: 0,
    [PlanStatus.Completed]: 0,
  }

  allPlans.forEach(({ plan, isActive }) => {
    const status = getPlanStatus(plan, isActive)
    counts[status] = (counts[status] || 0) + 1
  })

  return counts
}

// Helper function to filter plans
function filterPlans(
  allPlans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[],
  filter: FilterOption,
): { plan: NonNullable<UnifiedPlan>; isActive: boolean }[] {
  if (filter === 'all') return allPlans

  return allPlans.filter(({ plan, isActive }) => {
    const status = getPlanStatus(plan, isActive)
    return status === filter
  })
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

// Plans list component with status dividers
interface PlansListProps {
  plans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[]
  selectedFilter: FilterOption
  onPlanClick: (plan: UnifiedPlan) => void
}

function PlansList({ plans, selectedFilter, onPlanClick }: PlansListProps) {
  return (
    <div className="space-y-2">
      {plans.map(({ plan, isActive }, index) => {
        const currentStatus = getPlanStatus(plan, isActive)
        const previousStatus =
          index > 0
            ? getPlanStatus(plans[index - 1].plan, plans[index - 1].isActive)
            : null

        // Show divider when status changes and filter is 'all'
        const showDivider =
          selectedFilter === 'all' &&
          previousStatus !== null &&
          currentStatus !== previousStatus

        return (
          <div key={plan.id}>
            {showDivider && (
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {currentStatus}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
            <PlanCard plan={plan} isActive={isActive} onClick={onPlanClick} />
          </div>
        )
      })}
    </div>
  )
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
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all')

  // Combine all plans into a single array
  const allPlans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[] = [
    ...(activePlan ? [{ plan: activePlan, isActive: true }] : []),
    ...availablePlans.map((plan) => ({ plan, isActive: false })),
    ...completedPlans.map((plan) => ({ plan, isActive: false })),
  ]

  // Count plans by status
  const statusCounts = countPlansByStatus(allPlans)

  // Filter and sort plans
  const filteredPlans = filterPlans(allPlans, selectedFilter)
  const sortedPlans = sortPlans(filteredPlans)

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
        <PlanStatusFilter
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          counts={statusCounts}
        />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (allPlans.length === 0) {
    return <EmptyPlansState />
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filter Chips */}
        <PlanStatusFilter
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          counts={statusCounts}
        />

        {/* Plans List */}
        {sortedPlans.length > 0 ? (
          <PlansList
            plans={sortedPlans}
            selectedFilter={selectedFilter}
            onPlanClick={handlePlanClick}
          />
        ) : (
          <EmptyFilterState filter={selectedFilter} />
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

function EmptyFilterState({ filter }: { filter: FilterOption }) {
  const getFilterLabel = () => {
    switch (filter) {
      case PlanStatus.Active:
        return 'active'
      case PlanStatus.Paused:
        return 'paused'
      case PlanStatus.Template:
        return 'template'
      case PlanStatus.Completed:
        return 'completed'
      default:
        return ''
    }
  }

  return (
    <Card borderless>
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
        <h3 className="font-semibold">No {getFilterLabel()} plans</h3>
        <p className="text-muted-foreground text-center max-w-md">
          You don't have any {getFilterLabel()} plans at the moment.
        </p>
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
