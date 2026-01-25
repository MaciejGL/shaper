'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

import { OneRmBarChart } from '@/components/exercise-stats/one-rm-bar-chart'
import { StatsItem } from '@/components/stats-item'
import { ChartConfig } from '@/components/ui/chart'
import { formatNumber } from '@/lib/utils'

export function OneRmProgressCard({
  chartId,
  chartConfig,
  oneRmSeries,
  currentOneRM,
  oneRmChangePercent,
  weightUnit,
  sessionsCount,
}: {
  chartId: string
  chartConfig: ChartConfig
  oneRmSeries: { label: string; oneRM: number }[]
  currentOneRM: number
  oneRmChangePercent: number
  weightUnit: 'kg' | 'lbs'
  sessionsCount: number
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">1RM progress</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {sessionsCount ? `${sessionsCount} sessions` : 'No data'}
          </p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <StatsItem
            label="Current 1RM"
            value={
              <span className="tabular-nums">
                {formatNumber(currentOneRM, 1)} {weightUnit}
              </span>
            }
            icon={<TrendingUp className="size-4 text-amber-500" />}
          />
          <StatsItem
            label="Change"
            value={
              <span className="tabular-nums">
                {formatNumber(oneRmChangePercent, 1)}%
              </span>
            }
            icon={
              oneRmChangePercent > 0 ? (
                <TrendingUp className="size-4 text-green-500" />
              ) : oneRmChangePercent < 0 ? (
                <TrendingDown className="size-4 text-red-500" />
              ) : (
                <TrendingUp className="size-4 text-muted-foreground" />
              )
            }
          />
        </div>
      </div>

      <OneRmBarChart
        id={`exercise-1rm-${chartId}`}
        series={oneRmSeries}
        weightUnit={weightUnit}
        chartConfig={chartConfig}
      />
    </div>
  )
}
