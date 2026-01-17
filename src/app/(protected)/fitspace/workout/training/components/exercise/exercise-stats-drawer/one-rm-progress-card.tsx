'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { StatsItem } from '@/components/stats-item'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
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
    <Card variant="secondary" className="p-0 overflow-hidden shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
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
      </CardHeader>

      <CardContent className="p-0">
        <ChartContainer
          id={`exercise-1rm-${chartId}`}
          config={chartConfig}
          className="w-full h-[180px] bg-card dark:bg-black/40 py-4"
        >
          {oneRmSeries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No 1RM logs yet
            </div>
          ) : (
            <LineChart
              data={oneRmSeries}
              margin={{ top: 10, right: 30, left: 0, bottom: 12 }}
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
                width={34}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [
                  `${formatNumber(value as number, 1)} ${weightUnit}`,
                ]}
              />
              <Line
                type="monotone"
                dataKey="oneRM"
                stroke="var(--color-oneRM)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
