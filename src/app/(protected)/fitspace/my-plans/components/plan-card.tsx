import { Crown, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { cn } from '@/lib/utils'

import { PlanStatus, UnifiedPlan } from '../types'

interface PlanCardProps {
  plan: UnifiedPlan
  onClick: (plan: UnifiedPlan) => void
  status: PlanStatus
}

export function PlanCard({ plan, onClick, status }: PlanCardProps) {
  if (!plan) return null

  const isPremiumPlan = 'premium' in plan && plan.premium
  const heroImageUrl = 'heroImageUrl' in plan ? plan.heroImageUrl : null

  const trainerInfo = 'createdBy' in plan ? plan.createdBy : null
  const trainerName = trainerInfo
    ? `${trainerInfo.firstName} ${trainerInfo.lastName}`.trim()
    : null

  const hasStartDate = 'startDate' in plan && plan.startDate
  const hasProgress =
    hasStartDate && plan.completedWorkoutsDays != null && plan.totalWorkouts > 0
  const progressPercentage = hasProgress
    ? (plan.completedWorkoutsDays / plan.totalWorkouts) * 100
    : 0

  return (
    <Card
      onClick={() => onClick(plan)}
      className="cursor-pointer hover:border-primary/50 transition-all overflow-hidden group relative bg-card gap-2"
      variant={status === PlanStatus.Active ? 'premium' : 'tertiary'}
    >
      {heroImageUrl && (
        <div className="absolute inset-0 opacity-100 group-hover:opacity-30 transition-opacity">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        </div>
      )}
      <CardContent
        className={cn(
          'relative flex gap-2 justify-between items-end',
          status !== PlanStatus.Active && 'items-center',
        )}
      >
        <div>
          <CardTitle className="text-foreground text-lg">
            {plan.title}
          </CardTitle>
          <div className="flex items-end gap-2 empty:hidden mt-2">
            {status === PlanStatus.Active && (
              <Badge variant="primary" className="w-fit" size="md">
                Active
              </Badge>
            )}
            {isPremiumPlan && (
              <Badge variant="premium" className="w-fit" size="md">
                <Crown className="size-3" />
                Premium
              </Badge>
            )}
            {trainerName && status === PlanStatus.Template && (
              <Badge variant="success" className="w-fit" size="md">
                <User className="size-3" />
                by {trainerName}
              </Badge>
            )}
          </div>
        </div>
        {hasProgress && (
          <div className="flex items-center shrink-0 bg-background/70 rounded-full p-1">
            <ProgressCircle
              progress={progressPercentage}
              size={status === PlanStatus.Active ? 48 : 32}
              strokeWidth={status === PlanStatus.Active ? 4 : 3}
              showValue={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
