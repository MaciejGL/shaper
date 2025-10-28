import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  useClientHasActiveCoachingSubscriptionQuery,
  useGetClientsQuery,
  useRemoveClientMutation,
} from '@/generated/graphql-client'

export function useRemoveClient(clientId: string) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Check if client has active coaching subscription
  const { data: subscriptionData, isLoading: isCheckingSubscription } =
    useClientHasActiveCoachingSubscriptionQuery(
      { clientId },
      {
        staleTime: 0, // Always fetch fresh data
        refetchOnWindowFocus: true,
      },
    )

  const hasActiveSubscription =
    subscriptionData?.clientHasActiveCoachingSubscription ?? false

  // Remove client mutation
  const { mutate: removeClient, isPending: isRemoving } =
    useRemoveClientMutation({
      onSuccess: () => {
        // Invalidate queries to refresh client list
        queryClient.invalidateQueries({
          queryKey: useGetClientsQuery.getKey({}),
        })

        toast.success('Client removed successfully')
        router.push('/trainer/clients')
      },
      onError: (error: Error) => {
        toast.error(
          error.message || 'Failed to remove client. Please try again.',
        )
      },
    })

  const handleRemoveClient = () => {
    removeClient({ clientId })
  }

  return {
    hasActiveSubscription,
    isCheckingSubscription,
    isRemoving,
    canRemoveClient: !hasActiveSubscription && !isCheckingSubscription,
    handleRemoveClient,
  }
}
