import { useQueryClient } from '@tanstack/react-query'

import { getVolumeGoalPresetById } from '@/config/volume-goals'
import {
  useCurrentVolumeGoalQuery,
  useSetVolumeGoalMutation,
} from '@/generated/graphql-client'
import { useUser } from '@/context/user-context'

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

  const { mutate: setGoalMutation, isPending: isSettingGoal } =
    useSetVolumeGoalMutation({
      onSuccess: () => {
        // Invalidate queries to refetch with new goal
        queryClient.invalidateQueries({
          queryKey: useCurrentVolumeGoalQuery.getKey({}),
        })
        // Also invalidate weekly progress to recalculate with new targets
        if (user?.id) {
          queryClient.invalidateQueries({
            queryKey: ['WeeklyMuscleProgress'],
          })
        }
      },
    })

  const setGoal = (focusPreset: string, commitment: string) => {
    setGoalMutation({ focusPreset, commitment })
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
    isSettingGoal,
    setGoal,
    getDurationWeeks,
  }
}
