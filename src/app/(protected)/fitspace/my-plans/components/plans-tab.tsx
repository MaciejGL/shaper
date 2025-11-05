import { ChevronRight, Dumbbell } from 'lucide-react'
import { useState } from 'react'

import { BiggyIcon } from '@/components/biggy-icon'
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

// Helper function to group plans by status
function groupPlansByStatus(
  plans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[],
): Record<
  PlanStatus,
  {
    plans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[]
    count: number
  }
> {
  const groups: Record<
    PlanStatus,
    {
      plans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[]
      count: number
    }
  > = {
    [PlanStatus.Active]: { plans: [], count: 0 },
    [PlanStatus.Template]: { plans: [], count: 0 },
    [PlanStatus.Paused]: { plans: [], count: 0 },
    [PlanStatus.Completed]: { plans: [], count: 0 },
  }

  plans.forEach((item) => {
    const status = getPlanStatus(item.plan, item.isActive)
    groups[status].plans.push(item)
    groups[status].count++
  })

  // Sort plans within each group by date
  Object.values(groups).forEach((group) => {
    group.plans.sort((a, b) => {
      const dateA = getPlanDate(a.plan)
      const dateB = getPlanDate(b.plan)
      return dateB.getTime() - dateA.getTime()
    })
  })

  return groups
}

// Compact empty state card for list sections
interface EmptyStatusCardProps {
  status: PlanStatus.Active | PlanStatus.Template
}

function EmptyStatusCard({ status }: EmptyStatusCardProps) {
  if (status === PlanStatus.Active) {
    return (
      <CardContent className="flex items-center gap-4 py-4">
        {/* <div className="size-12 bg-muted rounded-full flex items-center justify-center shrink-0">
            <svg
              className="size-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div> */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">Activate Your Plan</h4>
          <p className="text-sm text-muted-foreground">
            Select one of your available plans to get started or select one of
            our pre-made plans
          </p>
        </div>
        <ButtonLink
          href="/fitspace/explore?tab=plans"
          size="sm"
          iconEnd={<ChevronRight />}
        >
          Find Plan
        </ButtonLink>
      </CardContent>
    )
  }

  // Template status
  return (
    <div className="space-y-3">
      <CardContent className="flex items-center gap-4 py-6">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">No Template Plans</h4>
          <p className="text-sm text-muted-foreground">
            Explore ready-made plans or get a personalized one from a trainer
          </p>
        </div>
        <ButtonLink
          href="/fitspace/explore?tab=plans"
          size="sm"
          iconEnd={<ChevronRight />}
        >
          Explore
        </ButtonLink>
      </CardContent>
    </div>
  )
}

// Status divider with count badge
interface StatusDividerProps {
  status: PlanStatus
  count: number
}

function StatusDivider({ status, count }: StatusDividerProps) {
  return (
    <div className="flex items-center gap-3 pb-4 pt-2">
      <div className="h-px flex-1 bg-border" />
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {status}
        </span>
        <span className="flex-center size-5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

// Plans list component with status dividers
interface PlansListProps {
  plans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[]
  selectedFilter: FilterOption
  onPlanClick: (plan: UnifiedPlan) => void
}

function PlansList({ plans, selectedFilter, onPlanClick }: PlansListProps) {
  // When filter is "all", show sections with dividers
  if (selectedFilter === 'all') {
    const grouped = groupPlansByStatus(plans)
    const statusOrder = [
      PlanStatus.Active,
      PlanStatus.Template,
      PlanStatus.Paused,
      PlanStatus.Completed,
    ]

    return (
      <div className="space-y-2">
        {statusOrder.map((status, statusIndex) => {
          const group = grouped[status]
          const hasPlans = group.count > 0
          const isActiveOrTemplate =
            status === PlanStatus.Active || status === PlanStatus.Template

          // Only show sections with plans OR Active/Template (even if empty)
          if (!hasPlans && !isActiveOrTemplate) return null

          return (
            <div key={status}>
              {/* Show divider for all sections */}
              {status !== PlanStatus.Active && (
                <StatusDivider status={status} count={group.count} />
              )}

              {/* Show plans or empty state */}
              {hasPlans ? (
                <div className="space-y-2">
                  {group.plans.map(({ plan, isActive }) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isActive={isActive}
                      onClick={onPlanClick}
                    />
                  ))}
                </div>
              ) : isActiveOrTemplate ? (
                <EmptyStatusCard
                  status={status as PlanStatus.Active | PlanStatus.Template}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  // When filtering by specific status
  if (plans.length === 0) {
    // Show compact empty state for Active/Template
    if (
      selectedFilter === PlanStatus.Active ||
      selectedFilter === PlanStatus.Template
    ) {
      return <EmptyStatusCard status={selectedFilter} />
    }
    // For other statuses, let parent handle with EmptyFilterState
    return null
  }

  // Show plans without dividers
  return (
    <div className="space-y-2">
      {plans.map(({ plan, isActive }) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isActive={isActive}
          onClick={onPlanClick}
        />
      ))}
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
      <div className="space-y-8">
        {/* Filter Chips */}
        <PlanStatusFilter
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          counts={statusCounts}
        />

        {/* Plans List */}
        {sortedPlans.length > 0 ||
        selectedFilter === PlanStatus.Active ||
        selectedFilter === PlanStatus.Template ||
        selectedFilter === 'all' ? (
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
        <BiggyIcon icon={Dumbbell} />
        <h3 className="font-semibold">No {getFilterLabel()} plans</h3>
        <p className="text-muted-foreground text-center max-w-md">
          You don't have any {getFilterLabel()} plans at the moment.
        </p>
        <ButtonLink
          href="/fitspace/explore?tab=plans"
          iconEnd={<ChevronRight />}
        >
          Explore Plans
        </ButtonLink>
      </CardContent>
    </Card>
  )
}

function EmptyPlansState() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex-center flex-col gap-4 py-12">
          <BiggyIcon icon={Dumbbell} />
          <h3 className="font-semibold">No Training Plans</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have any training plans yet. Start one of your available
            plans or find a new one
          </p>
          <ButtonLink
            href="/fitspace/explore?tab=plans"
            size="sm"
            iconEnd={<ChevronRight />}
          >
            Find Plan
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
