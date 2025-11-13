import { useQueryClient } from '@tanstack/react-query'
import { differenceInDays } from 'date-fns'
import { toast } from 'sonner'

import { useUser } from '@/context/user-context'
import {
  GQLGetCheckinStatusQuery,
  useBodyMeasuresQuery,
  useCompleteCheckinMutation,
  useCreateCheckinScheduleMutation,
  useDeleteCheckinScheduleMutation,
  useGetCheckinStatusQuery,
  useGetUserBodyProgressLogsQuery,
  useSkipCheckinMutation,
  useUpdateCheckinScheduleMutation,
} from '@/generated/graphql-client'

export function useCheckinStatus() {
  return useGetCheckinStatusQuery(
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
  )
}

export function useCheckinScheduleOperations() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const queryKey = useGetCheckinStatusQuery.getKey({})

  const createScheduleMutation = useCreateCheckinScheduleMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update UI immediately
      queryClient.setQueryData<GQLGetCheckinStatusQuery>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          checkinStatus: {
            ...old.checkinStatus,
            hasSchedule: true,
            schedule: {
              id: 'temp-id',
              frequency: variables.input.frequency,
              dayOfWeek: variables.input.dayOfWeek,
              dayOfMonth: variables.input.dayOfMonth,
              isActive: true,
              nextCheckinDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completions: [],
            },
          },
        }
      })

      return { previousData }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to create check-in schedule. Please try again.')
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const updateScheduleMutation = useUpdateCheckinScheduleMutation({
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: GQLGetCheckinStatusQuery) => {
        if (!old?.checkinStatus?.schedule) return old
        return {
          ...old,
          checkinStatus: {
            ...old.checkinStatus,
            schedule: {
              ...old.checkinStatus.schedule,
              ...variables.input,
              updatedAt: new Date().toISOString(),
            },
          },
        }
      })

      return { previousData }
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to update check-in schedule. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteScheduleMutation = useDeleteCheckinScheduleMutation({
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: GQLGetCheckinStatusQuery) => {
        if (!old) return old
        return {
          ...old,
          checkinStatus: {
            hasSchedule: false,
            schedule: null,
            nextCheckinDate: null,
            isCheckinDue: false,
            daysSinceLastCheckin: null,
          },
        }
      })

      return { previousData }
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to delete check-in schedule. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const completeCheckinMutation = useCompleteCheckinMutation({
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically add completion
      queryClient.setQueryData(queryKey, (old: GQLGetCheckinStatusQuery) => {
        if (!old?.checkinStatus?.schedule) return old

        const newCompletion = {
          id: `temp-${Date.now()}`,
          completedAt: new Date().toISOString(),
          measurement: variables.input.measurementData
            ? {
                id: 'temp-measurement',
                weight: variables.input.measurementData.weight,
                measuredAt: new Date().toISOString(),
              }
            : null,
          progressLog: variables.input.progressLogData
            ? {
                id: 'temp-progress-log',
                loggedAt: new Date().toISOString(),
              }
            : null,
        }

        return {
          ...old,
          checkinStatus: {
            ...old.checkinStatus,
            schedule: {
              ...old.checkinStatus.schedule,
              completions: [
                newCompletion,
                ...old.checkinStatus.schedule.completions,
              ],
            },
            isCheckinDue: false,
            daysSinceLastCheckin: 0,
          },
        }
      })

      return { previousData }
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to complete check-in. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      // Also invalidate body measurements and progress logs to refresh the sections
      queryClient.invalidateQueries({
        queryKey: useBodyMeasuresQuery.getKey({}),
      })
      queryClient.invalidateQueries({
        queryKey: useGetUserBodyProgressLogsQuery.getKey({
          userProfileId: user?.profile?.id || '',
        }),
      })
    },
  })

  const skipCheckinMutation = useSkipCheckinMutation({
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old: GQLGetCheckinStatusQuery) => {
        if (!old?.checkinStatus?.schedule) return old

        const newCompletion = {
          id: `temp-${Date.now()}`,
          completedAt: new Date().toISOString(),
          measurement: null,
          progressLog: null,
        }

        return {
          ...old,
          checkinStatus: {
            ...old.checkinStatus,
            schedule: {
              ...old.checkinStatus.schedule,
              completions: [
                newCompletion,
                ...old.checkinStatus.schedule.completions,
              ],
            },
            isCheckinDue: false,
            daysSinceLastCheckin: 0,
          },
        }
      })

      return { previousData }
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to skip check-in. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    createSchedule: createScheduleMutation.mutate,
    updateSchedule: updateScheduleMutation.mutate,
    deleteSchedule: deleteScheduleMutation.mutate,
    completeCheckin: completeCheckinMutation.mutate,
    skipCheckin: skipCheckinMutation.mutate,
    isCreating: createScheduleMutation.isPending,
    isUpdating: updateScheduleMutation.isPending,
    isDeleting: deleteScheduleMutation.isPending,
    isCompleting: completeCheckinMutation.isPending,
    isSkipping: skipCheckinMutation.isPending,
  }
}

export function isCheckinWithinThreeDays(
  nextCheckinDate: string | null,
): boolean {
  if (!nextCheckinDate) return false
  const daysUntil = differenceInDays(new Date(nextCheckinDate), new Date())
  return daysUntil >= 0 && daysUntil <= 3
}
