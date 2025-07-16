import { Label, Pie, PieChart } from 'recharts'

import { CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatNumber } from '@/lib/utils'

const chartConfig = {
  kcal: {
    label: 'kcal',
  },
  protein: {
    label: 'Protein',
    color: 'var(--chart-2)',
  },
  carbs: {
    label: 'Carbs',
    color: 'var(--chart-1)',
  },
  fat: {
    label: 'Fat',
    color: 'var(--chart-3)',
  },
  fiber: {
    label: 'Fiber',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

export function ChartPieDonutText({
  totalCalorie,
  totalProtein,
  totalCarbs,
  totalFat,
  totalFiber,
}: {
  totalCalorie: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
}) {
  const chartData = [
    {
      macro: 'protein',
      value: Number(totalProtein) || 1,
      fill: 'var(--color-green-500)',
    },
    {
      macro: 'carbs',
      value: Number(totalCarbs) || 1,
      fill: 'var(--color-blue-500)',
    },
    {
      macro: 'fat',
      value: Number(totalFat) || 1,
      fill: 'var(--color-yellow-500)',
    },
    {
      macro: 'fiber',
      value: Number(totalFiber) || 1,
      fill: 'var(--color-violet-500)',
    },
  ]
  return (
    <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square min-w-[250px] max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="macro"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {formatNumber(totalCalorie)}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        kcal
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </CardContent>
  )
}
