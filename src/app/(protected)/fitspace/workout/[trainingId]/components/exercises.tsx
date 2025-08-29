import { BadgeCheckIcon } from 'lucide-react'
import React from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useWorkout } from '@/context/workout-context/workout-context'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { QuickWorkout } from '../../quick-workout/quick-workout'

import { Exercise } from './exercise'
import { RestDay } from './rest-day'
import { Summary } from './summary'

export function Exercises() {
  const { activeDay } = useWorkout()

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
          <div className="flex justify-between items-end gap-2">
            <p className="text-md">
              {formatWorkoutType(activeDay.workoutType)}
            </p>

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
    <Badge variant="secondary" size="sm" className="self-end">
      {completedExercises}/{totalExercises} completed{' '}
      {completedExercises === totalExercises ? (
        <BadgeCheckIcon className="text-green-500" />
      ) : (
        ''
      )}
    </Badge>
  )
}
