'use client'

import { TrendingUp } from 'lucide-react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'

import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { isProd } from '@/lib/get-base-url'

type MuscleGroup = {
  name: string
  sets: number
}

export default function ProgressPage() {
  return (
    <div>
      <ChartRadarDefault
        data={[
          { name: 'Chest', sets: 12 },
          { name: 'Back', sets: 10 },
          { name: 'Biceps', sets: 4 },
          { name: 'Triceps', sets: 4 },
          { name: 'Shoulders', sets: 6 },
          { name: 'Legs', sets: 8 },
          { name: 'Core', sets: 5 },
        ]}
      />
    </div>
  )
}

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

function ChartRadarDefault({ data }: { data: MuscleGroup[] }) {
  if (isProd) {
    return (
      <div className="flex flex-col items-center justify-center h-full mt-16 gap-4 text-center">
        <h1 className="text-2xl font-bold">Currently not available</h1>
        <p className="text-sm text-muted-foreground">
          We are working on this feature and it will be available at some point.
        </p>
        <ButtonLink href="/">Go to dashboard</ButtonLink>
      </div>
    )
  }
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Radar Chart</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[400px]"
        >
          <RadarChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            outerRadius={'60%'}
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="name" />
            <PolarGrid />
            <Radar
              dataKey="sets"
              fill="var(--color-desktop)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          January - June 2024
        </div>
      </CardFooter>
    </Card>
  )
}
