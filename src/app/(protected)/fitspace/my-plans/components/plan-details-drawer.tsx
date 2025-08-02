import { formatDate } from 'date-fns'
import { BicepsFlexed, Calendar, CheckCircle, Users } from 'lucide-react'

import { CollapsibleText } from '@/components/collapsible-text'
import { RatingStars } from '@/components/rating-stars'
import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  SimpleDrawerContent,
} from '@/components/ui/drawer'

import {
  AvailablePlan,
  CompletedPlan,
  PlanAction,
  PlanStatus,
  UnifiedPlan,
  getPlanStatus,
} from '../types'

import { CompletionStats } from './completion-stats'
import { PlanAuthor } from './plan-author'

interface PlanDetailsDrawerProps {
  plan: UnifiedPlan | null
  isActive?: boolean
  open: boolean
  onClose: () => void
  onAction: (action: PlanAction, plan: UnifiedPlan) => void
  isLoading?: boolean
}

export function PlanDetailsDrawer({
  plan,
  isActive = false,
  open,
  onClose,
  onAction,
  isLoading = false,
}: PlanDetailsDrawerProps) {
  if (!plan) return null

  const status = getPlanStatus(plan, isActive)
  const isCompleted = status === PlanStatus.Completed
  const isPaused = status === PlanStatus.Paused
  const isButtonLoading = isLoading || false

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <SimpleDrawerContent
        title={plan.title}
        headerIcon={<BicepsFlexed className="size-5" />}
        footer={
          <div className="flex items-center justify-end gap-2">
            <DrawerClose asChild>
              <Button variant="secondary" disabled={isButtonLoading}>
                Close
              </Button>
            </DrawerClose>
            {!isCompleted && (
              <Button
                onClick={() => onAction(isActive ? 'pause' : 'activate', plan)}
                disabled={isButtonLoading}
                className="flex items-center gap-2"
              >
                {isActive ? 'Pause' : isPaused ? 'Resume' : 'Activate'}
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Plan Status and Basic Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <PlanStatusBadge status={status} plan={plan} />
            {plan.difficulty && (
              <Badge variant="outline">{plan.difficulty}</Badge>
            )}
          </div>

          {/* Plan Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <StatsItem value={plan.weekCount} label="Weeks" />
            <StatsItem
              value={Math.round(plan.totalWorkouts / plan.weekCount)}
              label="Per Week"
            />
            <StatsItem value={plan.totalWorkouts} label="Total Workouts" />
          </div>

          {/* Rating and Reviews */}
          {plan.rating && plan.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <RatingStars rating={plan.rating} size="sm" />
              <span className="text-sm text-muted-foreground">
                {plan.rating.toFixed(1)} ({plan.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Progress Overview */}
          {(plan.completedWorkoutsDays > 0 || plan.adherence) && (
            <div className="space-y-2">
              <h3 className="font-medium">Progress</h3>
              <CompletionStats
                adherence={plan.adherence}
                completedWorkoutsDays={plan.completedWorkoutsDays}
                totalWorkouts={plan.totalWorkouts}
              />
            </div>
          )}

          {/* Plan Description */}
          {plan.description && (
            <div className="space-y-2">
              <h3 className="font-medium">Description</h3>
              <CollapsibleText text={plan.description} maxLines={10} />
            </div>
          )}

          {/* Plan Dates */}
          <PlanDates plan={plan} status={status} />

          {/* Plan Creator */}
          {'createdBy' in plan && plan.createdBy && (
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground mb-2">
                Created by
              </div>
              <PlanAuthor createdBy={plan.createdBy} />
            </div>
          )}
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}

function PlanStatusBadge({
  status,
  plan,
}: {
  status: PlanStatus
  plan: UnifiedPlan
}) {
  const getStatusConfig = (status: PlanStatus) => {
    switch (status) {
      case PlanStatus.Active:
        return {
          variant: 'primary' as const,
          icon: <BicepsFlexed className="h-3 w-3" />,
          label: 'Active',
        }
      case PlanStatus.Paused:
        return {
          variant: 'warning' as const,
          icon: <Calendar className="h-3 w-3" />,
          label: `Paused ${formatDate(new Date((plan as AvailablePlan).updatedAt), 'MMM d, yyyy')}`,
        }
      case PlanStatus.Completed:
        return {
          variant: 'secondary' as const,
          icon: <CheckCircle className="h-3 w-3" />,
          label: `Completed ${formatDate(new Date((plan as CompletedPlan).completedAt!), 'MMM d, yyyy')}`,
        }
      case PlanStatus.Template:
        return {
          variant: 'outline' as const,
          icon: <Users className="h-3 w-3" />,
          label: 'Template',
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </Badge>
  )
}

function PlanDates({
  plan,
  status,
}: {
  plan: UnifiedPlan
  status: PlanStatus
}) {
  if (!plan) return null

  const hasStartDate = 'startDate' in plan && plan.startDate
  const hasEndDate = 'endDate' in plan && plan.endDate
  const hasCompletedDate = 'completedAt' in plan && plan.completedAt

  if (!hasStartDate && !hasEndDate && !hasCompletedDate) return null

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Timeline</h3>
      <div className="space-y-1 text-sm">
        {hasStartDate && 'startDate' in plan && plan.startDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Started:</span>
            <span>{formatDate(new Date(plan.startDate), 'MMM d, yyyy')}</span>
          </div>
        )}
        {hasEndDate && 'endDate' in plan && plan.endDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {status === PlanStatus.Completed ? 'Ended:' : 'Planned End:'}
            </span>
            <span>{formatDate(new Date(plan.endDate), 'MMM d, yyyy')}</span>
          </div>
        )}
        {hasCompletedDate && 'completedAt' in plan && plan.completedAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed:</span>
            <span>{formatDate(new Date(plan.completedAt), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
