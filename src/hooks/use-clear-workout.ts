import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  type GQLFitspaceGetWorkoutDayQuery,
  useFitspaceClearWorkoutDayMutation,
  useFitspaceGetWorkoutDayQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

export function useClearWorkoutDay(dayId: string) {
  const router = useRouter()
  const invalidateQuery = useInvalidateQuery()
  const [isClearing, setIsClearing] = useState(false)

  const { mutateAsync: clearWorkoutMutation } =
    useFitspaceClearWorkoutDayMutation()

  const { optimisticMutate: clearWorkoutOptimistic } = useOptimisticMutation<
    GQLFitspaceGetWorkoutDayQuery,
    boolean,
    { dayId: string }
  >({
    queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
    mutationFn: async ({ dayId }) => {
      const result = await clearWorkoutMutation({ dayId })
      return result.clearWorkoutDay
    },
    updateFn: (oldData) => {
      // Optimistically clear all exercises from the cache
      if (!oldData?.getWorkoutDay?.day) return oldData

      return {
        ...oldData,
        getWorkoutDay: {
          ...oldData.getWorkoutDay,
          day: {
            ...oldData.getWorkoutDay.day,
            exercises: [],
            completedAt: null,
          },
        },
      }
    },
    onSuccess: () => {
      // Invalidate navigation to update counts
      invalidateQuery({
        queryKey: ['navigation'],
      })
      invalidateQuery({
        queryKey: ['FitspaceGetQuickWorkoutNavigation'],
      })
      setIsClearing(false)
      router.refresh()
    },
    onError: () => {
      // On error, revert by invalidating the day query
      invalidateQuery({
        queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
      })
      setIsClearing(false)
    },
  })

  return {
    mutate: async (
      variables: { dayId: string },
      options?: { onSuccess?: () => void },
    ) => {
      setIsClearing(true)
      try {
        await clearWorkoutOptimistic(variables)
        options?.onSuccess?.()
      } catch (error) {
        setIsClearing(false)
        throw error
      }
    },
    isPending: isClearing,
  }
}
