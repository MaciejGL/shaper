'use client'

import { formatDate } from 'date-fns'
import { CheckCircle, ChevronDown, Circle } from 'lucide-react'
import { useState } from 'react'

import { dayNames } from '@/app/(protected)/trainer/trainings/creator/utils'
import { Badge } from '@/components/ui/badge'
import { CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GQLGetClientByIdQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface WeeklyProgressProps {
  plan: NonNullable<GQLGetClientByIdQuery['getClientActivePlan']>
}

export function WeeklyProgress({ plan }: WeeklyProgressProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Weekly Breakdown</h3>
        <Badge variant="outline">
          {plan.weeks.filter((w) => w.completedAt).length} of {plan.weekCount}{' '}
          weeks completed
        </Badge>
      </div>

      <Tabs defaultValue={plan.weeks[0]?.id} className="w-full">
        <TabsList className="w-full">
          {plan.weeks.map((week, index) => (
            <TabsTrigger key={week.id} value={week.id}>
              {week.completedAt && (
                <CheckCircle className="size-3 text-green-600" />
              )}
              {week.name || `Week ${index + 1}`}
            </TabsTrigger>
          ))}
        </TabsList>

        {plan.weeks.map((week) => (
          <TabsContent key={week.id} value={week.id} className="mt-1">
            <div className="space-y-3">
              {week.days.map((day) => (
                <DayCard key={day.id} day={day} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

const DayCard = ({
  day,
}: {
  day: NonNullable<
    GQLGetClientByIdQuery['getClientActivePlan']
  >['weeks'][number]['days'][number]
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const checkIcons = {
    completed: <CheckCircle className="size-4 text-green-600" />,
    planned: <Circle className="size-4 text-muted-foreground" />,
    rest: <div className="size-4 bg-muted-foreground/10 rounded-full" />,
  }
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => !day.isRestDay && setIsOpen(open)}
    >
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            'cursor-pointer bg-muted/50 transition-colors p-3  rounded-md',
            day.isRestDay
              ? 'opacity-50 hover:bg-muted/50 cursor-default'
              : 'hover:bg-muted/70',
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {
                checkIcons[
                  day.completedAt
                    ? 'completed'
                    : day.isRestDay
                      ? 'rest'
                      : 'planned'
                ]
              }
              <div>
                <CardTitle className="text-base font-medium">
                  {dayNames[day.dayOfWeek]}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {day.isRestDay ? (
                    <Badge variant="secondary" size="sm">
                      Rest Day
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline" size="sm">
                        {day.workoutType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {day.exercises.length} exercises
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {day.completedAt && (
                <p className="text-xs text-muted-foreground">
                  Completed {formatDate(new Date(day.completedAt), 'MMM d')}
                </p>
              )}
              {!day.isRestDay && (
                <ChevronDown
                  className={cn(
                    'size-4 text-muted-foreground transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden">
        <div className="p-4">
          {day.isRestDay ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Rest day - no exercises scheduled
            </p>
          ) : (
            <div className="space-y-4 overflow-x-auto">
              {day.exercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

const ExerciseCard = ({
  exercise,
}: {
  exercise: NonNullable<
    GQLGetClientByIdQuery['getClientActivePlan']
  >['weeks'][number]['days'][number]['exercises'][number]
}) => {
  const hasLogs = exercise.sets.some((set) => set.log)
  const completedSets = exercise.sets.filter((set) => set.completedAt).length

  return (
    <div className="space-y-3 bg-card-on-card rounded-md p-4">
      {/* Exercise Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{exercise.name}</h4>
        <div className="flex items-center gap-2">
          {hasLogs && (
            <span className="text-xs text-muted-foreground">
              {completedSets}/{exercise.sets.length}
            </span>
          )}
          <Badge
            variant={hasLogs ? 'primary' : 'outline'}
            className="text-xs h-5"
          >
            {hasLogs ? 'Completed' : 'Planned'}
          </Badge>
        </div>
      </div>

      {/* Sets Table */}
      <div className="space-y-1 max-w-max overflow-x-auto min-w-max">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 text-xs text-muted-foreground font-medium pb-2">
          <div className="w-8">Set</div>
          <div className="text-center w-32">Reps</div>
          <div className="text-center w-32">Weight (kg)</div>
          <div className="text-center w-32">RPE</div>
        </div>

        {/* Sets Data */}
        {exercise.sets.map((set) => {
          const isCompleted = set.completedAt
          const log = set.log

          return (
            <div
              key={set.id}
              className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 text-sm"
            >
              {/* Set Number */}
              <div className="flex items-center gap-1">
                <span className="font-medium w-8">{set.order}</span>
                {isCompleted && (
                  <CheckCircle className="size-3 text-green-600" />
                )}
              </div>

              {/* Reps - Target */}
              <SetLog
                logValue={log?.reps}
                targetValue={
                  set.minReps && set.maxReps
                    ? `${set.minReps}-${set.maxReps}`
                    : set.reps
                }
              />
              {/* Weight - Target */}
              <SetLog logValue={log?.weight} targetValue={set.weight} />

              {/* RPE - Target */}
              <SetLog logValue={log?.rpe} targetValue={set.rpe} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SetLog({
  logValue,
  targetValue,
}: {
  logValue?: string | number | null
  targetValue?: string | number | null
}) {
  return (
    <div className="grid grid-cols-2 text-center bg-muted rounded-md">
      <div className="border-r border-muted-foreground/20 px-2 py-1">
        <span className="font-medium text-foreground">{logValue}</span>
      </div>
      <div className="px-2 py-1">
        <span className="text-xs text-muted-foreground">{targetValue}</span>
      </div>
    </div>
  )
}
