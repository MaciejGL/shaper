'use client'

import { format } from 'date-fns'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { GQLGetPlanSummaryQuery } from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

type PerformanceData =
  GQLGetPlanSummaryQuery['getPlanSummary']['strengthProgress'][0]['allPerformances'][0]

interface StrengthProgressChartProps {
  performances: PerformanceData[]
  exerciseName: string
}

export function StrengthProgressChart({
  performances,
  exerciseName,
}: StrengthProgressChartProps) {
  const { toDisplayWeight, weightUnit } = useWeightConversion()

  const chartData = useMemo(() => {
    return performances.map((perf) => ({
      date: format(new Date(perf.date), 'MMM d'),
      oneRM: toDisplayWeight(perf.estimated1RM) || 0,
      weight: toDisplayWeight(perf.weight) || 0,
      reps: perf.reps,
      fullDate: format(new Date(perf.date), 'MMM d, yyyy'),
    }))
  }, [performances, toDisplayWeight])

  const yAxisRange = useMemo(() => {
    const values = chartData.map((d) => d.oneRM).filter((v) => v > 0)
    if (values.length === 0) return { min: 0, max: 100 }

    const max = Math.max(...values)
    const padding = max * 0.1

    return {
      min: 0,
      max: max + padding,
    }
  }, [chartData])

  const chartConfig = {
    oneRM: {
      label: `1RM (${weightUnit})`,
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className="mt-3 -mx-3">
      <ChartContainer
        id={`strength-progress-${exerciseName}`}
        config={chartConfig}
        className="w-full h-[150px]"
      >
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 12, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="2 2" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            height={10}
            tickMargin={6}
          />
          <YAxis
            tick={{ fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={32}
            tickFormatter={(value) => `${Math.round(value)}`}
            domain={[yAxisRange.min, yAxisRange.max]}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _, item) => {
                  const payload = item.payload as (typeof chartData)[0]
                  return [
                    <div key="tooltip" className="flex flex-col gap-1">
                      <div className="font-semibold">
                        {Math.round(value as number)} {weightUnit} 1RM
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payload.weight?.toFixed(1)} {weightUnit} ×{' '}
                        {payload.reps} reps
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payload.fullDate}
                      </div>
                    </div>,
                    '',
                  ]
                }}
              />
            }
          />
          <Bar dataKey="oneRM" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
