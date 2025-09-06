'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

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
  className = 'h-[400px] w-full',
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
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig}>
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="muscle" />
            <PolarRadiusAxis domain={domain} tick={false} />
            <PolarGrid strokeOpacity={0.5} />
            <Radar
              dataKey="sets"
              fill="hsl(var(--secondary))"
              fillOpacity={0.7}
              stroke="hsl(var(--secondary))"
              strokeWidth={1}
            />
          </RadarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  )
}
