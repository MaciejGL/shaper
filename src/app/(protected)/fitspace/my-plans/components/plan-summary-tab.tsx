import { LoadingSkeleton } from '@/components/loading-skeleton'
import { useGetPlanSummaryQuery } from '@/generated/graphql-client'

import { BodyComposition } from './summary/body-composition'
import { JourneyOverview } from './summary/journey-overview'
import { PersonalRecords } from './summary/personal-records'
import { StrengthProgress } from './summary/strength-progress'

interface PlanSummaryTabProps {
  planId: string
}

export function PlanSummaryTab({ planId }: PlanSummaryTabProps) {
  const { data, isLoading, error } = useGetPlanSummaryQuery(
    { planId },
    {
      enabled: !!planId,
      staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    },
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton variant="light" count={3} />
      </div>
    )
  }

  if (error || !data?.getPlanSummary) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Unable to Load Summary</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    )
  }

  const summary = data.getPlanSummary

  return (
    <div className="space-y-12 pb-4">
      <JourneyOverview summary={summary} />

      {summary.bodyComposition && <BodyComposition summary={summary} />}

      {summary.strengthProgress.length > 0 && (
        <StrengthProgress summary={summary} />
      )}

      {summary.personalRecords.length > 0 && (
        <PersonalRecords summary={summary} />
      )}

      {summary.strengthProgress.length === 0 &&
        !summary.bodyComposition &&
        summary.personalRecords.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              No progress data available yet. Complete more workouts to see your
              improvements!
            </p>
          </div>
        )}
    </div>
  )
}
