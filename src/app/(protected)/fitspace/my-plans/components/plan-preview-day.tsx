import { useWeekStartPreference } from '@/context/user-preferences-context'

import { PlanPreviewExerciseRow } from './plan-preview-exercise-row'

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

// Adjust day names based on week start preference
function getDayName(dayOfWeek: number, weekStartsOn: 0 | 1): string {
  if (weekStartsOn === 1) {
    // If week starts on Monday, adjust: Monday=0, Tuesday=1, ..., Sunday=6
    const adjustedDay = (dayOfWeek + 1) % 7
    return DAY_NAMES[adjustedDay]
  }
  // If week starts on Sunday, use as is: Sunday=0, Monday=1, etc.
  return DAY_NAMES[dayOfWeek]
}

interface PlanPreviewDayProps {
  day: {
    id: string
    dayOfWeek: number
    isRestDay: boolean
    exercises?: Array<{
      id: string
      name: string
      videoUrl?: string | null
      images?: Array<{
        id: string
        thumbnail?: string | null
        medium?: string | null
        url: string
        order: number
      }> | null
    }> | null
  }
  weekNumber: number
}

export function PlanPreviewDay({ day, weekNumber }: PlanPreviewDayProps) {
  const weekStartsOn = useWeekStartPreference()
  const dayName = getDayName(day.dayOfWeek, weekStartsOn)
  const exercises = day.exercises || []

  return (
    <div
      className={`border-l-2 pl-4 py-3 ${
        day.isRestDay
          ? 'border-muted text-muted-foreground'
          : 'border-primary/20'
      }`}
    >
      <h4
        className={`text-sm font-medium mb-2 ${
          day.isRestDay ? 'text-muted-foreground' : ''
        }`}
      >
        {dayName}
        {day.isRestDay && <span className="ml-2 text-xs">• Rest Day</span>}
      </h4>

      {!day.isRestDay && exercises.length > 0 && (
        <div className="space-y-1">
          {exercises.map((exercise, index) => (
            <PlanPreviewExerciseRow
              key={exercise.id}
              exercise={exercise}
              index={index}
            />
          ))}
        </div>
      )}

      {!day.isRestDay && exercises.length === 0 && (
        <p className="text-xs text-muted-foreground">No exercises assigned</p>
      )}
    </div>
  )
}

