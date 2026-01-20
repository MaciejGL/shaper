'use client'

import { useMemo } from 'react'
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'

import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { formatNumber } from '@/lib/utils'

import type { RepMaxConfidence } from './types'

interface Suggestion {
  reps: number
  percentOf1RM: number
  displayWeight: number
  confidence: RepMaxConfidence
}

export function RepMaxGrid({
  latestOneRMKg,
  weightUnit,
  suggestions,
}: {
  latestOneRMKg: number | null
  weightUnit: 'kg' | 'lbs'
  suggestions: Suggestion[]
}) {
  const chartData = useMemo(
    () =>
      suggestions.map((s) => ({
        label: `${s.reps}`,
        weight: s.displayWeight,
      })),
    [suggestions],
  )

  const chartConfig = useMemo(
    () =>
      ({
        weight: {
          label: `Weight (${weightUnit})`,
          color: 'var(--chart-1)',
        },
      }) satisfies ChartConfig,
    [weightUnit],
  )

  if (suggestions.length === 0 || !latestOneRMKg) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 pt-2 ">
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium">Est. Maxes per rep</p>
        <div className="flex items-baseline gap-1.5 text-sm">
          <span className="text-muted-foreground">1RM:</span>
          <span className="font-bold tabular-nums">
            {formatNumber(latestOneRMKg, 1)} {weightUnit}
          </span>
        </div>
      </div>
      <div className="w-full bg-card-on-card dark:bg-black/40 py-4 rounded-2xl">
        <ChartContainer
          config={chartConfig}
          style={{ height: suggestions.length * 36 }}
          className="w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: -24, right: 24 }}
          >
            <defs>
              <linearGradient id="repMaxGradient" x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor="var(--color-green-400)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-green-600)"
                  stopOpacity={1}
                />
              </linearGradient>
            </defs>
            <XAxis type="number" dataKey="weight" hide />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={4}
              axisLine={false}
            />
            <Bar
              dataKey="weight"
              fill="url(#repMaxGradient)"
              radius={8}
              className="[&_.recharts-bar-background-rectangle]:fill-black/5 [&_.recharts-bar-background-rectangle]:dark:fill-white/5"
              background={{ fill: 'var(--muted)', radius: 8 }}
            >
              <LabelList
                dataKey="weight"
                position="insideRight"
                offset={12}
                className="fill-white"
                fontSize={14}
                fontWeight={600}
                formatter={(value: number) =>
                  `${formatNumber(value, 1)} ${weightUnit}`
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}
