import { format } from 'date-fns'
import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'
import { cn, formatNumber } from '@/lib/utils'

import { MeasurementField } from './measurement-constants'

interface MeasurementChartProps {
  measurements: GQLBodyMeasuresQuery['bodyMeasures']
  field: MeasurementField
  label: string
  unit: string
  className?: string
}

// Calculate running average (cumulative average from start to each point)
function calculateRunningAverage(data: number[]): number[] {
  let sum = 0
  return data.map((value, index) => {
    sum += value
    return Math.round((sum / (index + 1)) * 100) / 100 // Round to 2 decimal places
  })
}

export function MeasurementChart({
  measurements,
  field,
  label,
  unit,
  className,
}: MeasurementChartProps) {
  // First, prepare the filtered and sorted data with values
  const filteredData = measurements
    .slice()
    .reverse()
    .filter((measurement) => measurement[field] != null)

  // Extract values for running average calculation
  const values = filteredData.map((measurement) => measurement[field] as number)

  // Calculate running average (shows your average weight throughout the journey)
  const runningAverages = calculateRunningAverage(values)

  // Create chart data with both actual values and running averages
  const chartData = filteredData.map((measurement, index) => ({
    date: format(new Date(measurement.measuredAt), 'dd MMM'),
    [field]: measurement[field],
    [`${field}Average`]: runningAverages[index],
  }))

  // Calculate dynamic Y-axis range based on both actual values and averages
  const allValues = [
    ...values,
    ...(runningAverages.filter((val) => val !== null) as number[]),
  ]
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const range = maxValue - minValue

  // Add 10% padding around the data range, with a minimum padding of 1 unit
  const padding = Math.max(range * 0.1, 1)
  const yAxisMin = Math.max(0, minValue - padding) // Don't go below 0 for measurements
  const yAxisMax = maxValue + padding

  const chartConfig = useMemo(
    () =>
      ({
        [field]: {
          label: `${label} (${unit})`,
          color: 'var(--chart-1)',
        },
        [`${field}Average`]: {
          label: `Weekly Average (${unit})`,
          color: 'var(--chart-2)',
        },
      }) satisfies ChartConfig,
    [field, label, unit],
  )

  // Custom legend formatter to use chartConfig labels
  const legendFormatter = (value: string) => {
    return chartConfig[value as keyof typeof chartConfig]?.label || value
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        'h-[200px] w-full bg-black/90 dark:bg-black/20 rounded-lg p-2',
        className,
      )}
    >
      <LineChart
        data={chartData}
        margin={{ top: 15, right: 8, left: 0, bottom: 12 }}
      >
        <CartesianGrid strokeDasharray="2 2" opacity={0.3} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          height={10}
          tickMargin={8}
        />
        <YAxis
          tick={{ fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          width={24}
          tickFormatter={(value) => `${formatNumber(value)}`}
          domain={[yAxisMin, yAxisMax]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey={field}
          type="monotone"
          stroke={`var(--color-${field})`}
          strokeWidth={1.5}
          dot={{ r: 2.5, fill: `var(--color-${field})` }}
          activeDot={{
            r: 6,
            strokeWidth: 2,
            stroke: `var(--color-${field})`,
            fill: 'transparent',
          }}
        />
        <Line
          dataKey={`${field}Average`}
          type="monotone"
          stroke={`var(--color-${field}Average)`}
          strokeWidth={1}
          dot={false}
          connectNulls={false}
        />
        <Legend
          verticalAlign="bottom"
          height={20}
          iconType="line"
          formatter={legendFormatter}
          wrapperStyle={{
            fontSize: '12px',
            paddingTop: '20px',
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}
