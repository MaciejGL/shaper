import { formatDate } from 'date-fns'
import {
  BicepsFlexed,
  CheckCircle,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  PauseIcon,
  SparklesIcon,
  Trash,
} from 'lucide-react'
import Link from 'next/link'

import { RatingStars } from '@/components/rating-stars'
import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import {
  AvailablePlan,
  CompletedPlan,
  PlanAction,
  PlanStatus,
  UnifiedPlan,
  getPlanStatus,
} from '../types'

import { PlanAuthor } from './plan-author'

interface PlanCardProps {
  plan: UnifiedPlan
  isActive?: boolean
  onClick: (plan: UnifiedPlan) => void
  onAction: (action: PlanAction, plan: UnifiedPlan) => void
  loading?: boolean
}

export function PlanCard({
  plan,
  isActive = false,
  onClick,
  onAction,
  loading = false,
}: PlanCardProps) {
  if (!plan) return null

  const status = getPlanStatus(plan, isActive)

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow',
        loading && 'opacity-50',
      )}
      onClick={() => onClick(plan)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-lg line-clamp-2">
                {plan.title}
              </CardTitle>
              <PlanActionDropdown
                plan={plan}
                isActive={isActive}
                onAction={onAction}
                loading={loading}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <PlanStatusBadge status={status} plan={plan} />
              {plan.difficulty && (
                <Badge variant="outline">{plan.difficulty}</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              {'createdBy' in plan && (
                <PlanAuthor size="md" createdBy={plan.createdBy} />
              )}
              <PlanRating plan={plan} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PlanStats plan={plan} />
        <PlanProgress plan={plan} />
      </CardContent>
    </Card>
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
          icon: <PauseIcon className="h-3 w-3" />,
          label: `Paused ${formatDate(new Date((plan as AvailablePlan).updatedAt), 'MMM d')}`,
        }
      case PlanStatus.Completed:
        return {
          variant: 'secondary' as const,
          icon: <CheckCircle className="h-3 w-3" />,
          label: `Completed ${formatDate(new Date((plan as CompletedPlan).completedAt!), 'MMM d')}`,
        }
      case PlanStatus.Template:
        return {
          variant: 'outline' as const,
          icon: <FileText className="h-3 w-3" />,
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

function PlanActionDropdown({
  plan,
  isActive,
  onAction,
  loading,
  onClick,
}: {
  plan: UnifiedPlan
  isActive: boolean
  onAction: (action: PlanAction, plan: UnifiedPlan) => void
  loading: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  const status = getPlanStatus(plan, isActive)
  const isCompleted = status === PlanStatus.Completed
  const isPaused = status === PlanStatus.Paused

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={onClick}>
        <Button
          variant="ghost"
          size="icon-sm"
          iconOnly={<MoreHorizontal />}
          disabled={loading}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isCompleted && (
          <>
            {isActive ? (
              <DropdownMenuItem onClick={() => onAction('pause', plan)}>
                <PauseIcon className="size-4 mr-2" />
                Pause Plan
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onAction('activate', plan)}>
                <SparklesIcon className="size-4 mr-2" />
                {isPaused ? 'Resume Plan' : 'Activate Plan'}
              </DropdownMenuItem>
            )}
            {isActive && (
              <DropdownMenuItem onClick={() => onAction('close', plan)}>
                <CheckCircle className="size-4 mr-2" />
                Complete Plan
              </DropdownMenuItem>
            )}
          </>
        )}
        <Link href={`/fitspace/training-preview/${plan?.id}`}>
          <DropdownMenuItem>
            <LayoutDashboard className="size-4 mr-2" />
            Plan Overview
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => onAction('delete', plan)}>
          <Trash className="size-4 mr-2" />
          Delete Plan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PlanRating({ plan }: { plan: UnifiedPlan }) {
  if (!plan?.rating || !plan?.totalReviews) return null

  return (
    <div className="flex items-center gap-1">
      <RatingStars rating={plan.rating} size="sm" />
      <span className="text-xs text-muted-foreground">
        ({plan.totalReviews})
      </span>
    </div>
  )
}

function PlanStats({ plan }: { plan: UnifiedPlan }) {
  if (!plan) return null

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <StatsItem value={plan.weekCount} label="Weeks" />
      <StatsItem
        value={Math.round(plan.totalWorkouts / plan.weekCount)}
        label="Per Week"
      />
      <StatsItem value={plan.totalWorkouts} label="Workouts" />
    </div>
  )
}

function PlanProgress({ plan }: { plan: UnifiedPlan }) {
  if (!plan?.completedWorkoutsDays && !plan?.adherence) return null

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {plan.completedWorkoutsDays} / {plan.totalWorkouts} completed
      </span>
      {plan.adherence && <span>{plan.adherence}% adherence</span>}
    </div>
  )
}
