import { isAfter } from 'date-fns'
import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { CardContent } from '@/components/ui/card'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { cn } from '@/lib/utils'

import { UnifiedPlan } from '../types'

interface PlanCarouselCardProps {
  plan: UnifiedPlan
  onClick: (plan: UnifiedPlan) => void
  imageUrl: string | null
  showProgress?: boolean
  isExpanded?: boolean
  layoutId?: string
}

export function PlanCarouselCard({
  plan,
  onClick,
  imageUrl,
  isExpanded = false,
  showProgress = true,
  layoutId,
}: PlanCarouselCardProps) {
  if (!plan) return null

  const isPremiumPlan = 'premium' in plan && plan.premium
  const hasStartDate = 'startDate' in plan && plan.startDate
  const hasProgress =
    showProgress &&
    hasStartDate &&
    plan.completedWorkoutsDays != null &&
    plan.totalWorkouts > 0
  const progressPercentage = hasProgress
    ? (plan.completedWorkoutsDays / plan.totalWorkouts) * 100
    : 0

  // Badge when it's custom plan for me created by trainer (not from public library)
  // New - badge when it's new plan (last 3 days) and not completed
  // Personalized plan: created by another person specifically for me (not from public library)
  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const isPublicPlan =
    'sourceTrainingPlanId' in plan && plan.sourceTrainingPlanId

  const isNewPlan =
    'createdAt' in plan &&
    plan.createdAt &&
    isAfter(new Date(plan.createdAt), threeDaysAgo)

  const cardContent = (
    <CardContent
      onClick={() => onClick(plan)}
      className={cn(
        'h-full flex flex-col justify-between bg-cover rounded-2xl relative',
        'shadow-lg shadow-neutral-400 dark:shadow-neutral-950 cursor-pointer hover:border-primary/50 transition-all group relative aspect-[4/5] w-full dark:border dark:border-border bg-sidebar py-4',
      )}
      style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}
    >
      <div className="absolute rounded-2xl inset-[-0.5px] bg-gradient-to-t from-black to-black/5 dark:to-black/10" />

      <div className="flex justify-end">
        {hasProgress && (
          <div className="dark top-2 right-2 absolute flex items-center shrink-0 bg-background/80 backdrop-blur-sm rounded-full p-1 transition-all">
            <ProgressCircle
              progress={progressPercentage}
              size={34}
              strokeWidth={plan.createdAt ? 2 : 3}
              showValue={true}
            />
          </div>
        )}
      </div>
      <div className="space-y-2 space-x-2 relative dark">
        {isPremiumPlan && (
          <Badge
            variant="premium"
            className="w-fit"
            size={isExpanded ? 'xs' : 'md'}
          >
            Premium
          </Badge>
        )}
        {!isPublicPlan && (
          <Badge
            variant="primary"
            className="w-fit"
            size={isExpanded ? 'xs' : 'md'}
          >
            Personal
          </Badge>
        )}
        {isNewPlan && (
          <Badge
            variant="success"
            className="w-fit"
            size={isExpanded ? 'xs' : 'md'}
          >
            New
          </Badge>
        )}
        <h3
          className={cn(
            'font-medium',
            imageUrl ? 'text-white' : 'text-foreground',
            isExpanded ? 'text-sm' : 'text-base',
          )}
        >
          {plan.title}
        </h3>
      </div>
    </CardContent>
  )

  if (layoutId) {
    return (
      <motion.div
        key={plan?.id ? `${plan.id}-carousel-card` : `carousel-card`}
        layoutId={layoutId}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}
