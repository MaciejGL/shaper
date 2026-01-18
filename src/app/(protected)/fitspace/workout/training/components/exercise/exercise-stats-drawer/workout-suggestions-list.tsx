'use client'

import { ArrowUpRight } from 'lucide-react'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn, formatNumber } from '@/lib/utils'

export function WorkoutSuggestionsList({
  sets,
  previousLogs,
  weightUnit,
  toDisplayWeight,
}: {
  sets: { order: number; minReps: number | null; maxReps: number | null }[]
  previousLogs:
    | {
        order: number
        log?: { reps?: number | null; weight?: number | null } | null
      }[]
    | null
  weightUnit: 'kg' | 'lbs'
  toDisplayWeight: (weightKg: number | null | undefined) => number | null
}) {
  const stepDisplay = weightUnit === 'lbs' ? 5 : 2.5
  const stepKg = weightUnit === 'lbs' ? stepDisplay / 2.2046226218 : stepDisplay

  const rows = useMemo(() => {
    return sets
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => {
        const prev = previousLogs?.find((p) => p.order === s.order) ?? null
        const prevReps = prev?.log?.reps ?? null
        const prevWeightKg = prev?.log?.weight ?? null
        const max = typeof s.maxReps === 'number' ? s.maxReps : null
        const min = typeof s.minReps === 'number' ? s.minReps : null

        const shouldIncrease =
          typeof prevReps === 'number' &&
          typeof prevWeightKg === 'number' &&
          (max ? prevReps >= max : min ? prevReps >= min : false)

        const suggestedKg =
          typeof prevWeightKg === 'number'
            ? prevWeightKg + (shouldIncrease ? stepKg : 0)
            : null

        return {
          order: s.order,
          range:
            min && max
              ? min === max
                ? `${min}`
                : `${min}-${max}`
              : min
                ? `${min}+`
                : max
                  ? `1-${max}`
                  : null,
          prevReps,
          prevWeight: toDisplayWeight(prevWeightKg),
          suggested: toDisplayWeight(suggestedKg),
          shouldIncrease,
        }
      })
  }, [previousLogs, sets, stepKg, toDisplayWeight])

  if (rows.length === 0) return null

  const hasAnyIncrease = rows.some((r) => r.shouldIncrease)

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium">Suggested Load</p>
        {hasAnyIncrease && (
          <Badge
            variant="primary"
            size="sm"
            className="bg-primary/10 text-primary border-primary/20"
          >
            <ArrowUpRight className="size-3 mr-1" />
            Increase Weights
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <Card
            key={row.order}
            className={cn(
              'grid grid-cols-[auto_1fr_auto] items-center gap-4',
              'transition-colors shadow-none p-1 pr-3',
            )}
          >
            {/* Set Indicator */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-background border border-border/50 size-14">
              <span className="text-[10px] uppercase text-muted-foreground font-bold">
                Set
              </span>
              <span className="text-base font-bold">{row.order}</span>
            </div>

            {/* Main Stats */}
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                {typeof row.suggested === 'number' ? (
                  <span className="text-xl font-bold tracking-tight">
                    {formatNumber(row.suggested, 1)}
                    <span className="text-sm font-medium text-muted-foreground ml-0.5">
                      {weightUnit}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
                {row.range && (
                  <span className="text-sm font-medium text-muted-foreground/80">
                    × {row.range}
                  </span>
                )}
              </div>

              {/* Previous Stats Comparison */}
              {/* <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground">Last:</span>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {typeof row.prevReps === 'number' &&
                  typeof row.prevWeight === 'number'
                    ? `${formatNumber(row.prevWeight, 1)}${weightUnit} × ${row.prevReps}`
                    : '-'}
                </span>
              </div> */}
            </div>

            {/* Change Indicator */}
            <div className="text-right">
              {row.shouldIncrease ? (
                <div className="flex flex-col items-end">
                  <Badge
                    variant="primary"
                    className="h-6 px-1.5 bg-green-500/15 text-green-600 dark:text-green-500 hover:bg-green-500/25 border-transparent"
                  >
                    <ArrowUpRight className="size-3 mr-0.5" />+
                    {formatNumber(stepDisplay, 1)} {weightUnit}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground/50">
                  <span className="text-xs font-medium">Match</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
