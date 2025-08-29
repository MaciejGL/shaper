import { formatDate } from 'date-fns'
import {
  BicepsFlexed,
  Calendar,
  CheckCircle,
  FileText,
  Loader,
  MoreHorizontalIcon,
  PauseIcon,
} from 'lucide-react'

import { RatingStars } from '@/components/rating-stars'
import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

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
}

export function PlanCard({ plan, isActive = false, onClick }: PlanCardProps) {
  if (!plan) return null

  const status = getPlanStatus(plan, isActive)

  return (
    <Card borderless onClick={() => onClick(plan)}>
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-base font-medium line-clamp-2">
                {plan.title}
              </CardTitle>
              <MoreHorizontalIcon />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <PlanStatusBadge status={status} plan={plan} />
              {plan.difficulty && (
                <Badge variant="outline" className="capitalize">
                  {plan.difficulty.toLowerCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      {isActive ? (
        <CardContent className="space-y-2">
          {'focusTags' in plan && plan.focusTags.length > 0 && (
            <div>
              <p className="text-sm font-medium">Training Method</p>
              <div className="flex items-center gap-2">
                {plan.focusTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="capitalize">
                    {tag.split('_').join(' ').toLowerCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {'targetGoals' in plan && plan.targetGoals.length > 0 && (
            <div>
              <p className="text-sm font-medium">You'll Achieve</p>
              <div className="flex items-center gap-2">
                {plan.targetGoals.map((goal) => (
                  <Badge key={goal} variant="outline" className="capitalize">
                    {goal.split('_').join(' ').toLowerCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium">Progress</p>
              <p className="text-sm font-medium">
                {Math.round(
                  (plan.completedWorkoutsDays / plan.totalWorkouts) * 100,
                )}
                %
              </p>
            </div>
            <Progress
              value={(plan.completedWorkoutsDays / plan.totalWorkouts) * 100}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 empty:hidden">
            <StatsItem
              label="Current Week"
              value={
                <p className="text-sm font-medium">
                  {plan.currentWeekNumber} of {plan.weekCount}
                </p>
              }
              icon={<Loader className="text-muted-foreground" />}
            />
            {plan.startDate && plan.endDate && (
              <StatsItem
                label="Start Date"
                value={
                  <p className="text-sm font-medium">
                    {formatDate(new Date(plan.startDate), 'MMM d')} -{' '}
                    {formatDate(new Date(plan.endDate), 'MMM d')}{' '}
                  </p>
                }
                icon={<Calendar className="text-muted-foreground" />}
              />
            )}
          </div>
        </CardContent>
      ) : (
        <CardContent>
          {'focusTags' in plan && plan.focusTags.length > 0 && (
            <div>
              <p className="text-sm font-medium">Training Method</p>
              <div className="flex items-center gap-2">
                {plan.focusTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="capitalize">
                    {tag.split('_').join(' ').toLowerCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {'targetGoals' in plan && plan.targetGoals.length > 0 && (
            <div>
              <p className="text-sm font-medium">You'll Achieve</p>
              <div className="flex items-center gap-2">
                {plan.targetGoals.map((goal) => (
                  <Badge key={goal} variant="outline" className="capitalize">
                    {goal.split('_').join(' ').toLowerCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <StatsItem label="Weeks" value={plan.weekCount} />
            <StatsItem label="Total workouts" value={plan.totalWorkouts} />
            <StatsItem
              label="Workouts per week"
              value={Math.round(plan.totalWorkouts / plan.weekCount)}
            />
          </div>
        </CardContent>
      )}
      {!isActive && (
        <CardFooter className="flex items-center justify-between border-t [.border-t]:pt-4">
          {'createdBy' in plan && (
            <PlanAuthor size="md" createdBy={plan.createdBy} />
          )}
          <PlanRating plan={plan} />
        </CardFooter>
      )}
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
          icon: <BicepsFlexed />,
          label: 'Active',
        }
      case PlanStatus.Paused:
        return {
          variant: 'warning' as const,
          icon: <PauseIcon />,
          label: `Paused ${formatDate(new Date((plan as AvailablePlan).updatedAt), 'MMM d')}`,
        }
      case PlanStatus.Completed:
        return {
          variant: 'secondary' as const,
          icon: <CheckCircle />,
          label: `Completed ${formatDate(new Date((plan as CompletedPlan).completedAt!), 'MMM d')}`,
        }
      case PlanStatus.Template:
        return {
          variant: 'outline' as const,
          icon: <FileText />,
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
