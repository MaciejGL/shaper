import { BadgeCheckIcon, ChevronLeft } from 'lucide-react'
import { useQueryState } from 'nuqs'
import React, { startTransition, useEffect, useState } from 'react'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { SwipeableWrapper } from '@/components/swipeable-wrapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useWorkout } from '@/context/workout-context/workout-context'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { AddExerciseModal } from './add-exercise-modal'
import { AiSuggestion } from './ai-suggestion'
import { Exercise, ExerciseSelector } from './exercise'
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

  // Add swipe handlers
  const handleSwipeLeft = () => {
    const currentIndex = activeDay.exercises.findIndex(
      (ex) => ex.id === activeExerciseId,
    )
    if (currentIndex < activeDay.exercises.length - 1) {
      const nextExercise = activeDay.exercises[currentIndex + 1]
      handlePaginationClick(nextExercise.id, 'next')
    } else {
      // Go to summary
      handlePaginationClick('summary', 'next')
    }
  }

  const handleSwipeRight = () => {
    if (activeExerciseId === 'summary') {
      const lastExercise = activeDay.exercises[activeDay.exercises.length - 1]
      handlePaginationClick(lastExercise?.id ?? null, 'prev')
    } else {
      const currentIndex = activeDay.exercises.findIndex(
        (ex) => ex.id === activeExerciseId,
      )
      if (currentIndex > 0) {
        const prevExercise = activeDay.exercises[currentIndex - 1]
        handlePaginationClick(prevExercise.id, 'prev')
      }
    }
  }

  const exercises = activeDay.exercises

  return (
    <AnimatedPageTransition id={activeDay.id} variant="reveal" mode="wait">
      {!activeDay.isRestDay && (
        <div className="flex flex-col py-2 space-y-2 w-full">
          <div className="flex justify-between items-end gap-2">
            <p className="text-md">
              {formatWorkoutType(activeDay.workoutType)}
            </p>
            <ExercisesCompleted
              completedExercises={completedExercises}
              totalExercises={exercises.length}
            />
          </div>
          {exercises.length > 0 && <Progress value={progressPercentage} />}
        </div>
      )}

      {activeDay.isRestDay ? (
        <RestDay />
      ) : selectedExercise ? (
        <div className="relative">
          <SwipeableWrapper
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            disabled={exercises.length <= 1} // Disable if only one exercise
          >
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
          </SwipeableWrapper>
          {exercises.length > 1 && (
            <ExercisesPagination onClick={handlePaginationClick} />
          )}
        </div>
      ) : (
        <div className="relative">
          <SwipeableWrapper
            onSwipeLeft={() => {}} // No next from summary
            onSwipeRight={handleSwipeRight}
          >
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    iconStart={<ChevronLeft />}
                    className="w-max"
                    onClick={() => {
                      handlePaginationClick(
                        exercises.at(-1)?.id ?? null,
                        'prev',
                      )
                    }}
                  >
                    Exercises
                  </Button>
                  <ExerciseSelector
                    activeExerciseId={'summary'}
                    setActiveExerciseId={setActiveExerciseId}
                    className="w-auto grow"
                  />
                </div>
                <Results
                  handlePaginationClick={handlePaginationClick}
                  lastExerciseId={exercises.at(-1)?.id ?? null}
                />
              </AnimatedPageTransition>
            </AnimateChangeInHeight>
          </SwipeableWrapper>
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
    <div className="flex flex-col h-full pt-4">
      <div className="flex flex-col gap-2 mt-8 mb-6">
        <p className="text-sm text-muted-foreground">
          More in the tank or enough for today?
        </p>

        <div className="grid grid-cols-2 gap-2 mt-2 mb-6 w-full">
          <AddExerciseModal handlePaginationClick={handlePaginationClick} />
          <AiSuggestion />
        </div>
        <Summary
          open={true}
          onContinue={() => handlePaginationClick(lastExerciseId, 'prev')}
          continueButtonText="Back"
        />
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
    <Badge variant="outline" size="sm" className="self-end">
      {completedExercises}/{totalExercises} completed{' '}
      {completedExercises === totalExercises ? (
        <BadgeCheckIcon className="text-green-500" />
      ) : (
        ''
      )}
    </Badge>
  )
}
