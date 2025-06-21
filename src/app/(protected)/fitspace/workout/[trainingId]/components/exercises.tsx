import { BadgeCheckIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import React, { startTransition, useEffect, useState } from 'react'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useWorkout } from '@/context/workout-context/workout-context'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { AddExerciseModal } from './add-exercise-modal'
import { Exercise } from './exercise'
import { ExercisesPagination } from './exercises-pagaination'
import { RestDay } from './rest-day'
import { Summary } from './summary'

export function Exercises() {
  const { activeDay } = useWorkout()
  const [activeExerciseId, setActiveExerciseId] = useQueryState('exercise')
  const [animationVariant, setAnimationVariant] = useState<
    'slideFromLeft' | 'slideFromRight'
  >('slideFromLeft')

  const selectedExercise = activeDay?.exercises.find(
    (exercise) => exercise.id === activeExerciseId,
  )

  useEffect(() => {
    if (activeDay) {
      setActiveExerciseId(activeDay.exercises.at(0)?.id ?? '')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- Change only when day changes with fallback to first exercise. Otherwise it does update on logs.
  }, [activeDay?.id, setActiveExerciseId])

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

  const handlePaginationClick = (
    exerciseId: string | null,
    type: 'prev' | 'next',
  ) => {
    startTransition(() => {
      setAnimationVariant(type === 'prev' ? 'slideFromRight' : 'slideFromLeft')
      setTimeout(() => {
        setActiveExerciseId(exerciseId)
      }, 50)
    })
  }

  const exercises = activeDay.exercises

  return (
    <AnimatedPageTransition id={activeDay.id} variant="reveal" mode="wait">
      {!activeDay.isRestDay && (
        <div className="flex flex-col py-4 space-y-2 w-full">
          <div className="flex justify-between items-end gap-2">
            <p className="text-sm text-muted-foreground">
              {formatWorkoutType(activeDay.workoutType)} {activeDay.duration}
            </p>
            <ExercisesCompleted
              completedExercises={completedExercises}
              totalExercises={exercises.length}
            />
          </div>
          {exercises.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 w-full">
              <Progress value={progressPercentage} className="" />
            </div>
          )}
        </div>
      )}

      {activeDay.isRestDay ? (
        <RestDay />
      ) : selectedExercise ? (
        <div className="relative overflow-hidden">
          <AnimateChangeInHeight
            transition={{
              type: 'tween',
              stiffness: 80,
              damping: 10,
              mass: 0.5,
              duration: 0.05,
            }}
          >
            <AnimatedPageTransition
              id={selectedExercise.id}
              variant={animationVariant}
              mode="wait"
              className="w-full"
            >
              <Exercise
                exercise={selectedExercise}
                exercises={exercises}
                onPaginationClick={handlePaginationClick}
              />
            </AnimatedPageTransition>
          </AnimateChangeInHeight>
          {exercises.length > 1 && (
            <ExercisesPagination onClick={handlePaginationClick} />
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden">
          <AnimateChangeInHeight
            transition={{
              type: 'tween',
              stiffness: 80,
              damping: 10,
              mass: 0.5,
              duration: 0.05,
            }}
          >
            <AnimatedPageTransition
              id={'results'}
              variant={animationVariant}
              mode="wait"
              className="w-full"
            >
              <Results
                handlePaginationClick={handlePaginationClick}
                lastExerciseId={exercises.at(-1)?.id ?? null}
              />
            </AnimatedPageTransition>
          </AnimateChangeInHeight>
        </div>
      )}
    </AnimatedPageTransition>
  )
}

function Results({
  handlePaginationClick,
  lastExerciseId,
}: {
  handlePaginationClick: (
    exerciseId: string | null,
    type: 'prev' | 'next',
  ) => void
  lastExerciseId: string | null
}) {
  return (
    <div className="flex flex-col h-full">
      <div>
        <h2 className="flex items-center gap-2 text-2xl">Workout Summary</h2>
      </div>
      <div className="flex flex-col gap-2 mt-8 mb-6">
        <p className="text-md">What's next?</p>
        <p className="text-sm text-muted-foreground">More in the tank?</p>
        <AddExerciseModal />
      </div>
      <Summary
        open={true}
        onContinue={() => handlePaginationClick(lastExerciseId, 'prev')}
        continueButtonText="Back"
      />
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
      variant="outline"
      size="sm"
      className="self-end text-muted-foreground"
    >
      {completedExercises}/{totalExercises} completed{' '}
      {completedExercises === totalExercises ? (
        <BadgeCheckIcon className="text-green-500" />
      ) : (
        ''
      )}
    </Badge>
  )
}
