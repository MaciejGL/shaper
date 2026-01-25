'use client'

import { useMemo } from 'react'
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { cn, formatNumber } from '@/lib/utils'

interface OneRmBarChartProps {
  id: string
  series: { label: string; oneRM: number }[]
  weightUnit: 'kg' | 'lbs'
  className?: string
  chartConfig?: ChartConfig
}

export function OneRmBarChart({
  id,
  series: rawSeries,
  weightUnit,
  className,
  chartConfig,
}: OneRmBarChartProps) {
  const gradientId = `one-rm-gradient-${id}`

  const config: ChartConfig =
    chartConfig ??
    ({
      oneRM: { label: `1RM (${weightUnit})`, color: 'var(--chart-1)' },
    } satisfies ChartConfig)

  const series = useMemo(() => {
    const TARGET_POINTS = 6

    if (rawSeries.length >= TARGET_POINTS) return rawSeries

    return [
      ...rawSeries,
      ...Array.from({ length: TARGET_POINTS - rawSeries.length }, () => ({
        label: '',
        oneRM: 0,
      })),
    ]
  }, [rawSeries])

  const showValuesOnXAxis = useMemo(() => {
    return rawSeries.length < 15
  }, [rawSeries.length])

  return (
    <div
      className={cn(
        'w-full bg-card-on-card dark:bg-black/40 py-4 rounded-2xl',
        className,
      )}
    >
      <ChartContainer id={id} config={config} className="w-full h-[180px]">
        {rawSeries.length === 0 ? (
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
  )
}

