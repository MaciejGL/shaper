import { differenceInDays } from 'date-fns'
import { ChevronRight, Dumbbell } from 'lucide-react'
import { useState } from 'react'

import { BiggyIcon } from '@/components/biggy-icon'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { TrainerDiscoveryCta } from '@/components/trainer-discovery-cta'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'
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
  activePlan: ActivePlan | null,
): Record<FilterOption, number> {
  const counts: Record<FilterOption, number> = {
    all: allPlans.length + (activePlan ? 1 : 0),
    [PlanStatus.Active]: 0,
    [PlanStatus.Paused]: 0,
    [PlanStatus.Template]: 0,
    [PlanStatus.Completed]: 0,
  }

  // Count the active plan if it exists
  if (activePlan) {
    const activePlanStatus = getPlanStatus(activePlan, activePlan.active)
    counts[activePlanStatus] = (counts[activePlanStatus] || 0) + 1
  }

  // Count other plans
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

// Compact empty state card for list sections
interface EmptyStatusCardProps {
  status: PlanStatus.Active | PlanStatus.Template
}

function EmptyStatusCard({ status }: EmptyStatusCardProps) {
  if (status === PlanStatus.Active) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base mb-1">Activate Plan</h4>
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
      </Card>
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
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-center gap-2">
        <span className="capitalize">{status}</span>
        <span className="flex-center size-5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
    </div>
  )
}

// Plans list component with status dividers
interface PlansListProps {
  plans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[]
  selectedFilter: FilterOption
  onPlanClick: (plan: UnifiedPlan) => void
  hasActivePlan: boolean
}

function PlansList({
  plans,
  selectedFilter,
  onPlanClick,
  hasActivePlan,
}: PlansListProps) {
  // When filter is "all", show sections with dividers
  if (selectedFilter === 'all') {
    const templatePlans = plans.filter(
      ({ plan }) => getPlanStatus(plan, false) === PlanStatus.Template,
    )
    const pausedPlans = plans.filter(
      ({ plan }) => getPlanStatus(plan, false) === PlanStatus.Paused,
    )
    const completedPlans = plans.filter(
      ({ plan }) => getPlanStatus(plan, false) === PlanStatus.Completed,
    )

    const hasNewTemplatePlans = templatePlans.some(
      ({ plan }) =>
        plan.createdAt &&
        differenceInDays(new Date(), new Date(plan.createdAt)) < 3,
    )

    return (
      <div className="space-y-2">
        {!hasActivePlan && <EmptyStatusCard status={PlanStatus.Active} />}
        <Accordion
          type="single"
          collapsible
          defaultValue={
            !hasActivePlan || hasNewTemplatePlans ? 'template-plans' : undefined
          }
        >
          <AccordionItem value="template-plans" className="border-b">
            <AccordionTrigger className="px-2 py-4">
              <StatusDivider
                status={PlanStatus.Template}
                count={templatePlans.length}
              />
            </AccordionTrigger>
            <AccordionContent className=" space-y-2 grid grid-cols-[auto_1fr] gap-2">
              <div className="w-[2px] bg-amber-500 h-full rounded-full" />
              {templatePlans.map(({ plan }) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onClick={onPlanClick}
                  status={PlanStatus.Template}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
          {pausedPlans.length > 0 ? (
            <AccordionItem value="paused-plans" className="border-b">
              <AccordionTrigger className="px-2 py-4">
                <StatusDivider
                  status={PlanStatus.Paused}
                  count={pausedPlans.length}
                />
              </AccordionTrigger>
              <AccordionContent className=" space-y-2 grid grid-cols-[auto_1fr] gap-2">
                <div className="w-[2px] bg-amber-500 h-full rounded-full" />
                {pausedPlans.map(({ plan }) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onClick={onPlanClick}
                    status={PlanStatus.Paused}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : null}
          {completedPlans.length > 0 ? (
            <AccordionItem value="completed-plans" className="border-b">
              <AccordionTrigger className="px-2 py-4">
                <StatusDivider
                  status={PlanStatus.Completed}
                  count={completedPlans.length}
                />
              </AccordionTrigger>
              <AccordionContent className=" space-y-2 grid grid-cols-[auto_1fr] gap-2">
                <div className="w-[2px] bg-amber-500 h-full rounded-full" />
                {completedPlans.map(({ plan }) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onClick={onPlanClick}
                    status={PlanStatus.Completed}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : null}
        </Accordion>
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
          status={getPlanStatus(plan, isActive)}
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

  // Combine available and completed plans (active plan shown in header)
  const allPlans: { plan: NonNullable<UnifiedPlan>; isActive: boolean }[] = [
    ...availablePlans.map((plan) => ({ plan, isActive: false })),
    ...completedPlans.map((plan) => ({ plan, isActive: false })),
  ]

  // Count plans by status (include active plan in counts)
  const statusCounts = countPlansByStatus(allPlans, activePlan)

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
          <LoadingSkeleton count={6} variant="md" cardVariant="secondary" />
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
        {sortedPlans.length > 0 ||
        selectedFilter === PlanStatus.Active ||
        selectedFilter === PlanStatus.Template ||
        selectedFilter === 'all' ? (
          <PlansList
            plans={sortedPlans}
            selectedFilter={selectedFilter}
            onPlanClick={handlePlanClick}
            hasActivePlan={!!activePlan}
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
    <Card>
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
