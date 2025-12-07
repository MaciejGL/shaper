import { useQueryClient } from '@tanstack/react-query'

import {
  useGetFreezeEligibilityQuery,
  usePauseMySubscriptionMutation,
  useResumeMySubscriptionMutation,
} from '@/generated/graphql-client'

export function useFreezeSubscription() {
  const queryClient = useQueryClient()

  const {
    data: eligibilityData,
    isLoading: isLoadingEligibility,
    error: eligibilityError,
  } = useGetFreezeEligibilityQuery()

  const pauseMutation = usePauseMySubscriptionMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useGetFreezeEligibilityQuery.getKey(),
      })
    },
  })

  const resumeMutation = useResumeMySubscriptionMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useGetFreezeEligibilityQuery.getKey(),
      })
    },
  })

  const pauseSubscription = async (days: number) => {
    return pauseMutation.mutateAsync({ days })
  }

  const resumeSubscription = async () => {
    return resumeMutation.mutateAsync({})
  }

  return {
    eligibility: eligibilityData?.getFreezeEligibility ?? null,
    isLoading: isLoadingEligibility,
    error: eligibilityError,
    pauseSubscription,
    resumeSubscription,
    isPausing: pauseMutation.isPending,
    isResuming: resumeMutation.isPending,
    pauseError: pauseMutation.error,
    resumeError: resumeMutation.error,
  }
}
