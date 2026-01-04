'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { TrainingAnalyticsContent } from './training-analytics-content'
import { useTrainingAnalytics } from './use-training-analytics'

function AnalyticsSkeleton() {
  return (
    <div className="space-y-5 p-4 rounded-xl border bg-card">
      <div>
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-28 mb-1" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full" />
        ))}
      </div>
    </div>
  )
}

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

  if (isLoading) {
    return <AnalyticsSkeleton />
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

  if (!analytics) {
    return null
  }
  return <TrainingAnalyticsContent analytics={analytics} />
  // return <AnalyticsContent analytics={analytics} />
}
