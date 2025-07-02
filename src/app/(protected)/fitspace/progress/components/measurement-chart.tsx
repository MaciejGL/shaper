import { format } from 'date-fns'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

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

export function MeasurementChart({
  measurements,
  field,
  label,
  unit,
  className,
}: MeasurementChartProps) {
  const chartData = measurements
    .slice()
    .reverse()
    .filter((measurement) => measurement[field] != null)
    .map((measurement) => ({
      date: format(new Date(measurement.measuredAt), 'dd MMM'),
      [field]: measurement[field],
    }))

  // Don't render chart if insufficient data
  if (chartData.length < 2) {
    return null
  }

  // Calculate dynamic Y-axis range based on actual data values
  const values = chartData.map((item) => item[field] as number)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
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
  } satisfies ChartConfig

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
        <Line
          dataKey={field}
          type="monotone"
          stroke={`var(--color-${field})`}
          strokeWidth={2.5}
          dot={{ r: 2.5 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
