import { useEffect, useRef, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLFitspaceMyPlansQuery } from '@/generated/graphql-client'
import { sortDaysForDisplay } from '@/lib/date-utils'

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
}

export function PlanPreviewTab({
  weeks,
  isTemplate = false,
  selectedWeekId = null,
  onAccordionChange,
}: PlanPreviewTabProps) {
  const { preferences } = useUserPreferences()
  const weekRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [accordionValue, setAccordionValue] = useState<string[]>([])

  // When selectedWeekId changes from external source, update accordion
  useEffect(() => {
    if (selectedWeekId) {
      setAccordionValue([`week-${selectedWeekId}`])

      // Scroll to the selected week
      setTimeout(() => {
        weekRefs.current[selectedWeekId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 150) // Small delay to ensure accordion is open

      // Notify parent that we've handled the selection
      if (onAccordionChange) {
        onAccordionChange()
      }
    }
  }, [selectedWeekId, onAccordionChange])

  if (!weeks || weeks.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No workout schedule available for this plan.
        </p>
      </div>
    )
  }

  // Sort weeks by weekNumber
  const sortedWeeks = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber)

  return (
    <Accordion
      type="multiple"
      className="w-full"
      data-vaul-no-drag
      value={accordionValue}
      onValueChange={setAccordionValue}
    >
      {sortedWeeks.map((week) => {
        // Sort days according to user's week start preference
        const sortedDays = sortDaysForDisplay(
          week.days,
          preferences.weekStartsOn,
        )

        // Calculate progress for the week
        const totalExercises = week.days.reduce(
          (sum, day) => sum + (day.exercises?.length || 0),
          0,
        )
        const completedExercises = week.days.reduce(
          (sum, day) =>
            sum + (day.exercises?.filter((ex) => !!ex.completedAt).length || 0),
          0,
        )
        const progress =
          totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0

        return (
          <AccordionItem
            key={week.id}
            value={`week-${week.id}`}
            ref={(el) => {
              weekRefs.current[week.id] = el
            }}
          >
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                Week {week.weekNumber}
                {!isTemplate && totalExercises > 0 && (
                  <WeekProgressCircle
                    progress={progress}
                    size={20}
                    strokeWidth={1.5}
                  />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                {sortedDays.map((day) => (
                  <PlanPreviewDay
                    key={day.id}
                    day={day}
                    isTemplate={isTemplate}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
