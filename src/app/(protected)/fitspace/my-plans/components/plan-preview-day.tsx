import { getWorkoutTypeLabel } from '@/app/(protected)/trainer/trainings/creator/components/day-components'
import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { GQLFitspaceMyPlansQuery } from '@/generated/graphql-client'
import { getDayName } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { PlanPreviewExerciseRow } from './plan-preview-exercise-row'

type PlanDay = NonNullable<
  NonNullable<
    GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']['activePlan']
  >['weeks']
>[number]['days'][number]

interface PlanPreviewDayProps {
  day: PlanDay
  isTemplate?: boolean
  canViewDays?: boolean
}

export function PlanPreviewDay({
  day,
  isTemplate = false,
  canViewDays = false,
}: PlanPreviewDayProps) {
  const dayName = getDayName(day.dayOfWeek, { short: true })
  const exercises = day.exercises || []
  const totalExercises = exercises.length
  const completedExercises = exercises.filter(
    (exercise) => exercise.completedAt,
  ).length

  if (day.isRestDay || exercises.length === 0) {
    return (
      <div className="opacity-75">
        <div
          className={cn(
            'text-sm font-medium mb-2 bg-card-on-card p-4 rounded-xl flex items-center justify-between',
            day.isRestDay ? 'text-muted-foreground' : '',
          )}
        >
          <div className="flex items-center justify-between w-full pr-2">
            {dayName}
            {day.isRestDay && <span className="ml-2 text-xs">Rest Day</span>}
          </div>
        </div>

        {day.isRestDay && (
          <div className="pl-0 space-y-2">
            <PlanPreviewExerciseRow isRestDay />
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

  const workoutTypeLabel = getWorkoutTypeLabel(day.workoutType)

  return (
    <AccordionItem value={day.id} className="border-none">
      <PremiumButtonWrapper
        hasPremium={canViewDays}
        tooltipText="Premium required to view day details"
      >
        <AccordionTrigger
          variant="outline"
          disabled={!canViewDays}
          className={cn(
            'text-sm font-medium bg-card-on-card hover:bg-card-on-card/80',
            'mb-0',
          )}
        >
          <div className="flex items-center justify-between w-full pr-2">
            <span>
              {dayName} {workoutTypeLabel && `• ${workoutTypeLabel}`}
            </span>
            {totalExercises > 0 && !isTemplate && (
              <span
                className={cn(
                  'text-xs',
                  completedExercises === totalExercises
                    ? 'text-green-500'
                    : completedExercises > 0
                      ? 'text-amber-500'
                      : 'text-muted-foreground',
                )}
              >
                {completedExercises} / {totalExercises} completed
              </span>
            )}
            {isTemplate && totalExercises > 0 && (
              <span className="text-xs">{totalExercises} exercises</span>
            )}
          </div>
        </AccordionTrigger>
      </PremiumButtonWrapper>

      <AccordionContent className="border-none bg-transparent pt-4 pb-0">
        <div className="space-y-2">
          {exercises.map((exercise) => (
            <PlanPreviewExerciseRow
              key={exercise.id}
              exercise={exercise}
              isTemplate={isTemplate}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
