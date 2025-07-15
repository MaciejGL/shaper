'use client'

import { useQueryClient } from '@tanstack/react-query'
import { isToday } from 'date-fns'
import { motion } from 'framer-motion'
import { ListPlusIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  GQLFitspaceGetUserQuickWorkoutPlanQuery,
  useFitspaceClearTodaysWorkoutMutation,
  useFitspaceGetUserQuickWorkoutPlanQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { getTodaysWorkoutExercises } from '../utils/workout-utils'

import { ExerciseCard } from './exercise-card'

interface ExistingWorkoutViewProps {
  quickWorkoutPlan?:
    | GQLFitspaceGetUserQuickWorkoutPlanQuery['getQuickWorkoutPlan']
    | null
  onContinueWorkout: () => void
  onCreateNewWorkout: () => void
}

export function ExistingWorkoutView({
  quickWorkoutPlan,
  onContinueWorkout,
  onCreateNewWorkout,
}: ExistingWorkoutViewProps) {
  const [isClearing, setIsClearing] = useState(false)
  const invalidateQuery = useInvalidateQuery()
  const queryClient = useQueryClient()

  const { mutateAsync: clearWorkout } = useFitspaceClearTodaysWorkoutMutation({
    onMutate: async () => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
      })

      // Snapshot the previous value
      const previousData =
        queryClient.getQueryData<GQLFitspaceGetUserQuickWorkoutPlanQuery>(
          useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
        )

      // Optimistically update to remove today's exercises
      if (previousData?.getQuickWorkoutPlan) {
        const updatedData = {
          ...previousData,
          getQuickWorkoutPlan: {
            ...previousData.getQuickWorkoutPlan,
            weeks: previousData.getQuickWorkoutPlan.weeks.map((week) => ({
              ...week,
              days: week.days.map((day) => {
                // Clear exercises for today's day
                if (day.scheduledAt && isToday(new Date(day.scheduledAt))) {
                  return {
                    ...day,
                    exercises: [],
                  }
                }
                return day
              }),
            })),
          },
        }

        queryClient.setQueryData<GQLFitspaceGetUserQuickWorkoutPlanQuery>(
          useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
          updatedData,
        )
      }

      // Return a context object with the snapshotted value
      return { previousData }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(
          useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
          context.previousData,
        )
      }
    },
    onSuccess: () => {
      // Invalidate all related queries
      invalidateQuery({
        queryKey: useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
      })
      invalidateQuery({
        queryKey: ['FitspaceGetWorkout'],
      })
      invalidateQuery({
        queryKey: ['FitspaceMyPlans'],
      })
      invalidateQuery({
        queryKey: ['FitspaceDashboardGetWorkout'],
      })
    },
  })

  const todaysWorkout = quickWorkoutPlan
    ? getTodaysWorkoutExercises(quickWorkoutPlan)
    : null

  if (!todaysWorkout) {
    return null
  }

  const { exercises } = todaysWorkout
  const completedExercises = exercises.filter((ex) => ex.completedAt).length
  const isWorkoutCompleted = completedExercises === exercises.length

  const handleClearWorkout = async () => {
    if (exercises.length === 0) return

    setIsClearing(true)
    try {
      await clearWorkout({})

      onCreateNewWorkout() // Switch to wizard after clearing
    } catch (error) {
      console.error('Failed to clear workout:', error)
      toast.error('Failed to clear workout')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl">You already have a workout for today</h2>
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

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <Button
                  onClick={onContinueWorkout}
                  size="lg"
                  className="w-full"
                >
                  {isWorkoutCompleted
                    ? 'View Completed Workout'
                    : 'Continue Workout'}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleClearWorkout}
                    loading={isClearing}
                    disabled={isClearing}
                    className="flex-1"
                    iconStart={<PlusIcon />}
                  >
                    Create New
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={onCreateNewWorkout}
                    className="flex-1"
                    iconStart={<ListPlusIcon />}
                  >
                    Add More Exercises
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                You can continue your existing workout or create a completely
                new one for today.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
