import { useQueryClient } from '@tanstack/react-query'

import { getVolumeGoalPresetById } from '@/config/volume-goals'
import {
  type GQLCurrentVolumeGoalQuery,
  type GQLSetVolumeGoalMutation,
  type GQLSetVolumeGoalMutationVariables,
  useCurrentVolumeGoalQuery,
  useSetVolumeGoalMutation,
} from '@/generated/graphql-client'
import { useUser } from '@/context/user-context'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

export function useVolumeGoal() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  const { data, isLoading } = useCurrentVolumeGoalQuery(
    {},
    { enabled: !!user?.id },
  )

  const currentGoal = data?.profile?.currentVolumeGoal ?? null
  const currentPreset = currentGoal
    ? getVolumeGoalPresetById(currentGoal.focusPreset)
    : null

  const setGoalMutation = useSetVolumeGoalMutation()
  const queryKey = useCurrentVolumeGoalQuery.getKey({})

  const { optimisticMutate: setGoalOptimistic } = useOptimisticMutation<
    GQLCurrentVolumeGoalQuery,
    GQLSetVolumeGoalMutation,
    GQLSetVolumeGoalMutationVariables
  >({
    queryKey,
    mutationFn: setGoalMutation.mutateAsync,
    updateFn: (oldData, variables) => {
      if (!oldData.profile) return oldData

      const now = new Date().toISOString()
      const existingId = oldData.profile.currentVolumeGoal?.id ?? 'temp-volume-goal'

      return {
        ...oldData,
        profile: {
          ...oldData.profile,
          currentVolumeGoal: {
            __typename: 'VolumeGoalPeriod',
            id: existingId,
            focusPreset: variables.focusPreset,
            commitment: variables.commitment,
            startedAt: now,
            endedAt: null,
          },
        },
      }
    },
    onSuccess: () => {
      // Always refetch to ensure server is the source of truth
      queryClient.invalidateQueries({ queryKey })
      // Recalculate weekly targets
      queryClient.invalidateQueries({ queryKey: ['WeeklyMuscleProgress'] })
    },
  })

  const setGoal = (focusPreset: string, commitment: string) => {
    const hasCache = Boolean(
      queryClient.getQueryData<GQLCurrentVolumeGoalQuery>(queryKey),
    )

    if (!hasCache) {
      // Still perform the mutation even if we can't optimistically update yet.
      setGoalMutation.mutate({ focusPreset, commitment })
      return
    }

    setGoalOptimistic({ focusPreset, commitment }).catch(() => {
      // Error handling (rollback) is handled in useOptimisticMutation
    })
  }

  // Calculate duration since goal started
  const getDurationWeeks = (): number => {
    if (!currentGoal?.startedAt) return 0
    const startDate = new Date(currentGoal.startedAt)
    const now = new Date()
    const diffMs = now.getTime() - startDate.getTime()
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
    return diffWeeks
  }

  return {
    currentGoal,
    currentPreset,
    isLoading,
    isSettingGoal: setGoalMutation.isPending,
    setGoal,
    getDurationWeeks,
  }
}
