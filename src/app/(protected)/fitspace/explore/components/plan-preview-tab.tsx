import Image from 'next/image'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'
import { sortDaysForDisplay } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { getDayImage } from '../../my-plans/utils'

type PlanWeeks = NonNullable<
  GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]['weeks']
>

interface PlanPreviewTabProps {
  weeks?: PlanWeeks | null
  avgSessionTime?: number | null
}

export function PlanPreviewTab({ weeks, avgSessionTime }: PlanPreviewTabProps) {
  const { preferences } = useUserPreferences()

  // Sort weeks by weekNumber
  const sortedWeeks = [...(weeks || [])].sort(
    (a, b) => a.weekNumber - b.weekNumber,
  )

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (sortedWeeks.length > 0) return sortedWeeks[0].id
    return ''
  })

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
      <div className="-mx-4 px-4 overflow-x-auto hide-scrollbar pb-2">
        <TabsList className="w-max justify-start h-auto bg-transparent gap-2 p-0 pr-6">
          {sortedWeeks.map((week) => (
            <TabsTrigger
              key={week.id}
              value={week.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-full px-4 py-2 h-auto border border-border bg-card/50 min-w-max"
            >
              Week {week.weekNumber}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {sortedWeeks.map((week) => {
        const sortedDays = sortDaysForDisplay(
          week.days || [],
          preferences.weekStartsOn,
        )

        return (
          <TabsContent
            key={week.id}
            value={week.id}
            className="mt-2 space-y-3 outline-none"
          >
            <div className="grid gap-2">
              {sortedDays.map((day) => (
                <DayCard
                  key={day.id}
                  day={day}
                  avgSessionTime={avgSessionTime}
                />
              ))}
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

type Day = NonNullable<PlanWeeks[number]['days']>[number]

interface DayCardProps {
  day: Day
  avgSessionTime?: number | null
}

function DayCard({ day, avgSessionTime }: DayCardProps) {
  const firstExercise = day.exercises?.[0]
  const firstImage = getDayImage(day)
  const exerciseCount = day.exercises?.length ?? 0
  const showDuration = !!avgSessionTime && !day.isRestDay

  return (
    <Card
      variant="glass"
      className={cn(
        'flex-row gap-0 overflow-hidden border-none p-0',
        day.isRestDay ? 'h-24' : 'h-34',
      )}
    >
      <CardContent className="flex h-full w-full gap-0 p-0">
        <div className="relative h-full w-[42%] shrink-0">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={firstExercise?.name || 'Exercise'}
              fill
              sizes="180px"
              className={cn(
                'object-cover',
                day.isRestDay && 'grayscale opacity-60',
              )}
              quality={100}
            />
          ) : null}
        </div>

        <div className="flex h-full flex-1 flex-col justify-between bg-card px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="glass">Day {day.dayOfWeek + 1}</Badge>
            {!day.isRestDay ? (
              <Badge variant="glass">{exerciseCount} exercises</Badge>
            ) : (
              <Badge variant="glass">Recovery</Badge>
            )}
          </div>

          <div>
            <p className="text-lg font-semibold leading-tight text-foreground line-clamp-1">
              {day.isRestDay ? 'Rest' : formatWorkoutType(day.workoutType)}
            </p>
            {!day.isRestDay && showDuration ? (
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Est. {avgSessionTime} min
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
