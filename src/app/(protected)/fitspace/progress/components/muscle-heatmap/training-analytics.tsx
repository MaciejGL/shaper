'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronsDownIcon, ChevronsUpIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TRACKED_DISPLAY_GROUPS } from '@/config/muscles'
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
            'size-2.5 rounded-full transition-colors',
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

const SHOW_ALL_RECOVERY_THRESHOLD = 10

function AnalyticsContent({ analytics }: { analytics: TrainingAnalyticsType }) {
  const [showAllRecovery, setShowAllRecovery] = useState(false)

  const orderedRecovery = useMemo(() => {
    const pinned = TRACKED_DISPLAY_GROUPS.slice(0, SHOW_ALL_RECOVERY_THRESHOLD)
    const pinnedRank = new Map<string, number>(pinned.map((m, i) => [m, i]))

    return [...analytics.recovery].sort((a, b) => {
      const aRank = pinnedRank.get(a.muscle)
      const bRank = pinnedRank.get(b.muscle)

      if (aRank != null && bRank != null) return aRank - bRank
      if (aRank != null) return -1
      if (bRank != null) return 1

      // For less common groups, keep the most relevant first (recently trained)
      return a.hours - b.hours
    })
  }, [analytics.recovery])

  // Empty state
  if (analytics.status === 'empty') {
    return <EmptyState />
  }

  const hasMoreRecovery = orderedRecovery.length > SHOW_ALL_RECOVERY_THRESHOLD
  const visibleRecovery = showAllRecovery
    ? orderedRecovery
    : orderedRecovery.slice(0, SHOW_ALL_RECOVERY_THRESHOLD)

  return (
    <div className="space-y-5">
      {/* Crushing it banner */}
      {/* {analytics.status === 'crushing_it' && <CrushingItBanner />} */}

      {/* AI Insight - only shown when there's something notable */}
      {analytics.insight && (
        <div className="py-3 px-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {analytics.insight}
          </p>
        </div>
      )}

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

      {/* Recovery */}
      {orderedRecovery.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Muscle recovery
          </p>
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence initial={false}>
              {visibleRecovery.map((r) => (
                <motion.div
                  key={r.muscle}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-1.5 border rounded-lg p-3"
                >
                  <span className="text-sm font-medium truncate flex-1">
                    {r.muscle}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <RecoveryDots percentRecovered={r.percentRecovered} />
                  </div>
                  <span className="text-xs font-medium text-left">
                    <RecoveryLabel percentRecovered={r.percentRecovered} />
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {hasMoreRecovery && (
            <div className="flex justify-center mt-2">
              <Button
                variant="ghost"
                size="icon-sm"
                iconOnly={
                  showAllRecovery ? (
                    <ChevronsUpIcon className="!size-5 text-muted-foreground" />
                  ) : (
                    <ChevronsDownIcon className="!size-5 text-muted-foreground" />
                  )
                }
                onClick={() => setShowAllRecovery((v) => !v)}
              >
                {showAllRecovery
                  ? 'Show fewer'
                  : `Show all (${orderedRecovery.length - SHOW_ALL_RECOVERY_THRESHOLD})`}
              </Button>
            </div>
          )}
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
