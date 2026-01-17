'use client'

import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { StatsItem } from '@/components/stats-item'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatNumber } from '@/lib/utils'

export function WeeklyVolumeCard({
  chartId,
  chartConfig,
  volumeSeries,
  lastWeekVolume,
  weekOverWeekChangePercent,
  weightUnit,
}: {
  chartId: string
  chartConfig: ChartConfig
  volumeSeries: { label: string; volume: number }[]
  lastWeekVolume: number
  weekOverWeekChangePercent: number
  weightUnit: 'kg' | 'lbs'
}) {
  return (
    <Card variant="secondary" className="overflow-hidden shadow-none p-0">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Weekly volume</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {volumeSeries.length ? `${volumeSeries.length} weeks` : 'No data'}
          </p>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <StatsItem
            label="Last week"
            value={
              <span className="tabular-nums">
                {formatNumber(lastWeekVolume, 0)} {weightUnit}
              </span>
            }
            icon={<BarChart3 className="size-4 text-blue-500" />}
          />
          <StatsItem
            label="WoW"
            value={
              <span className="tabular-nums">
                {formatNumber(weekOverWeekChangePercent, 1)}%
              </span>
            }
            icon={
              weekOverWeekChangePercent > 0 ? (
                <TrendingUp className="size-4 text-green-500" />
              ) : weekOverWeekChangePercent < 0 ? (
                <TrendingDown className="size-4 text-red-500" />
              ) : (
                <TrendingUp className="size-4 text-muted-foreground" />
              )
            }
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ChartContainer
          id={`exercise-volume-${chartId}`}
          config={chartConfig}
          className="w-full h-[180px] bg-card dark:bg-black/40 py-4"
        >
          {volumeSeries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No volume logs yet
            </div>
          ) : (
            <BarChart
              data={volumeSeries}
              margin={{ top: 10, right: 20, left: 0, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="2 2" opacity={0.4} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                height={10}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatNumber(v as number, 0)}
                width={46}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [
                  `${formatNumber(value as number, 0)} ${weightUnit}`,
                ]}
              />
              <Bar
                dataKey="volume"
                fill="var(--color-volume)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
