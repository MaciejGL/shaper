'use client'

import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
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

export function WeeklyVolumeCard({
  chartId,
  chartConfig,
  volumeSeries,
  lastWeekVolume,
  volumeChangePercent,
  weightUnit,
}: {
  chartId: string
  chartConfig: ChartConfig
  volumeSeries: { label: string; volume: number }[]
  lastWeekVolume: number
  volumeChangePercent: number
  weightUnit: 'kg' | 'lbs'
}) {
  const gradientId = `exercise-volume-gradient-${chartId}`

  const series = useMemo(() => {
    const TARGET_POINTS = 6

    if (volumeSeries.length >= TARGET_POINTS) return volumeSeries

    return [
      ...volumeSeries,
      ...Array.from({ length: TARGET_POINTS - volumeSeries.length }, () => ({
        label: '',
        volume: 0,
      })),
    ]
  }, [volumeSeries])

  const showValuesOnXAxis = useMemo(() => {
    return volumeSeries.length < 10
  }, [volumeSeries])

  return (
    <div className="space-y-3">
      <div>
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
            label="Change"
            value={
              <span className="tabular-nums">
                {formatNumber(volumeChangePercent, 1)}%
              </span>
            }
            icon={
              volumeChangePercent > 0 ? (
                <TrendingUp className="size-4 text-green-500" />
              ) : volumeChangePercent < 0 ? (
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
          id={`exercise-volume-${chartId}`}
          config={chartConfig}
          className="w-full h-[180px]"
        >
          {volumeSeries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No volume logs yet
            </div>
          ) : (
            <BarChart
              data={series}
              margin={{ top: 10, right: 20, left: 0, bottom: 12 }}
              maxBarSize={34}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-blue-600)"
                    stopOpacity={0.95}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-sky-500)"
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
                width={46}
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
                    `${formatNumber(Number.isFinite(n) ? n : 0, 0)} ${weightUnit}`,
                  ]
                }}
              />
              <Bar
                dataKey="volume"
                radius={8}
                fill={`url(#${gradientId})`}
                className="[&_.recharts-bar-background-rectangle]:fill-black/5 [&_.recharts-bar-background-rectangle]:dark:fill-white/5"
                background={{ fill: 'var(--muted)', radius: 8 }}
              >
                {showValuesOnXAxis ? (
                  <LabelList
                    dataKey="volume"
                    position="insideTop"
                    offset={12}
                    className="fill-white"
                    fontSize={8}
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
