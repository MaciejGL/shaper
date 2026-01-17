'use client'

import { BarChart4 } from 'lucide-react'
import type { ReactElement } from 'react'
import { useId, useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { useExerciseStatsQuery } from './data'
import { ExerciseStatsHeader } from './exercise-stats-header'
import { ExerciseStatsPeriodTabs } from './exercise-stats-period-tabs'
import { OneRmProgressCard } from './one-rm-progress-card'
import { RepMaxSuggestionsCard } from './rep-max-suggestions-card'
import type { TimePeriod } from './types'
import { useExerciseStats } from './use-exercise-stats'
import { WeeklyVolumeCard } from './weekly-volume-card'

export function ExerciseStatsDrawer({
  baseExerciseId,
  exerciseName,
  trigger,
}: {
  baseExerciseId: string
  exerciseName: string
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

          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[calc(var(--safe-area-inset-bottom)+24px)] space-y-4">
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

            <RepMaxSuggestionsCard
              latestOneRMKg={latestOneRMKg}
              weightUnit={weightUnit}
              suggestions={repMaxSuggestions}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
