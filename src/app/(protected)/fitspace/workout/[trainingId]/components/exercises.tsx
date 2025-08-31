import { BadgeCheckIcon } from 'lucide-react'
import React from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { useUserPreferences } from '@/context/user-preferences-context'
import { useWorkout } from '@/context/workout-context/workout-context'
import { GQLTrainingView, GQLWorkoutType } from '@/generated/graphql-client'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { QuickWorkout } from '../../quick-workout/quick-workout'

import { Exercise } from './exercise'
import { RestDay } from './rest-day'
import { Summary } from './summary'

export function Exercises() {
  const { activeDay } = useWorkout()
  const { preferences, setTrainingView } = useUserPreferences()

  if (!activeDay) return null

  const completedExercises = activeDay.exercises.filter(
    (exercise) => exercise.completedAt,
  ).length

  const completedSets = activeDay.exercises.reduce((acc, exercise) => {
    return acc + exercise.sets.filter((set) => set.completedAt).length
  }, 0)

  const totalSets = activeDay.exercises.reduce((acc, exercise) => {
    return acc + exercise.sets.length
  }, 0)

  const progressPercentage = (completedSets / totalSets) * 100
  const exercises = activeDay.exercises

  return (
    <AnimatedPageTransition id={activeDay.id} variant="reveal" mode="wait">
      {!activeDay.isRestDay && (
        <div className="flex flex-col py-3 space-y-2 w-full">
          <div className="grid grid-flow-col gap-2">
            {activeDay.workoutType &&
              activeDay.workoutType !== GQLWorkoutType.Custom && (
                <p className="text-lg">
                  {formatWorkoutType(activeDay.workoutType)}
                </p>
              )}

            <Label className="flex items-center justify-center gap-2  whitespace-nowrap rounded-md p-1.5 bg-muted-foreground/10 dark:bg-muted-foreground/10 w-full">
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
      {activeDay.isRestDay ? <RestDay /> : null}
      {activeDay.exercises.length === 0 && !activeDay.isRestDay ? (
        <QuickWorkout hideProgress={true} />
      ) : null}
      {activeDay.exercises.length > 0 && (
        <div className="space-y-3">
          {activeDay.exercises.map((exercise) => (
            <Exercise key={exercise.id} exercise={exercise} />
          ))}
          <Summary open={true} />
        </div>
      )}
    </AnimatedPageTransition>
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
    <Badge variant="secondary" size="lg" className="self-end w-full">
      {completedExercises}/{totalExercises} completed{' '}
      {completedExercises === totalExercises ? (
        <BadgeCheckIcon className="text-green-500" />
      ) : (
        ''
      )}
    </Badge>
  )
}
