import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { useFitspaceClearWorkoutDayMutation } from '@/generated/graphql-client'

export function useClearWorkoutDay(dayId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useFitspaceClearWorkoutDayMutation({
    onSuccess: async (data) => {
      console.info('✅ Clear workout successful for dayId:', dayId, data)

      // Invalidate all Quick Workout related queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['navigation'] }),
        queryClient.invalidateQueries({
          queryKey: ['FitspaceGetQuickWorkoutNavigation'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['FitspaceGetQuickWorkoutDay'],
        }),
        queryClient.invalidateQueries({ queryKey: ['GetQuickWorkoutPlan'] }),
      ])

      console.info('✅ Queries invalidated, refetching...')

      // Refetch to ensure fresh data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['navigation'] }),
        queryClient.refetchQueries({
          queryKey: ['FitspaceGetQuickWorkoutDay'],
        }),
      ])

      console.info('✅ Refetch complete, refreshing router...')

      // Refresh the page to show empty state
      router.refresh()
    },
    onError: (error) => {
      console.error('❌ Clear workout failed for dayId:', dayId, error)
    },
  })
}
