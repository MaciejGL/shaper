import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'
import { sortDaysForDisplay } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

type PlanWeeks = NonNullable<
  GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]['weeks']
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
  const firstExercise = day.exercises?.[1]
  // firstExercise?.images?.[0]?.thumbnail ||firstExercise?.images?.[0]?.medium ||
  const firstImage = firstExercise?.images?.[1]?.url || '/rest-day.jpg'

  return (
    <Card
      variant="tertiary"
      className={cn(
        'aspect-[18/8] overflow-hidden relative border-none p-0',
        day.isRestDay && 'aspect-[18/6] opacity-90',
      )}
    >
      <CardContent className="flex p-0 h-full items-center">
        {firstImage && (
          <div className="w-1/2 h-full">
            <Image
              src={firstImage}
              alt={firstExercise?.name || 'Exercise'}
              width={300}
              height={300}
              className="object-cover size-full"
              quality={100}
              // sizes="(max-width: 768px) 90vw, 90vw"
            />
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-l from-black/80 via-black/30 to-transparent',
                day.isRestDay && 'bg-black/60',
              )}
            />
          </div>
        )}
        <div className="flex-center grow">
          <div className="relative z-10 text-center px-4 py-2 rounded-2xl backdrop-blur-sm">
            <p
              className={cn(
                'text-2xl font-semibold text-white drop-shadow-lg line-clamp-2',
                day.isRestDay && 'text-muted-foreground',
              )}
            >
              {day.isRestDay ? 'Rest' : formatWorkoutType(day.workoutType)}
            </p>
            <p className="text-sm text-muted-foreground">
              Day {day.dayOfWeek + 1}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
