'use client'

import { ArrowUp, MoreVertical, X } from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { ExerciseChartControls } from './exercise-chart-controls'
import {
  ChartType,
  ExerciseProgress,
  TimePeriod,
  formatTooltipValue,
  formatYAxisTick,
  getChartLabel,
  getTimePeriodLabel,
} from './exercise-progress-constants'
import { ExerciseProgressStats } from './exercise-progress-stats'
import { useChartData, useExerciseImprovement } from './use-exercise-progress'

interface ExerciseProgressChartProps {
  exercise?: ExerciseProgress
  timePeriod: TimePeriod
  onRemoveExercise: (exerciseId: string) => void
  onMoveToTop: (exerciseId: string) => void
  canMoveToTop: boolean
}

export function ExerciseProgressChart({
  exercise,
  timePeriod,
  onRemoveExercise,
  onMoveToTop,
  canMoveToTop,
}: ExerciseProgressChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('oneRM')

  const chartData = useChartData(exercise, timePeriod)
  const improvement = useExerciseImprovement(exercise, timePeriod)

  if (!exercise) {
    return null
  }

  const exerciseName = exercise.baseExercise?.name || 'Unknown Exercise'
  const latestOneRM =
    chartData.length > 0 ? chartData[chartData.length - 1].oneRM : 0
  const exerciseId = exercise.baseExercise?.id

  const chartConfig = {
    oneRM: {
      label: '1RM (kg)',
      color: 'var(--chart-1)',
    },
    volume: {
      label: 'Volume',
      color: 'var(--chart-2)',
    },
    sets: {
      label: 'Sets',
      color: 'var(--chart-3)',
    },
  } satisfies ChartConfig

  return (
    <Card variant="secondary" className="p-0 -mx-4 rounded-none">
      <CardHeader className="p-0 pl-4 pr-1">
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-start justify-between w-full">
            <CardTitle className="text-lg pt-3">{exerciseName}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  iconOnly={<MoreVertical />}
                  className="mt-2"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canMoveToTop && (
                  <DropdownMenuItem
                    onClick={() => exerciseId && onMoveToTop(exerciseId)}
                    className="gap-2"
                  >
                    <ArrowUp className="size-4" />
                    Move to Top
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => exerciseId && onRemoveExercise(exerciseId)}
                  className="gap-2"
                >
                  <X className="size-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ExerciseProgressStats
            currentOneRM={latestOneRM}
            improvement={improvement}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Chart Type Toggle */}
        <ExerciseChartControls
          activeChart={activeChart}
          onChartChange={setActiveChart}
        />

        {/* Chart Display */}
        <div className="w-full px-2">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full min-h-0 bg-background/30 dark:bg-black/20 rounded-lg p-2"
          >
            {activeChart === 'oneRM' ? (
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="var(--color-border)"
                />
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
                  tickFormatter={(value) => formatYAxisTick(value, activeChart)}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [
                    formatTooltipValue(value as number, activeChart),
                    getChartLabel(activeChart),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey={activeChart}
                  stroke={`var(--color-${activeChart})`}
                  strokeWidth={2.5}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart
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
                  tickFormatter={(value) => formatYAxisTick(value, activeChart)}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [
                    formatTooltipValue(value as number, activeChart),
                    getChartLabel(activeChart),
                  ]}
                />
                <Bar
                  dataKey={activeChart}
                  fill={`var(--color-${activeChart})`}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            )}
          </ChartContainer>
        </div>

        {/* Chart Description */}
        <div className="text-center mt-2 pb-4">
          <p className="text-xs text-muted-foreground">
            {activeChart === 'oneRM' &&
              `Estimated 1RM Progression (${getTimePeriodLabel(timePeriod)})`}
            {activeChart === 'sets' &&
              `Weekly Sets Completed (${getTimePeriodLabel(timePeriod)})`}
            {activeChart === 'volume' &&
              `Training Volume Progress (${getTimePeriodLabel(timePeriod)})`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
