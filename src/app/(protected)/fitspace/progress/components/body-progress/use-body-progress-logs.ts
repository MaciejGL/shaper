'use client'

import { useQueryClient } from '@tanstack/react-query'
import { isNil } from 'lodash'
import { toast } from 'sonner'

import { useUser } from '@/context/user-context'
import {
  type GQLGetUserBodyProgressLogsQuery,
  GQLMutationUpdateBodyProgressLogArgs,
  useCreateBodyProgressLogMutation,
  useDeleteBodyProgressLogMutation,
  useGetUserBodyProgressLogsQuery,
  useUpdateBodyProgressLogMutation,
  useUpdateBodyProgressLogSharingStatusMutation,
} from '@/generated/graphql-client'

// Input type for creating progress logs
type CreateBodyProgressLogInput = {
  loggedAt?: string
  image1Url?: string | null
  image2Url?: string | null
  image3Url?: string | null
  shareWithTrainer?: boolean
}

// Input type for updating progress logs
type UpdateBodyProgressLogInput = {
  loggedAt?: string
  image1Url?: string | null
  image2Url?: string | null
  image3Url?: string | null
  shareWithTrainer?: boolean
}

export function useBodyProgressLogs() {
  const { user } = useUser()
  const queryClient = useQueryClient()

  // Get the user's profile ID
  const userProfileId = user?.profile?.id

  // Query for fetching progress logs
  const { data, isLoading, error } = useGetUserBodyProgressLogsQuery(
    { userProfileId: userProfileId || '' },
    {
      enabled: !!userProfileId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  )

  const progressLogs = data?.userBodyProgressLogs || []

  // Get query key for invalidation
  const queryKey = useGetUserBodyProgressLogsQuery.getKey({
    userProfileId: userProfileId || '',
  })

  // Mutation for creating progress logs
  const createProgressLogMutation = useCreateBodyProgressLogMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update UI immediately
      const optimisticLog = {
        id: `temp-${Date.now()}`,
        loggedAt: variables.input.loggedAt || new Date().toISOString(),
        image1Url: variables.input.image1Url || null,
        image2Url: variables.input.image2Url || null,
        image3Url: variables.input.image3Url || null,
        shareWithTrainer: variables.input.shareWithTrainer || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData(
        queryKey,
        (old: GQLGetUserBodyProgressLogsQuery | undefined) => {
          if (!old) return { userBodyProgressLogs: [optimisticLog] }
          return {
            ...old,
            userBodyProgressLogs: [
              optimisticLog,
              ...(old.userBodyProgressLogs || []),
            ],
          }
        },
      )

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to create progress log. Please try again.')
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Mutation for updating progress logs
  const updateProgressLogMutation = useUpdateBodyProgressLogMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update UI immediately
      queryClient.setQueryData(
        queryKey,
        (old: GQLGetUserBodyProgressLogsQuery | undefined) => {
          if (!old) return { userBodyProgressLogs: [] }
          return {
            ...old,
            userBodyProgressLogs: (old.userBodyProgressLogs || []).map((log) =>
              log.id === variables.id
                ? {
                    ...log,
                    // Handle image updates and removals for optimistic UI
                    image1Url: variables.input.hasOwnProperty('image1Url')
                      ? variables.input.image1Url
                      : log.image1Url,
                    image2Url: variables.input.hasOwnProperty('image2Url')
                      ? variables.input.image2Url
                      : log.image2Url,
                    image3Url: variables.input.hasOwnProperty('image3Url')
                      ? variables.input.image3Url
                      : log.image3Url,
                    loggedAt: variables.input.loggedAt || log.loggedAt,
                    shareWithTrainer:
                      variables.input.shareWithTrainer !== undefined
                        ? variables.input.shareWithTrainer
                        : log.shareWithTrainer,
                    updatedAt: new Date().toISOString(),
                  }
                : log,
            ),
          }
        },
      )

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to update progress log. Please try again.')
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Mutation for deleting progress logs
  const deleteProgressLogMutation = useDeleteBodyProgressLogMutation({
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically remove from UI
      queryClient.setQueryData(
        queryKey,
        (old: GQLGetUserBodyProgressLogsQuery | undefined) => {
          if (!old) return { userBodyProgressLogs: [] }
          return {
            ...old,
            userBodyProgressLogs: (old.userBodyProgressLogs || []).filter(
              (log) => log.id !== variables.id,
            ),
          }
        },
      )

      return { previousData }
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to delete progress log. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Mutation for updating sharing status
  const updateSharingMutation = useUpdateBodyProgressLogSharingStatusMutation({
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update sharing status
      queryClient.setQueryData(
        queryKey,
        (old: GQLGetUserBodyProgressLogsQuery | undefined) => {
          if (!old) return { userBodyProgressLogs: [] }
          return {
            ...old,
            userBodyProgressLogs: (old.userBodyProgressLogs || []).map((log) =>
              log.id === variables.id
                ? { ...log, shareWithTrainer: variables.shareWithTrainer }
                : log,
            ),
          }
        },
      )

      return { previousData }
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast.error('Failed to update sharing status. Please try again.')
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.shareWithTrainer
          ? 'Progress log shared with trainer!'
          : 'Progress log unshared from trainer!',
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Helper function to prepare update input - only include non-null images
  const prepareUpdateInput = (input: {
    loggedAt?: string
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
    shareWithTrainer?: boolean
  }) => {
    const prepared = {
      loggedAt: input.loggedAt,
      shareWithTrainer: input.shareWithTrainer,
      image1Url: input.image1Url,
      image2Url: input.image2Url,
      image3Url: input.image3Url,
    } satisfies GQLMutationUpdateBodyProgressLogArgs['input']

    // Only include image fields that are not null
    if (!isNil(input.image1Url)) {
      prepared.image1Url = input.image1Url
    }
    if (!isNil(input.image2Url)) {
      prepared.image2Url = input.image2Url
    }
    if (!isNil(input.image3Url)) {
      prepared.image3Url = input.image3Url
    }

    return prepared
  }

  return {
    progressLogs,
    isLoading,
    error,
    // Actions
    createProgressLog: (input: CreateBodyProgressLogInput) =>
      createProgressLogMutation.mutate({
        input: {
          loggedAt: input.loggedAt,
          image1Url: input.image1Url || undefined,
          image2Url: input.image2Url || undefined,
          image3Url: input.image3Url || undefined,
          shareWithTrainer: input.shareWithTrainer,
        },
      }),
    updateProgressLog: (id: string, input: UpdateBodyProgressLogInput) =>
      updateProgressLogMutation.mutate({
        id,
        input: prepareUpdateInput(input),
      }),
    deleteProgressLog: (id: string) => deleteProgressLogMutation.mutate({ id }),
    updateSharingStatus: (id: string, shareWithTrainer: boolean) =>
      updateSharingMutation.mutate({ id, shareWithTrainer }),
    // Loading states
    isCreating: createProgressLogMutation.isPending,
    isUpdating: updateProgressLogMutation.isPending,
    isDeleting: deleteProgressLogMutation.isPending,
    isUpdatingSharing: updateSharingMutation.isPending,
    // Error states
    hasError: !!error,
    isAnyMutationLoading:
      createProgressLogMutation.isPending ||
      updateProgressLogMutation.isPending ||
      deleteProgressLogMutation.isPending ||
      updateSharingMutation.isPending,
  }
}
