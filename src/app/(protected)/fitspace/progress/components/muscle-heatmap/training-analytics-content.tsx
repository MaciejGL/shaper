'use client'

import { ChevronsDownIcon, ChevronsUpIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TRACKED_DISPLAY_GROUPS } from '@/config/muscles'
import { cn } from '@/lib/utils'

import type { TrainingAnalytics as TrainingAnalyticsType } from './analytics-types'

const SHOW_ALL_RECOVERY_THRESHOLD = 10

interface TrainingAnalyticsContentProps {
  analytics: TrainingAnalyticsType
}

export function TrainingAnalyticsContent({
  analytics,
}: TrainingAnalyticsContentProps) {
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

  const hasMoreRecovery = orderedRecovery.length > SHOW_ALL_RECOVERY_THRESHOLD
  const visibleRecovery = showAllRecovery
    ? orderedRecovery
    : orderedRecovery.slice(0, SHOW_ALL_RECOVERY_THRESHOLD)

  return (
    <div className="space-y-5">
      {/* AI Insight - only shown when there's something notable */}
      {/* {analytics.insight && (
        <div className="py-3 px-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {analytics.insight}
          </p>
        </div>
      )} */}

      {/* Strong / Needs Work */}
      {(analytics.strong.length > 0 || analytics.needsWork.length > 0) && (
        <div className="space-y-4">
          {analytics.strong.length > 0 && (
            <div className="space-y-2 rounded-xl p-3 shadow-md outline outline-border dark:outline-muted">
              <p className="text-sm text-amber-600 dark:text-amber-500 font-semibold">
                Worked hardest
              </p>
              <div className="flex flex-wrap gap-1">
                {analytics.strong.map((m) => (
                  <Badge
                    key={m}
                    variant="secondary"
                    size="lg"
                    className="bg-amber-100 dark:bg-amber-900/30"
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {analytics.needsWork.length > 0 && (
            <div className="space-y-2 rounded-xl p-3 shadow-md outline outline-border dark:outline-muted">
              <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                Ready to train more
              </p>
              <div className="flex flex-wrap gap-1">
                {analytics.needsWork.map((m) => (
                  <Badge
                    key={m}
                    variant="secondary"
                    size="lg"
                    className="bg-green-100 dark:bg-green-900/30"
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recovery */}
      {orderedRecovery.length > 0 && (
        <div>
          <p className="text-base font-medium mb-3">Recovery Status</p>

          <AnimateChangeInHeight>
            <div className="rounded-xl border bg-card divide-y divide-border">
              {visibleRecovery.map((r) => (
                <div
                  key={r.muscle}
                  className="flex items-center justify-between gap-4 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-base font-semibold truncate">
                      {r.muscle}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-4">
                    <p className="text-xs font-medium text-right">
                      <RecoveryLabel percentRecovered={r.percentRecovered} />
                    </p>
                    <RecoveryDots percentRecovered={r.percentRecovered} />
                  </div>
                </div>
              ))}
            </div>
          </AnimateChangeInHeight>

          {hasMoreRecovery && (
            <div className="flex justify-center mt-2">
              <Button
                variant="ghost"
                size="sm"
                iconEnd={
                  showAllRecovery ? (
                    <ChevronsUpIcon className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronsDownIcon className="size-4 text-muted-foreground" />
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

function RecoveryDots({ percentRecovered }: { percentRecovered: number }) {
  // 5 dots based on percent recovered (0-100%)
  // Each dot = 20% of recovery
  const recoveredDots = Math.max(
    0,
    Math.min(5, Math.floor((percentRecovered / 100) * 5)),
  )

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
