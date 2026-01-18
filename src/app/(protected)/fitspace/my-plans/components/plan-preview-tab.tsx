import { RefObject, useEffect, useState } from 'react'

import { Accordion } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLFitspaceMyPlansQuery } from '@/generated/graphql-client'
import { sortDaysForDisplay } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { PlanPreviewDay } from './plan-preview-day'
import { WeekProgressCircle } from './week-progress-circle'

type PlanWeeks = NonNullable<
  NonNullable<
    GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']['activePlan']
  >['weeks']
>

interface PlanPreviewTabProps {
  weeks?: PlanWeeks | null
  isTemplate?: boolean
  selectedWeekId?: string | null
  onAccordionChange?: () => void
  canViewDays?: boolean
  scrollRef?: RefObject<HTMLDivElement | null>
}

export function PlanPreviewTab({
  weeks,
  isTemplate = false,
  selectedWeekId = null,
  onAccordionChange,
  canViewDays = false,
}: PlanPreviewTabProps) {
  const { preferences } = useUserPreferences()
  // Sort weeks by weekNumber
  const sortedWeeks = [...(weeks || [])].sort(
    (a, b) => a.weekNumber - b.weekNumber,
  )

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (selectedWeekId) return selectedWeekId
    if (sortedWeeks.length > 0) return sortedWeeks[0].id
    return ''
  })

  // When selectedWeekId changes from external source, update active tab
  useEffect(() => {
    if (selectedWeekId) {
      setActiveTab(selectedWeekId)
      if (onAccordionChange) {
        onAccordionChange()
      }
    }
  }, [selectedWeekId, onAccordionChange])

  // Ensure we have an active tab if data loads later
  useEffect(() => {
    if (!activeTab && sortedWeeks.length > 0) {
      setActiveTab(sortedWeeks[0].id)
    }
  }, [activeTab, sortedWeeks])

  if (!weeks || weeks.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No workout schedule available for this plan.
        </p>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="w-full overflow-x-auto hide-scrollbar pb-2">
        <TabsList className="w-full justify-start h-auto bg-transparent gap-2 p-0">
          {sortedWeeks.map((week) => {
            // Calculate progress for the week
            const totalExercises = week.days.reduce(
              (sum, day) => sum + (day.exercises?.length || 0),
              0,
            )
            const completedExercises = week.days.reduce(
              (sum, day) =>
                sum +
                (day.exercises?.filter((ex) => !!ex.completedAt).length || 0),
              0,
            )
            const progress =
              totalExercises > 0
                ? (completedExercises / totalExercises) * 100
                : 0

            return (
              <TabsTrigger
                key={week.id}
                value={week.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-full px-4 py-2 h-auto border border-border bg-card/50 min-w-max"
              >
                <div className="flex items-center gap-2">
                  <span>Week {week.weekNumber}</span>
                  {!isTemplate && totalExercises > 0 && (
                    <WeekProgressCircle
                      progress={progress}
                      size={16}
                      strokeWidth={2}
                      className={cn(
                        'm-0',
                        activeTab === week.id
                          ? 'text-primary-foreground'
                          : 'text-primary',
                      )}
                    />
                  )}
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>

      {sortedWeeks.map((week) => {
        // Sort days according to user's week start preference
        const sortedDays = sortDaysForDisplay(
          week.days,
          preferences.weekStartsOn,
        )

        return (
          <TabsContent
            key={week.id}
            value={week.id}
            className="mt-2 outline-none"
          >
            <Accordion type="multiple" className="space-y-2">
              {sortedDays.map((day) => (
                <PlanPreviewDay
                  key={day.id}
                  day={day}
                  isTemplate={isTemplate}
                  canViewDays={canViewDays}
                />
              ))}
            </Accordion>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
