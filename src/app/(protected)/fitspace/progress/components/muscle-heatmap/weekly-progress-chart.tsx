'use client'

import { format } from 'date-fns'
import { useId, useMemo } from 'react'
import { Bar, BarChart, LabelList, ReferenceLine, XAxis, YAxis } from 'recharts'

import { PremiumUpgradeNote } from '@/components/premium-upgrade-note'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { getVolumeGoalPresetById } from '@/config/volume-goals'
import { useUser } from '@/context/user-context'
import { useWeeklyProgressHistoryQuery } from '@/generated/graphql-client'
import { formatNumber } from '@/lib/utils'

const chartConfig: ChartConfig = {
  percentage: {
    label: 'Progress',
    color: 'var(--chart-1)',
  },
}

export function WeeklyProgressChart() {
  const { user, hasPremium } = useUser()
  const chartId = useId()
  const gradientId = `weekly-progress-gradient-${chartId}`

  const { data, isLoading } = useWeeklyProgressHistoryQuery(
    { userId: user?.id ?? '', weekCount: 8 },
    { enabled: !!user?.id },
  )

  const chartData = useMemo(() => {
    if (!data?.weeklyProgressHistory) return []

    return data.weeklyProgressHistory.map((week, index) => ({
      index,
      label: format(new Date(week.weekStartDate), 'MMM d'),
      percentage: Math.round(week.overallPercentage),
      totalSets: week.totalSets,
      focusPreset: week.focusPreset,
      weekStartDate: week.weekStartDate,
    }))
  }, [data])

  // Pad to minimum 6 data points
  const paddedChartData = useMemo(() => {
    const TARGET_POINTS = 6

    // For non-premium: show empty placeholders + last data point only
    if (!hasPremium && chartData.length > 0) {
      const lastPoint = chartData[chartData.length - 1]
      const emptyCount = Math.max(TARGET_POINTS - 1, chartData.length - 1)
      return [
        ...Array.from({ length: emptyCount }, (_, i) => ({
          index: i,
          label: '',
          percentage: 0,
          totalSets: 0,
          focusPreset: null,
          weekStartDate: '',
        })),
        { ...lastPoint, index: emptyCount },
      ]
    }

    if (chartData.length >= TARGET_POINTS) return chartData

    return [
      ...chartData,
      ...Array.from({ length: TARGET_POINTS - chartData.length }, (_, i) => ({
        index: chartData.length + i,
        label: '',
        percentage: 0,
        totalSets: 0,
        focusPreset: null,
        weekStartDate: '',
      })),
    ]
  }, [chartData, hasPremium])

  // Find goal change points for reference lines
  const goalChangePoints = useMemo(() => {
    if (chartData.length < 2) return []

    const changes: { index: number; newGoal: string }[] = []
    for (let i = 1; i < chartData.length; i++) {
      if (chartData[i].focusPreset !== chartData[i - 1].focusPreset) {
        const preset = getVolumeGoalPresetById(chartData[i].focusPreset)
        changes.push({
          index: i,
          newGoal: preset?.name ?? 'Goal changed',
        })
      }
    }
    return changes
  }, [chartData])

  if (isLoading) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Weekly Progress</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {hasPremium
            ? chartData.length
              ? `${chartData.length} weeks`
              : 'No data'
            : 'Current week'}
        </p>
      </div>

      <div className="w-full py-4 rounded-2xl">
        <ChartContainer
          id={`weekly-progress-${chartId}`}
          config={chartConfig}
          className="w-full "
        >
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No progress data yet
            </div>
          ) : (
            <BarChart
              data={paddedChartData}
              margin={{ top: 14, right: 0, left: 0, bottom: 12 }}
              maxBarSize={34}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-green-600)"
                    stopOpacity={0.95}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-green-300)"
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="index"
                type="number"
                domain={[-0.75, paddedChartData.length - 0.25]}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                height={10}
                tickFormatter={(value) =>
                  paddedChartData.find((d) => d.index === value)?.label ?? ''
                }
              />
              <YAxis
                domain={[0, 120]}
                ticks={[0, 20, 40, 60, 80, 100, 120]}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${formatNumber(v, 0)}%`}
                width={38}
              />
              <ChartTooltip
                content={(props) => {
                  if (props.label === '' || !props.active) return null

                  return (
                    <ChartTooltipContent
                      active={props.active}
                      payload={props.payload}
                      label={props.label}
                    />
                  )
                }}
                formatter={(value, _name, props) => {
                  const preset = getVolumeGoalPresetById(
                    props.payload.focusPreset,
                  )
                  return (
                    <div className="space-y-1">
                      <div className="font-medium">{value}% of goal</div>
                      <div className="text-xs text-muted-foreground">
                        {props.payload.totalSets} sets
                      </div>
                      {preset && (
                        <div className="text-xs text-muted-foreground">
                          Goal: {preset.name}
                        </div>
                      )}
                    </div>
                  )
                }}
              />
              {/* Reference line at 100% */}
              {/* <ReferenceLine
                y={100}
                stroke="var(--chart-1)"
                strokeDasharray="3 0"
                strokeOpacity={0.5}
                isFront
              /> */}
              {/* Goal change markers - only for premium */}
              {hasPremium && goalChangePoints.map((change, idx) => (
                <ReferenceLine
                  key={change.index}
                  x={change.index - 0.5}
                  stroke="var(--chart-4)"
                  strokeDasharray="2 2"
                  strokeOpacity={0.7}
                  label={{
                    value: change.newGoal,
                    position: idx % 2 === 0 ? 'bottom' : 'top',
                    offset: 6,
                    fill: 'var(--chart-4)',
                    fontSize: 10,
                  }}
                  isFront
                />
              ))}
              <Bar
                dataKey="percentage"
                radius={8}
                fill={`url(#${gradientId})`}
                className="[&_.recharts-bar-background-rectangle]:fill-black/5 [&_.recharts-bar-background-rectangle]:dark:fill-white/5"
                background={{ fill: 'var(--muted)', radius: 8 }}
              >
                <LabelList
                  dataKey="percentage"
                  position="top"
                  offset={6}
                  className="fill-foreground"
                  fontSize={10}
                  fontWeight={800}
                  formatter={(value: number) =>
                    value > 0 ? `${formatNumber(value, 0)}%` : ''
                  }
                />
              </Bar>
            </BarChart>
          )}
        </ChartContainer>
      </div>

      {hasPremium && goalChangePoints.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          Dashed red lines indicate goal changes
        </p>
      )}

      {!hasPremium && (
        <PremiumUpgradeNote>Upgrade to view full history</PremiumUpgradeNote>
      )}
    </div>
  )
}
