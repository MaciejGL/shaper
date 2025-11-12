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
}

export function PlanPreviewDay({
  day,
  isTemplate = false,
}: PlanPreviewDayProps) {
  const dayName = getDayName(day.dayOfWeek)
  const exercises = day.exercises || []
  const totalExercises = exercises.length
  const completedExercises = exercises.filter(
    (exercise) => exercise.completedAt,
  ).length

  return (
    <div className="mb-8">
      <h4
        className={cn(
          'text-base font-medium mb-2 bg-card-on-card p-4 rounded-xl flex items-center justify-between',
          day.isRestDay ? 'text-muted-foreground' : '',
        )}
      >
        <div>
          {dayName}
          {day.isRestDay && <span className="ml-2 text-xs">• Rest Day</span>}
        </div>
        {totalExercises > 0 && (
          <div className="ml-auto text-xs">
            {completedExercises} / {totalExercises} completed
          </div>
        )}
      </h4>

      {day.isRestDay && (
        <div className="pl-0 space-y-2">
          <PlanPreviewExerciseRow isRestDay />
        </div>
      )}
      {!day.isRestDay && exercises.length > 0 && (
        <div className="pl-0 space-y-2">
          {exercises.map((exercise) => (
            <PlanPreviewExerciseRow
              key={exercise.id}
              exercise={exercise}
              isTemplate={isTemplate}
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
