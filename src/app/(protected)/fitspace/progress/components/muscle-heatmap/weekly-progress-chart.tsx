'use client'

import { format } from 'date-fns'
import { useId, useMemo } from 'react'
import { Bar, BarChart, LabelList, ReferenceLine, XAxis, YAxis } from 'recharts'

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
  const { user } = useUser()
  const chartId = useId()
  const gradientId = `weekly-progress-gradient-${chartId}`

  const { data, isLoading } = useWeeklyProgressHistoryQuery(
    { userId: user?.id ?? '', weekCount: 8 },
    { enabled: !!user?.id },
  )

  const chartData = useMemo(() => {
    if (!data?.weeklyProgressHistory) return []

    return data.weeklyProgressHistory.map((week) => ({
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
    if (chartData.length >= TARGET_POINTS) return chartData

    return [
      ...chartData,
      ...Array.from({ length: TARGET_POINTS - chartData.length }, () => ({
        label: '',
        percentage: 0,
        totalSets: 0,
        focusPreset: null,
        weekStartDate: '',
      })),
    ]
  }, [chartData])

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
          {chartData.length ? `${chartData.length} weeks` : 'No data'}
        </p>
      </div>

      <div className="w-full py-4 rounded-2xl">
        <ChartContainer
          id={`weekly-progress-${chartId}`}
          config={chartConfig}
          className="w-full h-[180px]"
        >
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No progress data yet
            </div>
          ) : (
            <BarChart
              data={paddedChartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 12 }}
              maxBarSize={34}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-emerald-500)"
                    stopOpacity={0.95}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-teal-400)"
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
                domain={[0, 120]}
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
              <ReferenceLine
                y={100}
                stroke="hsl(var(--primary))"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              {/* Goal change markers */}
              {goalChangePoints.map((change) => (
                <ReferenceLine
                  key={change.index}
                  x={chartData[change.index]?.label}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="2 2"
                  strokeOpacity={0.7}
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
                  position="insideTop"
                  offset={12}
                  className="fill-white"
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

      {goalChangePoints.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          Dashed red lines indicate goal changes
        </p>
      )}
    </div>
  )
}
