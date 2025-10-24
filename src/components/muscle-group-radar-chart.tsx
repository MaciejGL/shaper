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
    <ChartContainer
      id="muscle-group-radar"
      config={chartConfig}
      className={cn(
        'h-full w-full min-h-0 bg-card dark:bg-black/20 rounded-lg p-2',
        className,
      )}
    >
      <RadarChart
        data={chartData}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <ChartTooltip content={<ChartTooltipContent />} />
        <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis domain={domain} tick={false} axisLine={false} />
        <PolarGrid opacity={0.6} />
        <Radar dataKey="sets" fill="var(--color-amber-500)" fillOpacity={0.4} />
      </RadarChart>
    </ChartContainer>
  )
}
