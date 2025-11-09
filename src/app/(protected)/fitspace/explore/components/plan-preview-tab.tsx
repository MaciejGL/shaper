import { Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/context/user-context'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLGetPublicTrainingPlanWeeksQuery } from '@/generated/graphql-client'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { getDayName, sortDaysForDisplay } from '@/lib/date-utils'
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
  const { user } = useUser()
  const { data: subscriptionData } = useCurrentSubscription(user?.id)
  const hasPremium = subscriptionData?.hasPremiumAccess || false
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
      {sortedWeeks.map((week) => {
        // Sort days according to user's week start preference
        const sortedDays = sortDaysForDisplay(
          week.days,
          preferences.weekStartsOn,
        )

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
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                {sortedDays.map((day) => (
                  <ExplorePreviewDay
                    key={day.id}
                    day={day}
                    showExercises={!hasLimitedAccess}
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

// Simplified day component for explore (no progress tracking)
type ExploreDay = PlanWeeks[number]['days'][number]

interface ExplorePreviewDayProps {
  day: ExploreDay
  showExercises: boolean
}

function ExplorePreviewDay({ day, showExercises }: ExplorePreviewDayProps) {
  const dayName = getDayName(day.dayOfWeek)
  const exercises = day.exercises || []

  return (
    <div className="mb-8">
      <h4
        className={cn(
          'text-base font-medium mb-2 bg-card-on-card p-4 rounded-xl flex items-center justify-between',
          day.isRestDay ? 'text-muted-foreground' : '',
        )}
      >
        <span>
          {dayName}
          {day.isRestDay && <span className="ml-2 text-xs">• Rest Day</span>}
          {!day.isRestDay && day.workoutType && (
            <span className="ml-2 text-xs text-muted-foreground">
              • {day.workoutType}
            </span>
          )}
        </span>
        {!showExercises && !day.isRestDay && (
          <Badge variant="secondary" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
      </h4>

      {!day.isRestDay && showExercises && exercises.length > 0 && (
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

      {!day.isRestDay && !showExercises && (
        <div className="pl-4 py-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <p>Exercise details are available with Premium</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {exercises.length} exercises included in this workout
          </p>
        </div>
      )}

      {!day.isRestDay && showExercises && exercises.length === 0 && (
        <p className="text-xs text-muted-foreground pl-4">
          No exercises assigned
        </p>
      )}
    </div>
  )
}
