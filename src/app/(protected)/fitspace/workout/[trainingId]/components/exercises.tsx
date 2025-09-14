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

import { QuickWorkout } from '../../quick-workout/quick-workout'

import { Exercise } from './exercise'
import { RestDay } from './rest-day'
import { WorkoutActions } from './workout-actions'

interface ExercisesProps {
  day?: NonNullable<GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']>['day']
  previousDayLogs?: NonNullable<
    GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
  >['previousDayLogs']
}

export function Exercises({ day, previousDayLogs }: ExercisesProps) {
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

  const completedExercises = day.exercises.filter(
    (exercise) => exercise.completedAt,
  ).length

  const completedSets = day.exercises.reduce((acc, exercise) => {
    return acc + exercise.sets.filter((set) => set.completedAt).length
  }, 0)

  const totalSets = day.exercises.reduce((acc, exercise) => {
    return acc + exercise.sets.length
  }, 0)

  const progressPercentage = (completedSets / totalSets) * 100
  const exercises = day.exercises

  return (
    <div>
      {!day.isRestDay && (
        <div className="flex flex-col py-3 space-y-2 w-full">
          <div className="grid grid-flow-col gap-2">
            {day.workoutType && day.workoutType !== GQLWorkoutType.Custom && (
              <p className="text-lg">{formatWorkoutType(day.workoutType)}</p>
            )}

            <Label className="flex items-center justify-center gap-2  whitespace-nowrap rounded-md p-1.5 bg-secondary dark:bg-muted-foreground/10 w-full">
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

            {exercises.length > 0 && (
              <ExercisesCompleted
                completedExercises={completedExercises}
                totalExercises={exercises.length}
              />
            )}
          </div>
          {exercises.length > 0 && <Progress value={progressPercentage} />}
        </div>
      )}
      {day.isRestDay ? <RestDay /> : null}
      {day.exercises.length === 0 && !day.isRestDay ? (
        <QuickWorkout hideProgress={true} />
      ) : null}
      {day.exercises.length > 0 && (
        <div className="space-y-3">
          {day.exercises.map((exercise) => (
            <Exercise
              key={exercise.id}
              exercise={exercise}
              previousDayLogs={previousDayLogs}
            />
          ))}
          <WorkoutActions />
        </div>
      )}
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
