import { formatDate } from 'date-fns'
import {
  BicepsFlexed,
  CheckCircle,
  ChevronRight,
  FileText,
  PauseIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
  isActive?: boolean
  onClick: (plan: UnifiedPlan) => void
}

export function PlanCard({ plan, isActive = false, onClick }: PlanCardProps) {
  if (!plan) return null

  const status = getPlanStatus(plan, isActive)

  return (
    <Card
      borderless
      onClick={() => onClick(plan)}
      className="cursor-pointer hover:bg-accent/50 transition-colors"
    >
      <CardHeader className="py-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <CardTitle className="text-base font-medium line-clamp-2">
              {plan.title}
            </CardTitle>
            <PlanStatusBadge status={status} plan={plan} />
          </div>
          <ChevronRight className="size-5 text-muted-foreground flex-shrink-0" />
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
  const getStatusConfig = (status: PlanStatus) => {
    switch (status) {
      case PlanStatus.Active:
        return {
          variant: 'primary' as const,
          // icon: <BicepsFlexed className="size-3" />,
          label: 'Active',
        }
      case PlanStatus.Paused:
        return {
          variant: 'warning' as const,
          // icon: <PauseIcon className="size-3" />,
          label: `Paused ${formatDate(new Date((plan as AvailablePlan).updatedAt), 'MMM d')}`,
        }
      case PlanStatus.Completed:
        return {
          variant: 'secondary' as const,
          // icon: <CheckCircle className="size-3" />,
          label: `Completed ${formatDate(new Date((plan as CompletedPlan).completedAt!), 'MMM d')}`,
        }
      case PlanStatus.Template:
        return {
          variant: 'secondary' as const,
          // icon: <FileText className="size-3" />,
          label: 'Template',
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className="w-fit">
      {/* {config.icon} */}
      <span className="ml-1">{config.label}</span>
    </Badge>
  )
}
