import { ChevronRight, Crown, User } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { cn } from '@/lib/utils'

import { PlanStatus, UnifiedPlan } from '../types'

interface PlanCardProps {
  plan: UnifiedPlan
  onClick: (plan: UnifiedPlan) => void
  status: PlanStatus
  imageUrl?: string | null
}

export function PlanCard({ plan, onClick, status, imageUrl }: PlanCardProps) {
  if (!plan) return null

  const isPremiumPlan = 'premium' in plan && plan.premium

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
      className="dark cursor-pointer border-none transition-all overflow-hidden group relative bg-card gap-2 -mb-6 pb-14"
      // variant={status === PlanStatus.Active ? 'premium' : 'tertiary'}
    >
      {imageUrl && (
        <div className="absolute inset-0 transition-opacity">
          <Image
            src={imageUrl}
            alt={plan.title}
            fill
            className="object-cover"
            quality={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
        </div>
      )}
      <CardContent
        className={cn(
          'relative flex gap-2 justify-between aspect-12/6',
          status !== PlanStatus.Active && 'items-center',
        )}
      >
        <div className="self-end space-y-2 w-full">
          <div className="flex items-end gap-2 empty:hidden mt-2">
            {status === PlanStatus.Active && (
              <Badge variant="primary" className="w-fit" size="lg">
                Active
              </Badge>
            )}
            {isPremiumPlan && (
              <Badge variant="premium" className="w-fit" size="lg">
                <Crown className="size-3" />
                Premium
              </Badge>
            )}
            {trainerName && status === PlanStatus.Template && (
              <Badge variant="success" className="w-fit" size="lg">
                <User className="size-3" />
                by {trainerName}
              </Badge>
            )}
          </div>
          <CardTitle className="text-foreground text-2xl grid grid-cols-[1fr_auto] items-end gap-4">
            <p>{plan.title}</p>
            <Button
              variant="default"
              size="icon-xl"
              className="rounded-full"
              iconOnly={<ChevronRight className="size-6!" />}
            />
          </CardTitle>
        </div>
        {hasProgress && (
          <div className="flex self-start items-center shrink-0 bg-background/90 rounded-full p-1 absolute right-4 top-0">
            <ProgressCircle
              progress={progressPercentage}
              size={status === PlanStatus.Active ? 60 : 32}
              strokeWidth={status === PlanStatus.Active ? 4 : 3}
              showValue={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
