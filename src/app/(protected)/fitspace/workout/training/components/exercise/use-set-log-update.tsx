import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { useEffect, useMemo, useRef } from 'react'

import {
  GQLFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceUpdateSetLogMutation,
} from '@/generated/graphql-client'

interface UseSetLogUpdateParams {
  setId: string
  dayId: string
  reps: string
  weight: string
}

export function useSetLogUpdate({
  setId,
  dayId,
  reps,
  weight,
}: UseSetLogUpdateParams) {
  const queryClient = useQueryClient()
  const hasUserEditedRef = useRef(false)

  const { mutateAsync: updateSetLog } = useFitspaceUpdateSetLogMutation({
    onMutate: async (newLog) => {
      await queryClient.cancelQueries({
        queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
      })

      const previousWorkout = queryClient.getQueryData(
        useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
      )

      queryClient.setQueryData(
        useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
        (old: GQLFitspaceGetWorkoutDayQuery) => {
          if (!old?.getWorkoutDay?.day) return old

          const newData = JSON.parse(
            JSON.stringify(old),
          ) as NonNullable<GQLFitspaceGetWorkoutDayQuery>
          if (!newData.getWorkoutDay?.day) return newData

          const updatedSet = newData.getWorkoutDay.day.exercises
            .flatMap(
              (exercise) => exercise.substitutedBy?.sets || exercise.sets,
            )
            .find((s) => s.id === newLog.input.setId)

          if (updatedSet) {
            updatedSet.log = {
              id: updatedSet.log?.id || 'temp-id',
              reps: newLog.input.loggedReps,
              weight: newLog.input.loggedWeight,
              rpe: updatedSet.log?.rpe,
              createdAt: new Date().toISOString(),
            }
          }

          return newData
        },
      )

      return { previousWorkout }
    },
    onError: (_, __, context) => {
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
          context.previousWorkout,
        )
      }
    },
  })

  const debouncedUpdate = useMemo(
    () =>
      debounce(async (repsValue: string, weightValue: string) => {
        await updateSetLog({
          input: {
            setId,
            loggedReps: repsValue ? +repsValue : null,
            loggedWeight: weightValue ? +weightValue : null,
          },
        })
      }, 1500),
    [setId, updateSetLog],
  )

  useEffect(() => {
    if (!hasUserEditedRef.current) {
      debouncedUpdate.cancel()
      return
    }

    debouncedUpdate(reps, weight)
    return () => debouncedUpdate.cancel()
  }, [reps, weight, debouncedUpdate])

  const markAsEdited = () => {
    hasUserEditedRef.current = true
  }

  return { markAsEdited }
}
