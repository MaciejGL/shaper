'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from 'recharts'

import { cn } from '@/lib/utils'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './ui/chart'

interface MuscleGroupRadarChartProps {
  data: {
    chest: number
    back: number
    shoulders: number
    arms: number
    legs: number
    core: number
  }
  className?: string
}

export function MuscleGroupRadarChart({
  data,
  className,
}: MuscleGroupRadarChartProps) {
  // Transform data for radar chart
  const chartData = [
    { muscle: 'Chest', sets: data.chest },
    { muscle: 'Back', sets: data.back },
    { muscle: 'Shoulders', sets: data.shoulders },
    { muscle: 'Arms', sets: data.arms },
    { muscle: 'Legs', sets: data.legs },
    { muscle: 'Core', sets: data.core },
  ]

  // Calculate max value for better scaling
  const maxSets = Math.max(...Object.values(data))
  const domain = maxSets > 0 ? [0, Math.ceil(maxSets * 1.1)] : [0, 10]

  const chartConfig: ChartConfig = {
    chest: {
      label: 'Chest',
      color: 'red',
    },
    back: {
      label: 'Back',
    },
    shoulders: {
      label: 'Shoulders',
    },
    arms: {
      label: 'Arms',
    },
    legs: {
      label: 'Legs',
    },
    core: {
      label: 'Core',
    },
  }

  return (
    <div className="w-full h-full py-4 bg-white dark:bg-black rounded-lg">
      <ChartContainer config={chartConfig} className={cn('', className)}>
        <RadarChart
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          compact={true}
          width={400}
          height={400}
        >
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis domain={domain} tick={false} axisLine={false} />
          <PolarGrid stroke="var(--color-border)" />
          <Radar
            dataKey="sets"
            fill="var(--color-amber-500)"
            fillOpacity={0.4}
            stroke="var(--color-amber-500)"
            strokeWidth={0.5}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  )
}
