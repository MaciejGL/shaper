import { ArrowRightIcon, Trash } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { CollapsibleText } from '@/components/collapsible-text'
import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { RatingStars } from '@/components/rating-stars'
import { StatsItem } from '@/components/stats-item'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '@/components/ui/drawer'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'

import { PlanAction, PlanStatus, UnifiedPlan, getPlanStatus } from '../types'

import { CompletionStats } from './completion-stats'
import { PlanAuthor } from './plan-author'
import { PlanPreviewTab } from './plan-preview-tab'
import { PlanSummaryTab } from './plan-summary-tab'
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
  const { hasPremium } = useUser()

  const status = plan ? getPlanStatus(plan, isActive) : PlanStatus.Template
  const isTemplate = status === PlanStatus.Template
  const isCompleted = status === PlanStatus.Completed
  const [activeTab, setActiveTab] = useState(isTemplate ? 'info' : 'summary')
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Reset to summary tab when drawer opens with a completed plan
  useEffect(() => {
    if (open) {
      setActiveTab(isTemplate ? 'info' : 'summary')
    }
  }, [open, isTemplate])

  if (!plan) return null
  const isPaused = status === PlanStatus.Paused
  const isButtonLoading = isLoading || false
  const hasWeeks = 'weeks' in plan && plan.weeks && plan.weeks.length > 0
  const isPremiumPlan = 'premium' in plan && plan.premium
  const canActivate = !isPremiumPlan || hasPremium

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
              <div className="w-full space-y-2">
                <h3 className="text-lg font-medium">{plan.title}</h3>
                <div className="flex items-center gap-2 w-full justify-between">
                  {/* Plan Status and Basic Info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <PlanStatusBadge status={status} />
                    {plan.difficulty && (
                      <Badge variant="outline" className="capitalize">
                        {plan.difficulty.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                  {plan.startDate && plan.endDate && plan.active && (
                    <ButtonLink
                      href={`/fitspace/workout`}
                      iconEnd={<ArrowRightIcon />}
                      size="sm"
                    >
                      Go to Plan
                    </ButtonLink>
                  )}
                </div>
              </div>
              {/* Go to Plan button in header */}
            </div>
          </DrawerHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-2" ref={scrollContainerRef}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {isTemplate ? (
                <PrimaryTabList
                  options={[
                    { label: 'Info', value: 'info' },
                    { label: 'Preview', value: 'preview' },
                  ]}
                  onClick={setActiveTab}
                  active={activeTab}
                  size="lg"
                  className="grid grid-cols-2"
                  classNameButton="text-sm px-3"
                />
              ) : (
                <PrimaryTabList
                  options={[
                    { label: 'Summary', value: 'summary' },
                    { label: 'Info', value: 'info' },
                    { label: 'Preview', value: 'preview' },
                  ]}
                  onClick={setActiveTab}
                  active={activeTab}
                  size="lg"
                  className="grid grid-cols-3"
                  classNameButton="text-sm px-3"
                />
              )}

              {!isTemplate && (
                <TabsContent value="summary" className="px-2 py-4">
                  <PlanSummaryTab planId={plan.id} />
                </TabsContent>
              )}

              <TabsContent value="info" className="space-y-6 p-4">
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

              <TabsContent value="preview" className="p-4">
                <PlanPreviewTab
                  weeks={'weeks' in plan ? plan.weeks : null}
                  isTemplate={status === PlanStatus.Template}
                  selectedWeekId={selectedWeekId}
                  onAccordionChange={() => setSelectedWeekId(null)}
                  canViewDays={canActivate}
                  scrollRef={scrollContainerRef}
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
                    {(isActive || isPaused) && (
                      <Button
                        onClick={() => onAction('close', plan)}
                        variant="default"
                        disabled={isButtonLoading}
                      >
                        Complete
                      </Button>
                    )}
                    {!isActive && (
                      <PremiumButtonWrapper
                        hasPremium={canActivate}
                        tooltipText="Premium subscription required to activate this plan"
                      >
                        <Button
                          onClick={() => onAction('activate', plan)}
                          variant="default"
                          disabled={isButtonLoading || !canActivate}
                        >
                          {isPaused ? 'Resume' : 'Activate'}
                        </Button>
                      </PremiumButtonWrapper>
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

function PlanStatusBadge({ status }: { status: PlanStatus }) {
  const getStatusConfig = (
    status: PlanStatus,
  ): {
    variant: BadgeProps['variant']
    label: string
  } => {
    switch (status) {
      case PlanStatus.Active:
        return {
          variant: 'primary',
          label: 'Active',
        }
      case PlanStatus.Paused:
        return {
          variant: 'warning',
          label: `Paused`,
        }
      case PlanStatus.Completed:
        return {
          variant: 'success',
          label: `Completed`,
        }
      case PlanStatus.Template:
        return {
          variant: 'secondary',
          label: 'Template',
        }
    }
  }

  const config = getStatusConfig(status)

  return <Badge variant={config.variant}>{config.label}</Badge>
}
