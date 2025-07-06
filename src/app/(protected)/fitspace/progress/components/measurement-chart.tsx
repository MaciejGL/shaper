import { format } from 'date-fns'
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

// Calculate 7-day moving average
function calculateMovingAverage(
  data: number[],
  windowSize: number = 7,
): (number | null)[] {
  return data.map((_, index) => {
    if (index < windowSize - 1) return null // Not enough data points

    const window = data.slice(index - windowSize + 1, index + 1)
    const sum = window.reduce((acc, val) => acc + val, 0)
    return sum / window.length
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

  // Don't render chart if insufficient data
  if (filteredData.length < 2) {
    return null
  }

  // Extract values for moving average calculation
  const values = filteredData.map((measurement) => measurement[field] as number)

  // Calculate 7-day moving average
  const movingAverages = calculateMovingAverage(values, 7)

  // Create chart data with both actual values and moving averages
  const chartData = filteredData.map((measurement, index) => ({
    date: format(new Date(measurement.measuredAt), 'dd MMM'),
    [field]: measurement[field],
    [`${field}Average`]: movingAverages[index],
  }))

  // Calculate dynamic Y-axis range based on both actual values and averages
  const allValues = [
    ...values,
    ...(movingAverages.filter((val) => val !== null) as number[]),
  ]
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const range = maxValue - minValue

  // Add 10% padding around the data range, with a minimum padding of 1 unit
  const padding = Math.max(range * 0.1, 1)
  const yAxisMin = Math.max(0, minValue - padding) // Don't go below 0 for measurements
  const yAxisMax = maxValue + padding

  const chartConfig = {
    [field]: {
      label: `${label} (${unit})`,
      color: 'var(--chart-1)',
    },
    [`${field}Average`]: {
      label: `Weekly Average (${unit})`,
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig

  // Custom legend formatter to use chartConfig labels
  const legendFormatter = (value: string) => {
    return chartConfig[value as keyof typeof chartConfig]?.label || value
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        'h-[200px] w-full bg-card-on-card dark:bg-black/20 rounded-lg p-2',
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
          width={38}
          tickFormatter={(value) => `${formatNumber(value, 1)}${unit}`}
          domain={[yAxisMin, yAxisMax]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {/* Actual measurements line */}
        <Line
          dataKey={field}
          type="monotone"
          stroke={`var(--color-${field})`}
          strokeWidth={2.5}
          dot={{ r: 2.5 }}
          activeDot={{ r: 4 }}
        />
        {/* 7-day moving average line */}
        <Line
          dataKey={`${field}Average`}
          type="monotone"
          stroke={`var(--color-${field}Average)`}
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 3 }}
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
