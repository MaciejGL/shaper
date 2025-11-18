'use client'

import { CheckCheck } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLTrainingView,
  GQLWorkoutType,
} from '@/generated/graphql-client'
import { useTrackWorkoutSession } from '@/hooks/use-track-workout-session'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { AddSingleExercise } from './add-single-exercise'
import { AddToFavouritesButton } from './add-to-favourites-button'
import { ClearWorkoutModal } from './clear-workout-modal'
import { EmptyWorkoutOptions } from './empty-workout-options'
import { Exercise } from './exercise'
import { RestDay } from './rest-day'
import { WorkoutActions } from './workout-actions'

interface ExercisesProps {
  day?: NonNullable<GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']>['day']
  previousDayLogs?: NonNullable<
    GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
  >['previousDayLogs']
  isQuickWorkout?: boolean
}

export function Exercises({
  day,
  previousDayLogs,
  isQuickWorkout = false,
}: ExercisesProps) {
  const { preferences, setTrainingView } = useUserPreferences()

  // Calculate last activity timestamp from most recent set log
  const lastActivityTimestamp = React.useMemo(() => {
    if (!day?.exercises) return undefined

    let mostRecentTimestamp = 0

    day.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.log?.createdAt) {
          const logTime = new Date(set.log.createdAt).getTime()
          if (logTime > mostRecentTimestamp) {
            mostRecentTimestamp = logTime
          }
        }
      })
    })

    return mostRecentTimestamp > 0 ? mostRecentTimestamp : undefined
  }, [day])

  // Determine if workout is currently active (user logged something in last 5 minutes)
  // Note: Using useState with lazy init to avoid calling Date.now() during render
  const [currentTime] = React.useState(() => Date.now())
  const isActive = React.useMemo(() => {
    if (!lastActivityTimestamp) return false
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000
    return lastActivityTimestamp >= fiveMinutesAgo
  }, [lastActivityTimestamp, currentTime])

  const isCompleted = day?.completedAt ? true : false

  useTrackWorkoutSession(day?.id, isActive, isCompleted, lastActivityTimestamp)

  if (!day) return <div>No day data available</div>

  // Derived state
  const exercises = day.exercises
  const hasExercises = exercises.length > 0
  const isEmptyWorkout = !hasExercises && !day.isRestDay
  const hasNamedWorkoutType =
    day.workoutType && day.workoutType !== GQLWorkoutType.Custom

  const completedExercises = exercises.filter(
    (exercise) => exercise.completedAt,
  ).length

  const completedSets = exercises.reduce((acc, exercise) => {
    return acc + exercise.sets.filter((set) => set.completedAt).length
  }, 0)

  const totalSets = exercises.reduce((acc, exercise) => {
    return acc + exercise.sets.length
  }, 0)

  const progressPercentage =
    totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  // Early returns for special states
  if (day.isRestDay) {
    return <RestDay />
  }

  if (isEmptyWorkout) {
    return (
      <div>
        {isQuickWorkout ? (
          <EmptyWorkoutOptions dayId={day.id} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No exercises scheduled for this day</p>
          </div>
        )}
      </div>
    )
  }

  // Main workout view
  return (
    <div>
      <div className="flex flex-col pb-4 space-y-2 w-full px-2">
        {hasNamedWorkoutType && (
          <p className="text-lg font-medium text-center pb-2">
            {formatWorkoutType(day.workoutType!)}
          </p>
        )}
        <div className="grid grid-flow-col gap-2 bg-background">
          <Label className="flex items-center justify-center gap-2 whitespace-nowrap p-1.5 bg-card border border-border w-full rounded-2xl">
            <Switch
              checked={preferences.trainingView === GQLTrainingView.Advanced}
              onCheckedChange={() =>
                setTrainingView(
                  preferences.trainingView === GQLTrainingView.Advanced
                    ? GQLTrainingView.Simple
                    : GQLTrainingView.Advanced,
                )
              }
            />
            Logging Mode
          </Label>

          <ExercisesCompleted
            completedExercises={completedExercises}
            totalExercises={exercises.length}
          />
        </div>
        <Progress value={progressPercentage} />
      </div>

      <div>
        {exercises.map((exercise) => (
          <Exercise
            key={exercise.id}
            exercise={exercise}
            previousDayLogs={previousDayLogs}
          />
        ))}
        {isQuickWorkout && day.id && (
          <div className="grid grid-cols-[auto_1fr] gap-2 pb-4">
            <div>
              <ClearWorkoutModal dayId={day.id} />
            </div>
            <div>
              <AddSingleExercise dayId={day.id} variant="button" />
            </div>

            <div className="col-span-full empty:hidden">
              <AddToFavouritesButton day={day} />
            </div>
          </div>
        )}
        <WorkoutActions />
      </div>
    </div>
  )
}

function ExercisesCompleted({
  completedExercises,
  totalExercises,
}: {
  completedExercises: number
  totalExercises: number
}) {
  return (
    <Badge
      variant="secondary"
      size="lg"
      className="w-full bg-card border border-border rounded-2xl"
    >
      {completedExercises}/{totalExercises} completed{' '}
      {completedExercises === totalExercises ? (
        <CheckCheck className="text-emerald-600" />
      ) : (
        ''
      )}
    </Badge>
  )
}
