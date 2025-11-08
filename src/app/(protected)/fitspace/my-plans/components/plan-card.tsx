import { differenceInDays, formatDate } from 'date-fns'
import _ from 'lodash'
import {
  BicepsFlexed,
  Check,
  CheckCircle,
  ChevronRight,
  FileIcon,
  FileText,
  PauseIcon,
  PlayIcon,
} from 'lucide-react'

import { Badge, BadgeProps } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

import {
  AvailablePlan,
  CompletedPlan,
  PlanStatus,
  UnifiedPlan,
  getPlanStatus,
} from '../types'

interface PlanCardProps {
  plan: UnifiedPlan
  onClick: (plan: UnifiedPlan) => void
  status: PlanStatus
}

export function PlanCard({ plan, onClick, status }: PlanCardProps) {
  if (!plan) return null

  const isNew =
    status === PlanStatus.Template &&
    plan.createdAt &&
    differenceInDays(new Date(), new Date(plan.createdAt)) < 3

  return (
    <Card
      onClick={() => onClick(plan)}
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      variant="secondary"
    >
      <CardHeader className="py-0 gap-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <CardTitle className="text-base font-normal line-clamp-2">
              {plan.title}
            </CardTitle>
            {status === PlanStatus.Active && (
              <PlanStatusBadge status={status} plan={plan} />
            )}
            {isNew && (
              <Badge variant="success" className="w-fit" size="xs">
                New
              </Badge>
            )}
          </div>
          <ChevronRight className="size-4 text-muted-foreground/70 flex-shrink-0" />
        </div>
      </CardHeader>
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
  const getStatusConfig = (
    status: PlanStatus,
  ): {
    variant: BadgeProps['variant']
    label: string
    icon?: React.ReactNode
  } => {
    switch (status) {
      case PlanStatus.Active:
        return {
          variant: 'primary' as const,
          // icon: <PlayIcon className="size-3" />,
          label: 'Active',
        }
      case PlanStatus.Paused:
        return {
          variant: 'warning' as const,
          icon: <PauseIcon className="size-3" />,
          label: `Paused ${formatDate(new Date((plan as AvailablePlan).updatedAt), 'd. MMM yyyy')}`,
        }
      case PlanStatus.Completed:
        return {
          variant: 'success',
          icon: <Check className="size-3" />,
          label: `Completed ${formatDate(new Date((plan as CompletedPlan).completedAt!), 'd. MMM yyyy')}`,
        }
      case PlanStatus.Template:
        return {
          variant: 'secondary' as const,
          icon: <FileIcon className="size-3" />,
          label: 'Template',
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className="w-fit" size="xs">
      {config.icon}
      {config.label}
    </Badge>
  )
}
