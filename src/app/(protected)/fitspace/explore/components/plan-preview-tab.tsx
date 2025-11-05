import { useEffect, useRef, useState } from 'react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useUser } from '@/context/user-context'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLGetPublicTrainingPlanWeeksQuery } from '@/generated/graphql-client'
import { getDayName } from '@/lib/date-utils'
import { sortDaysForDisplay } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { PlanPreviewExerciseRow } from '../../my-plans/components/plan-preview-exercise-row'

type PlanWeeks = NonNullable<
  GQLGetPublicTrainingPlanWeeksQuery['getTrainingPlanById']['weeks']
>

interface PlanPreviewTabProps {
  weeks?: PlanWeeks | null
  selectedWeekId?: string | null
  onAccordionChange?: () => void
  isPremiumPlan: boolean
}

export function PlanPreviewTab({
  weeks,
  selectedWeekId = null,
  onAccordionChange,
  isPremiumPlan = false,
}: PlanPreviewTabProps) {
  const { preferences } = useUserPreferences()
  const { hasPremium } = useUser()
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

  // User has limited access if they don't have premium and the plan requires premium
  const hasLimitedAccess = !hasPremium && isPremiumPlan

  return (
    <Accordion
      type="multiple"
      className="w-full"
      data-vaul-no-drag
      value={accordionValue}
      onValueChange={setAccordionValue}
    >
      {sortedWeeks.map((week, index) => {
        // Sort days according to user's week start preference
        const sortedDays = sortDaysForDisplay(
          week.days,
          preferences.weekStartsOn,
        )

        // Block access to weeks beyond the first one for premium plans without premium access
        const isWeekLocked = index > 0 && hasLimitedAccess

        return (
          <AccordionItem
            key={week.id}
            value={`week-${week.id}`}
            ref={(el) => {
              weekRefs.current[week.id] = el
            }}
          >
            <PremiumButtonWrapper
              hasPremium={!isWeekLocked}
              tooltipText="Upgrade to Premium to access all weeks"
            >
              <AccordionTrigger
                className="text-base font-semibold hover:no-underline"
                disabled={isWeekLocked}
              >
                <div className="flex items-center gap-2">
                  Week {week.weekNumber}
                </div>
              </AccordionTrigger>
            </PremiumButtonWrapper>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                {!isWeekLocked &&
                  sortedDays.map((day) => (
                    <ExplorePreviewDay key={day.id} day={day} />
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

// Simplified day component for explore (no progress tracking)
type ExploreDay = PlanWeeks[number]['days'][number]

interface ExplorePreviewDayProps {
  day: ExploreDay
}

function ExplorePreviewDay({ day }: ExplorePreviewDayProps) {
  const dayName = getDayName(day.dayOfWeek)
  const exercises = day.exercises || []

  return (
    <div className="mb-8">
      <h4
        className={cn(
          'text-base font-medium mb-2 bg-card-on-card p-4 rounded-md',
          day.isRestDay ? 'text-muted-foreground' : '',
        )}
      >
        {dayName}
        {day.isRestDay && <span className="ml-2 text-xs">• Rest Day</span>}
      </h4>

      {!day.isRestDay && exercises.length > 0 && (
        <div className="pl-0 space-y-2">
          {exercises.map((exercise, index) => (
            <PlanPreviewExerciseRow
              key={exercise.id}
              exercise={exercise}
              isTemplate={true}
            />
          ))}
        </div>
      )}

      {!day.isRestDay && exercises.length === 0 && (
        <p className="text-xs text-muted-foreground pl-4">
          No exercises assigned
        </p>
      )}
    </div>
  )
}
