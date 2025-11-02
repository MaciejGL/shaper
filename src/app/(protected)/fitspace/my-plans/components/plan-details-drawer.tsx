import { formatDate } from 'date-fns'
import {
  ArrowRightIcon,
  BicepsFlexed,
  Calendar,
  CheckCircle,
  Loader,
  Trash,
  Users,
} from 'lucide-react'

import { CollapsibleText } from '@/components/collapsible-text'
import { RatingStars } from '@/components/rating-stars'
import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
import { PlanPreviewTab } from './plan-preview-tab'

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
      <DrawerContent dialogTitle={plan.title}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <DrawerHeader className="border-b flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-medium">{plan.title}</h3>
                {/* Plan Status and Basic Info */}
                <div className="flex items-center gap-2 flex-wrap">
                  <PlanStatusBadge status={status} plan={plan} />
                  {plan.difficulty && (
                    <Badge variant="secondary" className="capitalize">
                      {plan.difficulty.toLowerCase()}
                    </Badge>
                  )}
                </div>
              </div>
              {/* Go to Plan button in header */}
              {plan.startDate && plan.endDate && plan.active && (
                <ButtonLink
                  href={`/fitspace/workout/${plan.id}`}
                  iconEnd={<ArrowRightIcon />}
                >
                  Go to Plan
                </ButtonLink>
              )}
            </div>
          </DrawerHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">
                  Info
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6 mt-6">
                {plan.startDate && plan.endDate && (
                  <div className="space-y-2">
                    {/* Progress Overview */}
                    {plan.completedWorkoutsDays > 0 || plan.adherence ? (
                      <CompletionStats
                        completedWorkoutsDays={plan.completedWorkoutsDays}
                        totalWorkouts={plan.totalWorkouts}
                      />
                    ) : null}
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
                  </div>
                )}
                {/* Plan Statistics */}
                <div className="grid grid-cols-3 gap-2">
                  <StatsItem value={plan.weekCount} label="Weeks" />
                  <StatsItem
                    value={plan.totalWorkouts}
                    label="Total workouts"
                  />
                  <StatsItem
                    value={Math.round(plan.totalWorkouts / plan.weekCount)}
                    label="Days per week"
                  />
                </div>

                {'focusTags' in plan && plan.focusTags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Training Method</p>
                    <div className="flex items-center gap-2">
                      {plan.focusTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="capitalize"
                        >
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
                        <Badge
                          key={goal}
                          variant="secondary"
                          className="capitalize"
                        >
                          {goal.split('_').join(' ').toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating and Reviews */}
                {plan.rating && plan.totalReviews > 0 ? (
                  <div className="flex items-center gap-2">
                    <RatingStars rating={plan.rating} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {plan.rating.toFixed(1)} ({plan.totalReviews} reviews)
                    </span>
                  </div>
                ) : null}

                {/* Plan Description */}
                {plan.description && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Description</h3>
                    <CollapsibleText text={plan.description} maxWords={80} />
                  </div>
                )}

                {/* Plan Creator */}
                {'createdBy' in plan && plan.createdBy && (
                  <PlanAuthor createdBy={plan.createdBy} />
                )}
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <PlanPreviewTab
                  weeks={'weeks' in plan ? plan.weeks : null}
                  isTemplate={status === PlanStatus.Template}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <DrawerFooter className="border-t flex-shrink-0">
            <div className="flex items-center justify-between gap-2 w-full">
              <Button
                variant="destructive"
                disabled={isButtonLoading}
                onClick={() => onAction('delete', plan)}
                iconOnly={<Trash />}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                {!isCompleted && (
                  <>
                    {isActive && (
                      <Button
                        onClick={() => onAction('pause', plan)}
                        variant="secondary"
                        disabled={isButtonLoading}
                      >
                        Pause
                      </Button>
                    )}
                    {!isActive && (
                      <Button
                        onClick={() => onAction('activate', plan)}
                        variant="default"
                        disabled={isButtonLoading}
                      >
                        {isPaused ? 'Resume' : 'Activate'}
                      </Button>
                    )}
                    {(isActive || isPaused) && (
                      <Button
                        onClick={() => onAction('close', plan)}
                        variant="default"
                        disabled={isButtonLoading}
                      >
                        Complete
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
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
