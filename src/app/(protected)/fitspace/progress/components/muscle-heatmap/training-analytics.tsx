'use client'

import { Button } from '@/components/ui/button'

import { TrainingAnalytics as TrainingAnalyticsType } from './analytics-types'
import { TrainingAnalyticsContent } from './training-analytics-content'
import { useTrainingAnalytics } from './use-training-analytics'

// function CrushingItBanner() {
//   return (
//     <div className="py-3 px-4 rounded-lg bg-green-500/10 border border-green-500/20">
//       <p className="text-sm text-green-700 dark:text-green-300 font-medium text-center">
//         You&apos;re crushing it this week!
//       </p>
//     </div>
//   )
// }

export function TrainingAnalytics() {
  const { analytics, isLoading, error, refetch, hasPremium } =
    useTrainingAnalytics()

  // Don't render anything for non-premium users
  if (!hasPremium) {
    return null
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (!analytics && !isLoading) {
    return null
  }
  const fallbackNullAnalytics: TrainingAnalyticsType = {
    totalSets: 0,
    trendPercent: 0,
    strong: [],
    needsWork: [],
    insight: null,
    status: 'empty',
    recovery: [],
  }
  return (
    <TrainingAnalyticsContent analytics={analytics ?? fallbackNullAnalytics} />
  )
}
