import { format } from 'date-fns'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'

import { Section } from './section'

interface WeightProgressChartProps {
  data: GQLBodyMeasuresQuery['bodyMeasures']
}

export function WeightProgressChart({ data }: WeightProgressChartProps) {
  const chartData = data
    .slice()
    .reverse()
    .filter((measurement) => measurement.weight != null)
    .map((measurement) => ({
      date: format(new Date(measurement.measuredAt), 'dd MMM'),
      weight: measurement.weight!,
    }))

  const chartConfig = {
    weight: {
      label: 'Weight (kg)',
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig

  return (
    <Section title="Weight Progress">
      <ChartContainer
        config={chartConfig}
        className="h-full w-full min-h-0 bg-card dark:bg-black/20 rounded-lg p-2"
      >
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="2 2" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            height={20}
          />
          <YAxis
            tick={{ fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={30}
            tickFormatter={(value) => `${value.toFixed(0)}kg`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="weight"
            type="monotone"
            stroke="var(--color-weight)"
            strokeWidth={2.5}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
    </Section>
  )
}
