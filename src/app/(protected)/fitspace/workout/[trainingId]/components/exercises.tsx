import { BadgeCheckIcon, ChevronDownIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import React, { startTransition, useMemo, useState } from 'react'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { useWorkout } from '@/context/workout-context/workout-context'
import { formatWorkoutType } from '@/lib/workout-type-to-label'

import { Exercise } from './exercise'
import { ExercisesPagination } from './exercises-pagaination'
import { RestDay } from './rest-day'
import { WorkoutDay } from './workout-page.client'

export function Exercises() {
  const { activeDay } = useWorkout()
  const [activeExerciseId, setActiveExerciseId] = useQueryState(
    'exercise',
    parseAsString.withDefault(activeDay.exercises.at(0)?.id ?? ''),
  )
  const [animationVariant, setAnimationVariant] = useState<
    'slideFromLeft' | 'slideFromRight'
  >('slideFromLeft')

  const exercises = activeDay.exercises
  const completedExercises = exercises.filter(
    (exercise) => exercise.completedAt,
  ).length
  const progressPercentage = (completedExercises / exercises.length) * 100

  const selectedExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === activeExerciseId),
    [exercises, activeExerciseId],
  )

  const handlePaginationClick = (exerciseId: string, type: 'prev' | 'next') => {
    startTransition(() => {
      setAnimationVariant(type === 'prev' ? 'slideFromRight' : 'slideFromLeft')
      setTimeout(() => {
        setActiveExerciseId(exerciseId)
      }, 50)
    })
  }

  console.log(completedExercises, exercises.length)
  return (
    <AnimatedPageTransition id={activeDay.id} variant="rotate" mode="wait">
      {!activeDay.isRestDay && (
        <div className="flex flex-col py-4 space-y-2 w-full">
          <div className="flex justify-between gap-2">
            <ExerciseDropdown
              activeDay={activeDay}
              activeExerciseId={activeExerciseId}
              setActiveExerciseId={setActiveExerciseId}
            />
            <ExercisesCompleted
              completedExercises={completedExercises}
              totalExercises={exercises.length}
            />
          </div>
          {exercises.length > 0 && (
            <div className="flex items-center gap-2 w-full">
              <Progress value={progressPercentage} className="" />
            </div>
          )}
        </div>
      )}

      {activeDay.isRestDay || !selectedExercise ? (
        <RestDay />
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
              id={selectedExercise.id}
              variant={animationVariant}
              mode="wait"
              className="w-full"
            >
              <Exercise exercise={selectedExercise} />
            </AnimatedPageTransition>
          </AnimateChangeInHeight>
          {exercises.length > 1 && (
            <ExercisesPagination onClick={handlePaginationClick} />
          )}
        </div>
      )}
    </AnimatedPageTransition>
  )
}

function ExerciseDropdown({
  activeDay,
  activeExerciseId,
  setActiveExerciseId,
}: {
  activeDay: WorkoutDay
  activeExerciseId: string
  setActiveExerciseId: (exerciseId: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" iconEnd={<ChevronDownIcon />}>
          {formatWorkoutType(activeDay.workoutType)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {activeDay.exercises.map((exercise) => (
          <React.Fragment key={exercise.id}>
            <DropdownMenuItem
              key={exercise.id}
              disabled={exercise.id === activeExerciseId}
              onClick={() => setActiveExerciseId(exercise.id)}
            >
              <div className="text-sm flex justify-between w-full">
                <div className="text-sm">
                  {exercise.order}. {exercise.name}
                </div>

                {exercise.completedAt ? (
                  <BadgeCheckIcon className="self-start ml-auto mt-0.5 text-green-500" />
                ) : null}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="last:hidden mx-2" />
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
      {completedExercises !== totalExercises ? (
        <BadgeCheckIcon className="text-green-500" />
      ) : (
        ''
      )}
    </Badge>
  )
}
