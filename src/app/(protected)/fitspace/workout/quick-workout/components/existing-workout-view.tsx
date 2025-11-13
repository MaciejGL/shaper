'use client'

import { motion } from 'framer-motion'
import { ChevronRight, ListPlusIcon, PlusIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { GQLFitspaceGetUserQuickWorkoutPlanQuery } from '@/generated/graphql-client'

import { getTodaysWorkoutExercises } from '../utils/workout-utils'

import { ExerciseCard } from './exercise-card'

interface ExistingWorkoutViewProps {
  quickWorkoutPlan?:
    | GQLFitspaceGetUserQuickWorkoutPlanQuery['getQuickWorkoutPlan']
    | null
  onCreateNewWorkout: () => void
  onAddMoreExercises: () => void
}

export function ExistingWorkoutView({
  quickWorkoutPlan,
  onCreateNewWorkout,
  onAddMoreExercises,
}: ExistingWorkoutViewProps) {
  if (!quickWorkoutPlan) {
    return null
  }

  const todaysWorkout = getTodaysWorkoutExercises(quickWorkoutPlan)

  if (!todaysWorkout?.exercises?.length) {
    return null
  }

  const { exercises } = todaysWorkout
  const completedExercises = exercises.filter((ex) => ex.completedAt).length
  const isWorkoutCompleted = completedExercises === exercises.length

  return (
    <div className="flex flex-col min-h-screen justify-center items-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="text-center">
          <div className="mb-8">
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mx-auto flex items-center justify-center"
              >
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold"
                >
                  Welcome back!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground mt-2"
                >
                  You have a workout ready for today
                </motion.p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant={isWorkoutCompleted ? 'primary' : 'secondary'}>
                {completedExercises} / {exercises.length} exercises completed
              </Badge>
              {isWorkoutCompleted && (
                <Badge variant="success">Workout Complete!</Badge>
              )}
            </div>
          </div>

          <div className="space-y-6 mt-12">
            {/* Exercise List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Today's Exercises</h3>
              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    selectedExercises={exercises
                      ?.filter((ex) => ex.completedAt)
                      .map((ex) => ex.id)}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <ButtonLink
                  href={`/fitspace/workout`}
                  size="lg"
                  className="w-full"
                  iconEnd={<ChevronRight />}
                >
                  {isWorkoutCompleted
                    ? 'View Completed Workout'
                    : 'Continue Workout'}
                </ButtonLink>

                <div className="flex gap-3">
                  <Button
                    variant="tertiary"
                    onClick={onCreateNewWorkout}
                    className="flex-1"
                    iconStart={<PlusIcon />}
                  >
                    Create New
                  </Button>

                  <Button
                    variant="tertiary"
                    onClick={onAddMoreExercises}
                    className="flex-1"
                    iconStart={<ListPlusIcon />}
                  >
                    Add More Exercises
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
