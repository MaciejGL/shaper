'use client'

import { BarChart4 } from 'lucide-react'
import type { ReactElement } from 'react'
import { useId, useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import type { GQLEquipment } from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { useExerciseStatsQuery } from './data'
import { ExerciseStatsHeader } from './exercise-stats-header'
import { ExerciseStatsPeriodTabs } from './exercise-stats-period-tabs'
import { OneRmProgressCard } from './one-rm-progress-card'
import { RepMaxGrid } from './rep-max-grid'
import type { TimePeriod } from './types'
import { useExerciseStats } from './use-exercise-stats'
import { WeeklyVolumeCard } from './weekly-volume-card'
import { WorkoutSuggestionsList } from './workout-suggestions-list'

export function ExerciseStatsDrawer({
  baseExerciseId,
  exerciseName,
  equipment,
  sets,
  previousLogs,
  trigger,
  onApplySuggested,
  isApplyingSuggested,
}: {
  baseExerciseId: string
  exerciseName: string
  equipment?: GQLEquipment | null
  sets?: {
    setId: string
    order: number
    minReps: number | null
    maxReps: number | null
    loggedWeightKg?: number | null
  }[]
  previousLogs?:
    | {
        order: number
        log?: { reps?: number | null; weight?: number | null } | null
      }[]
    | null
  trigger?: ReactElement
  onApplySuggested?: (
    suggestions: { setId: string; suggestedWeightKg: number }[],
  ) => Promise<void>
  isApplyingSuggested?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('3months')
  const chartId = useId().replace(/:/g, '')

  const { hasPremium } = useUser()
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
    volumeChangePercent,
    volumeSeries,
    latestOneRMKg,
    repMaxSuggestions,
    lastPerformedLabel,
  } = useExerciseStats({
    exercise,
    timePeriod,
    toDisplayWeight,
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

      <DrawerContent
        dialogTitle="Exercise stats"
        className="max-h-[92vh] "
        grabberAbsolute
      >
        <div className="flex flex-col min-h-0 pt-4">
          <ExerciseStatsHeader
            exerciseName={exerciseName}
            lastPerformedLabel={lastPerformedLabel}
          />

          <div className="flex-1 px-4 pb-[calc(var(--safe-area-inset-bottom)+24px)] space-y-10 overflow-y-auto hide-scrollbar pt-4">
            {sets?.length ? (
              <WorkoutSuggestionsList
                sets={sets}
                previousLogs={previousLogs ?? null}
                weightUnit={weightUnit}
                toDisplayWeight={toDisplayWeight}
                equipment={equipment ?? null}
                onApplySuggested={onApplySuggested}
                isApplyingSuggested={isApplyingSuggested}
                hasPremium={hasPremium}
              />
            ) : null}

            <div>
              <div className="flex items-center justify-between pb-4">
                <p className="text-lg font-medium">Progress</p>

                <ExerciseStatsPeriodTabs
                  timePeriod={timePeriod}
                  onTimePeriodChange={setTimePeriod}
                />
              </div>

              {isLoading ? <LoadingSkeleton variant="lg" count={2} /> : null}
              <div className="pb-6">
                <OneRmProgressCard
                  chartId={chartId}
                  chartConfig={chartConfig}
                  oneRmSeries={oneRmSeries}
                  currentOneRM={currentOneRM}
                  oneRmChangePercent={oneRmChangePercent}
                  weightUnit={weightUnit}
                  sessionsCount={oneRmSeries.length}
                  hasPremium={hasPremium}
                />
              </div>
              <WeeklyVolumeCard
                chartId={chartId}
                chartConfig={chartConfig}
                volumeSeries={volumeSeries}
                lastWeekVolume={lastWeekVolume}
                volumeChangePercent={volumeChangePercent}
                weightUnit={weightUnit}
                hasPremium={hasPremium}
              />
            </div>
            <RepMaxGrid
              latestOneRMKg={latestOneRMKg}
              weightUnit={weightUnit}
              suggestions={repMaxSuggestions}
              hasPremium={hasPremium}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
