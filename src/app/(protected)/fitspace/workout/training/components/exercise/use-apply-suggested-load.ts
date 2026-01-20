import { useState } from 'react'

import {
  type GQLFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceUpdateSetLogMutation,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

interface SuggestedLoad {
  setId: string
  suggestedWeightKg: number
}

export function useApplySuggestedLoad({ dayId }: { dayId: string }) {
  const [isApplying, setIsApplying] = useState(false)
  const { mutateAsync: updateSetLog } = useFitspaceUpdateSetLogMutation()

  const { optimisticMutate } = useOptimisticMutation<
    GQLFitspaceGetWorkoutDayQuery,
    void,
    { suggestions: SuggestedLoad[] }
  >({
    queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
    mutationFn: async ({ suggestions }) => {
      await Promise.all(
        suggestions.map(({ setId, suggestedWeightKg }) =>
          updateSetLog({
            input: { setId, loggedWeight: suggestedWeightKg },
          }),
        ),
      )
    },
    updateFn: (oldData, { suggestions }) => {
      if (!oldData?.getWorkoutDay?.day) return oldData

      const newData = JSON.parse(
        JSON.stringify(oldData),
      ) as NonNullable<GQLFitspaceGetWorkoutDayQuery>
      if (!newData.getWorkoutDay?.day) return newData

      const suggestionBySetId = new Map(
        suggestions.map((s) => [s.setId, s.suggestedWeightKg] as const),
      )

      newData.getWorkoutDay.day.exercises
        .flatMap((exercise) => exercise.substitutedBy?.sets || exercise.sets)
        .forEach((set) => {
          const suggestedWeightKg = suggestionBySetId.get(set.id)
          if (typeof suggestedWeightKg !== 'number') return

          set.log = {
            id: set.log?.id || 'temp-id',
            reps: set.log?.reps ?? null,
            weight: suggestedWeightKg,
            rpe: set.log?.rpe ?? null,
            createdAt: set.log?.createdAt || new Date().toISOString(),
          }
        })

      return newData
    },
  })

  const applySuggestedLoad = async (suggestions: SuggestedLoad[]) => {
    if (!dayId || suggestions.length === 0) return

    setIsApplying(true)
    try {
      await optimisticMutate({ suggestions })
    } finally {
      setIsApplying(false)
    }
  }

  return { applySuggestedLoad, isApplyingSuggestedLoad: isApplying }
}

