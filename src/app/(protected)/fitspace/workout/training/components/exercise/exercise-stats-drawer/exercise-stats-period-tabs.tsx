'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { TimePeriod } from './types'

export function ExerciseStatsPeriodTabs({
  timePeriod,
  onTimePeriodChange,
}: {
  timePeriod: TimePeriod
  onTimePeriodChange: (timePeriod: TimePeriod) => void
}) {
  return (
    <div className="flex justify-center pt-1">
      <Tabs value={timePeriod} onValueChange={(v) => onTimePeriodChange(v as TimePeriod)}>
        <TabsList variant="secondary" rounded="full" size="sm">
          <TabsTrigger rounded="full" value="1month" size="sm">
            1M
          </TabsTrigger>
          <TabsTrigger rounded="full" value="3months" size="sm">
            3M
          </TabsTrigger>
          <TabsTrigger rounded="full" value="6months" size="sm">
            6M
          </TabsTrigger>
          <TabsTrigger rounded="full" value="1year" size="sm">
            1Y
          </TabsTrigger>
          <TabsTrigger rounded="full" value="all" size="sm">
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

