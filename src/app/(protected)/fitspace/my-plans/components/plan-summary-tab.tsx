import { LoaderIcon } from 'lucide-react'

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
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <LoaderIcon className="size-8 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Loading Your Summary</h3>
          <p className="text-sm text-muted-foreground">
            Calculating your progress...
          </p>
        </div>
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
    <div className="space-y-6 py-4">
      {/* Journey Overview - Always show */}
      <JourneyOverview summary={summary} />

      {/* Strength Progress - Show if data available */}
      {summary.strengthProgress.length > 0 && (
        <StrengthProgress summary={summary} />
      )}

      {/* Body Composition - Show if data available */}
      {summary.bodyComposition && <BodyComposition summary={summary} />}

      {/* Personal Records - Show if data available */}
      {summary.personalRecords.length > 0 && (
        <PersonalRecords summary={summary} />
      )}

      {/* Empty state if no progress data */}
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
