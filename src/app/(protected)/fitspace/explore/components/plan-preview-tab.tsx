import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLGetPublicTrainingPlanWeeksQuery } from '@/generated/graphql-client'
import { sortDaysForDisplay } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

type PlanWeeks = NonNullable<
  GQLGetPublicTrainingPlanWeeksQuery['getTrainingPlanById']['weeks']
>

interface PlanPreviewTabProps {
  weeks?: PlanWeeks | null
}

export function PlanPreviewTab({ weeks }: PlanPreviewTabProps) {
  const { preferences } = useUserPreferences()

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
    <div className="space-y-8">
      {sortedWeeks.map((week) => {
        const sortedDays = sortDaysForDisplay(
          week.days || [],
          preferences.weekStartsOn,
        )

        return (
          <div key={week.id} className="space-y-3">
            <h3 className="text-lg font-semibold">Week {week.weekNumber}</h3>
            <div className="grid gap-2">
              {sortedDays.map((day) => (
                <DayCard key={day.id} day={day} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

type Day = NonNullable<PlanWeeks[number]['days']>[number]

interface DayCardProps {
  day: Day
}

function DayCard({ day }: DayCardProps) {
  const firstExercise = day.exercises?.[0]
  // firstExercise?.images?.[0]?.thumbnail ||firstExercise?.images?.[0]?.medium ||
  const firstImage = firstExercise?.images?.[0]?.url || '/rest-day.jpg'

  return (
    <Card
      variant="tertiary"
      className={cn(
        'aspect-[18/8] overflow-hidden relative border-none',
        'flex items-center justify-center',
      )}
    >
      <CardContent>
        {firstImage && (
          <div className="absolute inset-0">
            <Image
              src={firstImage}
              alt={firstExercise?.name || 'Exercise'}
              fill
              className="object-cover"
              quality={100}
              // sizes="(max-width: 768px) 90vw, 90vw"
            />
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent',
                day.isRestDay && 'bg-black/60',
              )}
            />
          </div>
        )}
        <div className="relative z-10 text-center bg-black/50 px-4 py-2 rounded-2xl backdrop-blur-sm">
          <p className="text-2xl font-semibold text-white drop-shadow-lg line-clamp-2">
            {day.isRestDay ? 'Rest' : formatWorkoutType(day.workoutType)}
          </p>
          <p className="text-sm text-muted-foreground">
            Day {day.dayOfWeek + 1}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
