import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
  GQLFitspaceMarkSetAsCompletedMutation,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceMarkSetAsCompletedMutation,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { calculateEstimated1RM } from '@/utils/one-rm-calculator'

import { createOptimisticSetUpdate } from '../optimistic-updates'

export interface PRData {
  show: boolean
  improvement: number
  estimated1RM: number
}

interface UseSetCompletionParams {
  dayId: string
  onSetCompleted: (skipTimer?: boolean) => void
}

export function useSetCompletion({
  dayId,
  onSetCompleted,
}: UseSetCompletionParams) {
  const queryClient = useQueryClient()
  const [prData, setPRData] = useState<PRData | null>(null)

  const { optimisticMutate: markSetAsCompletedOptimistic } =
    useOptimisticMutation<
      GQLFitspaceGetWorkoutDayQuery,
      GQLFitspaceMarkSetAsCompletedMutation,
      {
        setId: string
        completed: boolean
        reps?: number | null
        weight?: number | null
      }
    >({
      queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
      mutationFn: useFitspaceMarkSetAsCompletedMutation().mutateAsync,
      updateFn: (oldData, { setId, completed, reps, weight }) => {
        const updateFn = createOptimisticSetUpdate(setId, completed, {
          reps,
          weight,
        })
        return updateFn(oldData)
      },
      onSuccess: async (data, variables) => {
        const workoutDayData =
          queryClient.getQueryData<GQLFitspaceGetWorkoutDayQuery>(
            useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
          )
        const allExercisesCompleted =
          workoutDayData?.getWorkoutDay?.day?.exercises?.every(
            (ex) => ex.substitutedBy?.completedAt ?? ex.completedAt,
          )
        const dayCompletedAt = allExercisesCompleted
          ? new Date().toISOString()
          : null

        queryClient.setQueryData(
          ['navigation'],
          (old: GQLFitspaceGetWorkoutNavigationQuery | undefined) => {
            if (!old?.getWorkoutNavigation?.plan) return old
            return {
              ...old,
              getWorkoutNavigation: {
                ...old.getWorkoutNavigation,
                plan: {
                  ...old.getWorkoutNavigation.plan,
                  weeks: old.getWorkoutNavigation.plan.weeks.map((week) => ({
                    ...week,
                    days: week.days.map((day) =>
                      day.id === dayId
                        ? { ...day, completedAt: dayCompletedAt }
                        : day,
                    ),
                  })),
                },
              },
            }
          },
        )

        if (data?.markSetAsCompleted?.isPersonalRecord && variables.completed) {
          const improvement = data.markSetAsCompleted.improvement || 0
          const currentWeight = variables.weight || 0
          const currentReps = variables.reps || 0
          const estimated1RM = calculateEstimated1RM(currentWeight, currentReps)

          setPRData({
            show: true,
            improvement,
            estimated1RM,
          })

          setTimeout(() => setPRData(null), 5000)
        }

        if (variables.completed) {
          onSetCompleted(false)
        }
      },
      onError: async (error, variables) => {
        console.error('Failed to mark set as completed:', error, variables)

        await queryClient.invalidateQueries({
          queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
        })
        await queryClient.invalidateQueries({ queryKey: ['navigation'] })
      },
    })

  const clearPR = useCallback(() => setPRData(null), [])

  return {
    markSetAsCompletedOptimistic,
    prData,
    clearPR,
  }
}
