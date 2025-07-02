'use client'

import { ArrowUp, ListCheckIcon, MoreVertical, X } from 'lucide-react'
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
  Drawer,
  DrawerTrigger,
  SimpleDrawerContent,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { ExerciseChartControls } from './exercise-chart-controls'
import { ExerciseLogsContent } from './exercise-logs-drawer-content'
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
  // Add query here and add loading state
  const chartData = useChartData(exercise, timePeriod)
  const improvement = useExerciseImprovement(exercise, timePeriod)

  if (!exercise) {
    return null
  }

  const exerciseName = exercise.baseExercise?.name || 'Unknown Exercise'
  const latestOneRM =
    chartData.length > 0 ? chartData[chartData.length - 1].oneRM : 0
  const exerciseId = exercise.baseExercise?.id

  // Helper functions for Y-axis range calculation
  const getValidChartValues = (chartType: ChartType) => {
    const values = chartData
      .map((item) => item[chartType])
      .filter((val) => val !== undefined && val !== null)

    // Only filter out negative values for 1RM, allow 0 for volume and sets
    if (chartType === 'oneRM') {
      return values.filter((val) => val > 0)
    }

    // For volume and sets, allow 0 and positive values
    return values.filter((val) => val >= 0)
  }

  const calculateSetsYAxisRange = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 20 }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const dataRange = max - min
    const minDisplayRange = 4

    if (dataRange < minDisplayRange) {
      const padding = (minDisplayRange - dataRange) / 2
      return {
        min: Math.max(0, Math.floor(min - padding)),
        max: Math.ceil(max + padding),
      }
    }

    const padding = Math.max(dataRange * 0.1, 0.5)
    return {
      min: Math.max(0, Math.floor(min - padding)),
      max: Math.ceil(max + padding),
    }
  }

  const calculateStandardYAxisRange = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 100 }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min

    // For very small ranges or when all values are 0, provide a minimum range
    if (range < 1 || max === 0) {
      const baseMax = Math.max(max, 10) // Ensure at least 10 for meaningful scale
      return {
        min: 0,
        max: baseMax * 1.2, // Add 20% padding
      }
    }

    const padding = Math.max(range * 0.1, range * 0.05)
    return {
      min: Math.max(0, min - padding),
      max: max + padding,
    }
  }

  const calculateYAxisRange = (chartType: ChartType) => {
    if (chartData.length < 2) return { min: 0, max: 100 }

    const values = getValidChartValues(chartType)
    if (values.length === 0) {
      // Return sensible defaults based on chart type
      switch (chartType) {
        case 'oneRM':
          return { min: 0, max: 100 }
        case 'sets':
          return { min: 0, max: 20 }
        case 'volume':
          return { min: 0, max: 1000 }
        default:
          return { min: 0, max: 100 }
      }
    }

    return chartType === 'sets'
      ? calculateSetsYAxisRange(values)
      : calculateStandardYAxisRange(values)
  }

  const yAxisRange = calculateYAxisRange(activeChart)

  // Safety check - if we have chart data but no valid values, use raw data
  const hasAnyData = chartData.length > 0
  const hasValidValues = getValidChartValues(activeChart).length > 0

  // If we have data but no valid values after filtering, adjust the domain
  const finalYAxisRange =
    hasAnyData && !hasValidValues
      ? {
          min: 0,
          max: Math.max(
            10,
            Math.max(
              ...chartData.map((item) => (item[activeChart] as number) || 0),
            ) * 1.2,
          ),
        }
      : yAxisRange

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
            <div className="flex items-center gap-2 mt-2">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" iconOnly={<ListCheckIcon />} />
                </DrawerTrigger>
                <SimpleDrawerContent title={`${exerciseName} - Logs`}>
                  <ExerciseLogsContent exercise={exercise} />
                </SimpleDrawerContent>
              </Drawer>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" iconOnly={<MoreVertical />} />
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
            className="w-full h-[200px] bg-card-on-card dark:bg-black/40 rounded-lg p-2"
          >
            {activeChart === 'oneRM' ? (
              <LineChart
                data={chartData}
                margin={{ top: 15, right: 8, left: -12, bottom: 10 }}
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
                  height={10}
                  tickMargin={6}
                />
                <YAxis
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatYAxisTick(value, activeChart)}
                  domain={[finalYAxisRange.min, finalYAxisRange.max]}
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
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available for {activeChart}
              </div>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 8, left: -12, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="2 2" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  height={10}
                />
                <YAxis
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  width={
                    activeChart === 'sets'
                      ? 30
                      : activeChart === 'volume'
                        ? 70
                        : undefined
                  }
                  tickFormatter={(value) => formatYAxisTick(value, activeChart)}
                  domain={[finalYAxisRange.min, finalYAxisRange.max]}
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
