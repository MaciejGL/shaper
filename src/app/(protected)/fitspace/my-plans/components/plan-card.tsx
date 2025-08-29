import { formatDate } from 'date-fns'
import { BicepsFlexed, CheckCircle, FileText, PauseIcon } from 'lucide-react'

import { RatingStars } from '@/components/rating-stars'
import { Badge } from '@/components/ui/badge'
import { Card, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  AvailablePlan,
  CompletedPlan,
  PlanStatus,
  UnifiedPlan,
  getPlanStatus,
} from '../types'

import { PlanAuthor } from './plan-author'

interface PlanCardProps {
  plan: UnifiedPlan
  isActive?: boolean
  onClick: (plan: UnifiedPlan) => void

  loading?: boolean
}

export function PlanCard({
  plan,
  isActive = false,
  onClick,

  loading = false,
}: PlanCardProps) {
  if (!plan) return null

  const status = getPlanStatus(plan, isActive)

  return (
    <Card
      className={cn('cursor-pointer p-4 border-none', loading && 'opacity-50')}
      onClick={() => onClick(plan)}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <CardTitle className="text-base font-medium line-clamp-2">
              {plan.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <PlanStatusBadge status={status} plan={plan} />
            {plan.difficulty && (
              <Badge variant="outline" className="capitalize">
                {plan.difficulty.toLowerCase()}
              </Badge>
            )}
          </div>
          {!isActive && (
            <div className="flex items-center justify-between">
              {'createdBy' in plan && (
                <PlanAuthor size="md" createdBy={plan.createdBy} />
              )}
              <PlanRating plan={plan} />
            </div>
          )}
        </div>
      </div>
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
