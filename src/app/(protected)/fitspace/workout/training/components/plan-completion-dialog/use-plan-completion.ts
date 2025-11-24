import { useGetPlanSummaryQuery } from '@/generated/graphql-client'

import { PlanCompletionData } from './types'

export function usePlanCompletion(planId: string | null) {
  const { data, isLoading } = useGetPlanSummaryQuery(
    { planId: planId! },
    {
      enabled: !!planId,
      staleTime: 5 * 60 * 1000,
    },
  )

  const completionData: PlanCompletionData | null = data?.getPlanSummary
    ? {
        adherence: data.getPlanSummary.adherence,
        workoutsCompleted: data.getPlanSummary.workoutsCompleted,
        totalWorkouts: data.getPlanSummary.totalWorkouts,
        totalVolumeLifted: data.getPlanSummary.totalVolumeLifted,
        totalPRsAchieved: data.getPlanSummary.totalPRsAchieved,
        duration: {
          weeks: data.getPlanSummary.duration.weeks,
          startDate: data.getPlanSummary.duration.startDate,
          endDate: data.getPlanSummary.duration.endDate,
        },
      }
    : null

  return {
    completionData,
    isLoading,
  }
}
