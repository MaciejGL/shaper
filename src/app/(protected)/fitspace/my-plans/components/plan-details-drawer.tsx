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
import { useState } from 'react'

import { CollapsibleText } from '@/components/collapsible-text'
import { RatingStars } from '@/components/rating-stars'
import { StatsItem } from '@/components/stats-item'
import { Badge, BadgeProps } from '@/components/ui/badge'
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
import { WeekProgressCircle } from './week-progress-circle'

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
  const [activeTab, setActiveTab] = useState('info')
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)

  if (!plan) return null

  const status = getPlanStatus(plan, isActive)
  const isCompleted = status === PlanStatus.Completed
  const isPaused = status === PlanStatus.Paused
  const isButtonLoading = isLoading || false
  const hasWeeks = 'weeks' in plan && plan.weeks && plan.weeks.length > 0

  const handleWeekClick = (weekId: string) => {
    setSelectedWeekId(weekId)
    setActiveTab('preview')
  }

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
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full shadow-md">
                <TabsTrigger value="info" className="flex-1">
                  Info
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                <div className="space-y-4">
                  {/* Progress Overview */}
                  {plan.completedWorkoutsDays > 0 || plan.adherence ? (
                    <CompletionStats
                      completedWorkoutsDays={plan.completedWorkoutsDays}
                      totalWorkouts={plan.totalWorkouts}
                    />
                  ) : null}

                  {/* Weekly Progress Overview */}
                  {hasWeeks && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {plan.weeks
                          .slice()
                          .sort((a, b) => a.weekNumber - b.weekNumber)
                          .map((week) => {
                            const totalExercises = week.days.reduce(
                              (sum, day) => sum + (day.exercises?.length || 0),
                              0,
                            )
                            const completedExercises = week.days.reduce(
                              (sum, day) =>
                                sum +
                                (day.exercises?.filter((ex) => !!ex.completedAt)
                                  .length || 0),
                              0,
                            )
                            const progress =
                              totalExercises > 0
                                ? (completedExercises / totalExercises) * 100
                                : 0

                            return (
                              <button
                                key={week.id}
                                onClick={() => handleWeekClick(week.id)}
                                className="text-left hover:bg-accent/50 transition-colors rounded-lg"
                              >
                                <StatsItem
                                  variant="outline"
                                  label={`Week ${week.weekNumber}`}
                                  classNameLabel="font-semibold h-"
                                  value={
                                    <WeekProgressCircle
                                      progress={progress}
                                      size={28}
                                    />
                                  }
                                />
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  )}
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

              <TabsContent value="preview">
                <PlanPreviewTab
                  weeks={'weeks' in plan ? plan.weeks : null}
                  isTemplate={status === PlanStatus.Template}
                  selectedWeekId={selectedWeekId}
                  onAccordionChange={() => setSelectedWeekId(null)}
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
                        variant="tertiary"
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
  const getStatusConfig = (
    status: PlanStatus,
  ): {
    variant: BadgeProps['variant']
    icon: React.ReactNode
    label: string
  } => {
    switch (status) {
      case PlanStatus.Active:
        return {
          variant: 'primary',
          icon: <BicepsFlexed className="h-3 w-3" />,
          label: 'Active',
        }
      case PlanStatus.Paused:
        return {
          variant: 'warning',
          icon: <Calendar className="h-3 w-3" />,
          label: `Paused ${formatDate(new Date((plan as AvailablePlan).updatedAt), 'MMM d, yyyy')}`,
        }
      case PlanStatus.Completed:
        return {
          variant: 'success',
          icon: <CheckCircle className="h-3 w-3" />,
          label: `Completed ${formatDate(new Date((plan as CompletedPlan).completedAt!), 'MMM d, yyyy')}`,
        }
      case PlanStatus.Template:
        return {
          variant: 'secondary',
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
