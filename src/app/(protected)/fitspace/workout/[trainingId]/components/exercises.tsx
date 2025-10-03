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

  const isActive = day?.exercises.some((ex) =>
    ex.sets.some((set) => {
      if (!set.log?.createdAt || (!set.log?.reps && !set.log?.weight)) {
        return false
      }
      const logCreatedAt = new Date(set.log.createdAt)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return logCreatedAt >= fiveMinutesAgo
    }),
  )
  const isCompleted = day?.completedAt ? true : false
  useTrackWorkoutSession(day?.id, isActive, isCompleted)
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
      <div className="mt-4">
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
      <div className="flex flex-col py-3 space-y-2 w-full">
        <div className="grid grid-flow-col gap-2 bg-background">
          {hasNamedWorkoutType && (
            <p className="text-lg">{formatWorkoutType(day.workoutType!)}</p>
          )}

          <Label className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md p-1.5 bg-secondary dark:bg-muted-foreground/10 w-full">
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

      <div className="space-y-3">
        {exercises.map((exercise) => (
          <Exercise
            key={exercise.id}
            exercise={exercise}
            previousDayLogs={previousDayLogs}
          />
        ))}
        {isQuickWorkout && day.id && (
          <div className="space-y-3 py-4">
            <AddSingleExercise dayId={day.id} variant="button" />
            <ClearWorkoutModal dayId={day.id} />
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
    <Badge variant="secondary" size="lg" className="w-full bg-secondary">
      {completedExercises}/{totalExercises} completed{' '}
      {completedExercises === totalExercises ? (
        <CheckCheck className="text-emerald-600" />
      ) : (
        ''
      )}
    </Badge>
  )
}
