'use client'

import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import type { TrainingAnalytics as TrainingAnalyticsType } from './analytics-types'
import { useTrainingAnalytics } from './use-training-analytics'

function RecoveryDots({ percentRecovered }: { percentRecovered: number }) {
  // 5 dots based on percent recovered (0-100%)
  // Each dot = 20% of recovery
  const recoveredDots = Math.min(5, Math.floor((percentRecovered / 100) * 5))

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'size-2 rounded-full transition-colors',
            i < recoveredDots ? 'bg-green-500' : 'bg-amber-500',
          )}
        />
      ))}
    </div>
  )
}

function RecoveryLabel({ percentRecovered }: { percentRecovered: number }) {
  if (percentRecovered >= 100)
    return <span className="text-green-600 dark:text-green-400">Ready</span>
  return <span className="text-amber-600 dark:text-amber-500">Recovering</span>
}

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

function EmptyState() {
  return (
    <div className="p-4 rounded-xl border bg-card text-center">
      <p className="text-sm text-muted-foreground">
        No workouts logged this week yet. Get moving!
      </p>
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

function AnalyticsContent({ analytics }: { analytics: TrainingAnalyticsType }) {
  const cappedTrend = Math.max(-200, Math.min(200, analytics.trendPercent))
  // Hide negative trends beyond -10% (week is incomplete, not meaningful)
  // Show positive trends and small negatives only
  const showTrend =
    analytics.trendPercent !== 0 && analytics.trendPercent >= -10

  const trendIcon =
    cappedTrend >= 0 ? (
      <TrendingUpIcon className="size-4 text-green-600 dark:text-green-400" />
    ) : (
      <TrendingDownIcon className="size-4 text-red-600 dark:text-red-400" />
    )

  const trendColor =
    cappedTrend >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'

  // Empty state
  if (analytics.status === 'empty') {
    return <EmptyState />
  }

  return (
    <div className="space-y-5">
      {/* Volume Summary */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          Sets this week
        </p>
        <p className="text-3xl font-bold tabular-nums">{analytics.totalSets}</p>
        {showTrend && (
          <p className={cn('text-sm flex items-center gap-1 mt-1', trendColor)}>
            {trendIcon}
            {cappedTrend > 0 ? '+' : ''}
            {cappedTrend}% vs your 4-week average
          </p>
        )}
      </div>

      {/* Crushing it banner */}
      {/* {analytics.status === 'crushing_it' && <CrushingItBanner />} */}

      {/* Strong / Needs Work */}
      {(analytics.strong.length > 0 || analytics.needsWork.length > 0) && (
        <div className="space-y-2">
          {analytics.strong.length > 0 && (
            <p className="text-sm">
              <span className="text-amber-600 dark:text-amber-500 font-medium">
                Worked hardest:{' '}
              </span>
              <span>{analytics.strong.join(', ')}</span>
            </p>
          )}
          {analytics.needsWork.length > 0 && (
            <p className="text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">
                Needs more volume:{' '}
              </span>
              <span>{analytics.needsWork.join(', ')}</span>
            </p>
          )}
        </div>
      )}

      {/* AI Insight - only shown when there's something notable */}
      {analytics.insight && (
        <div className="py-3 px-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {analytics.insight}
          </p>
        </div>
      )}

      {/* Recovery */}
      {analytics.recovery.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Muscle recovery
          </p>
          <div className="space-y-2">
            {analytics.recovery.slice(0, 8).map((r) => (
              <div
                key={r.muscle}
                className="flex items-center justify-between gap-3 py-1"
              >
                <span className="text-sm truncate flex-1">{r.muscle}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <RecoveryDots percentRecovered={r.percentRecovered} />
                  <span className="text-xs font-medium w-16 text-right">
                    <RecoveryLabel percentRecovered={r.percentRecovered} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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

  return <AnalyticsContent analytics={analytics} />
}
