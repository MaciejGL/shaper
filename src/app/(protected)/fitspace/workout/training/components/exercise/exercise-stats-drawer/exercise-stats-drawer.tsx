'use client'

import { BarChart4 } from 'lucide-react'
import type { ReactElement } from 'react'
import { useId, useState } from 'react'
import { useMemo } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn, formatNumber } from '@/lib/utils'

import { useExerciseStatsQuery } from './data'
import { ExerciseStatsHeader } from './exercise-stats-header'
import { ExerciseStatsPeriodTabs } from './exercise-stats-period-tabs'
import { OneRmProgressCard } from './one-rm-progress-card'
import { RepMaxSuggestionsCard } from './rep-max-suggestions-card'
import type { TimePeriod } from './types'
import { useExerciseStats } from './use-exercise-stats'
import { WeeklyVolumeCard } from './weekly-volume-card'

function ExerciseStatsSuggestionsHero({
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

  const hasAnyIncrease = rows.some((r) => r.shouldIncrease)

  return (
    <Card
      variant="secondary"
      className={cn(
        'p-0 overflow-hidden bg-linear-to-br! from-primary/10 via-card/60 to-card/40 backdrop-blur-sm',
        'dark:from-primary/10 dark:via-card/60 dark:to-card/40',
        '-mx-4 rounded-none shadow-none border-t-none border-x-none border-border',
      )}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-medium">Workout suggestions</p>
          <Badge variant={hasAnyIncrease ? 'primary' : 'secondary'} size="sm">
            {hasAnyIncrease
              ? `Try +${formatNumber(stepDisplay, 1)}${weightUnit}`
              : 'Match last session'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.order} className="px-4 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-medium tabular-nums shrink-0">
                      Set {r.order}
                    </p>
                    {r.range ? (
                      <p className="text-xs text-muted-foreground truncate">
                        {r.range} reps
                      </p>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                    {typeof r.prevReps === 'number' &&
                    typeof r.prevWeight === 'number'
                      ? `Last: ${r.prevReps} × ${formatNumber(r.prevWeight, 1)}${weightUnit}`
                      : 'Last: -'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {typeof r.suggested === 'number' ? (
                    <p className="text-sm font-semibold tabular-nums">
                      {formatNumber(r.suggested, 1)}
                      {weightUnit}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">-</p>
                  )}
                  {r.shouldIncrease ? (
                    <Badge variant="info" size="sm" className="tabular-nums">
                      +{formatNumber(stepDisplay, 1)}
                      {weightUnit}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ExerciseStatsDrawer({
  baseExerciseId,
  exerciseName,
  sets,
  previousLogs,
  trigger,
}: {
  baseExerciseId: string
  exerciseName: string
  sets?: { order: number; minReps: number | null; maxReps: number | null }[]
  previousLogs?:
    | {
        order: number
        log?: { reps?: number | null; weight?: number | null } | null
      }[]
    | null
  trigger?: ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('3months')
  const chartId = useId().replace(/:/g, '')

  const { weightUnit, toDisplayWeight } = useWeightConversion()
  const { exercise, isLoading } = useExerciseStatsQuery({
    baseExerciseId,
    open,
  })

  const {
    currentOneRM,
    oneRmChangePercent,
    oneRmSeries,
    lastWeekVolume,
    weekOverWeekChangePercent,
    volumeSeries,
    latestOneRMKg,
    repMaxSuggestions,
    lastPerformedLabel,
  } = useExerciseStats({
    exercise,
    timePeriod,
    toDisplayWeight,
    weightUnit,
  })

  const chartConfig = {
    oneRM: { label: `1RM (${weightUnit})`, color: 'var(--chart-1)' },
    volume: { label: `Volume (${weightUnit})`, color: 'var(--chart-2)' },
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild suppressHydrationWarning>
        {trigger ? (
          trigger
        ) : (
          <Button variant="secondary" size="icon-md" iconOnly={<BarChart4 />} />
        )}
      </DrawerTrigger>

      <DrawerContent dialogTitle="Exercise stats" className="max-h-[92vh]">
        <div className="flex flex-col min-h-0">
          <ExerciseStatsHeader
            exerciseName={exerciseName}
            lastPerformedLabel={lastPerformedLabel}
          />

          <div className="flex-1 overflow-y-auto px-4 pb-[calc(var(--safe-area-inset-bottom)+24px)] space-y-4">
            {sets?.length ? (
              <ExerciseStatsSuggestionsHero
                sets={sets}
                previousLogs={previousLogs ?? null}
                weightUnit={weightUnit}
                toDisplayWeight={toDisplayWeight}
              />
            ) : null}

            <RepMaxSuggestionsCard
              latestOneRMKg={latestOneRMKg}
              weightUnit={weightUnit}
              suggestions={repMaxSuggestions}
            />

            <ExerciseStatsPeriodTabs
              timePeriod={timePeriod}
              onTimePeriodChange={setTimePeriod}
            />

            {isLoading ? <LoadingSkeleton variant="lg" count={2} /> : null}

            <OneRmProgressCard
              chartId={chartId}
              chartConfig={chartConfig}
              oneRmSeries={oneRmSeries}
              currentOneRM={currentOneRM}
              oneRmChangePercent={oneRmChangePercent}
              weightUnit={weightUnit}
              sessionsCount={exercise?.estimated1RMProgress?.length ?? 0}
            />

            <WeeklyVolumeCard
              chartId={chartId}
              chartConfig={chartConfig}
              volumeSeries={volumeSeries}
              lastWeekVolume={lastWeekVolume}
              weekOverWeekChangePercent={weekOverWeekChangePercent}
              weightUnit={weightUnit}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
