'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'

import { StatsItem } from '@/components/stats-item'
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
  const gradientId = `exercise-1rm-gradient-${chartId}`

  const series = useMemo(() => {
    const TARGET_POINTS = 6

    if (oneRmSeries.length >= TARGET_POINTS) return oneRmSeries

    return [
      ...oneRmSeries,
      ...Array.from({ length: TARGET_POINTS - oneRmSeries.length }, () => ({
        label: '',
        oneRM: 0,
      })),
    ]
  }, [oneRmSeries])

  const showValuesOnXAxis = useMemo(() => {
    return oneRmSeries.length < 15
  }, [oneRmSeries])

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

      <div className="w-full bg-card-on-card dark:bg-black/40 py-4 rounded-2xl">
        <ChartContainer
          id={`exercise-1rm-${chartId}`}
          config={chartConfig}
          className="w-full h-[180px]"
        >
          {oneRmSeries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No 1RM logs yet
            </div>
          ) : (
            <BarChart
              data={series}
              margin={{ top: 10, right: 30, left: 0, bottom: 12 }}
              maxBarSize={34}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-orange-600)"
                    stopOpacity={0.95}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-yellow-300)"
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>

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
                tickFormatter={(v) => {
                  const n = typeof v === 'number' ? v : Number(v)
                  return Number.isFinite(n) ? formatNumber(n, 0) : ''
                }}
                width={34}
              />
              <ChartTooltip
                content={(props) => {
                  if (props.label === '') return null

                  return (
                    <ChartTooltipContent
                      active={props.active}
                      payload={props.payload}
                      label={props.label}
                    />
                  )
                }}
                formatter={(value) => {
                  const n = typeof value === 'number' ? value : Number(value)
                  return [
                    `${formatNumber(Number.isFinite(n) ? n : 0, 1)} ${weightUnit}`,
                  ]
                }}
              />
              <Bar
                dataKey="oneRM"
                radius={8}
                fill={`url(#${gradientId})`}
                className="[&_.recharts-bar-background-rectangle]:fill-black/5 [&_.recharts-bar-background-rectangle]:dark:fill-white/5"
                background={{ fill: 'var(--muted)', radius: 8 }}
              >
                {showValuesOnXAxis ? (
                  <LabelList
                    dataKey="oneRM"
                    position="insideTop"
                    offset={12}
                    className="fill-white"
                    fontSize={10}
                    fontWeight={800}
                    formatter={(value: number) =>
                      value > 0 ? `${formatNumber(value, 0)}` : ''
                    }
                  />
                ) : null}
              </Bar>
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </div>
  )
}
