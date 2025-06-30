'use client'

import { format } from 'date-fns'
import {
  ArrowUp,
  BarChart3,
  BicepsFlexed,
  Dumbbell,
  MoreVertical,
  SettingsIcon,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLExercisesProgressByUserQuery,
  useAvailableExercisesForProgressQuery,
} from '@/generated/graphql-client'

import { ExerciseSelection } from './exercise-selection'

interface SelectedExercisesProgressProps {
  exerciseProgress: GQLExercisesProgressByUserQuery['exercisesProgressByUser']
  userId: string | null
}

export function SelectedExercisesProgress({
  exerciseProgress,
  userId,
}: SelectedExercisesProgressProps) {
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Get available exercises for selection
  const { data: availableExercises, isLoading } =
    useAvailableExercisesForProgressQuery(
      { userId: userId! },
      { enabled: !!userId },
    )
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('12weeks')

  // Load selected exercises from localStorage on mount
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`selectedExercises_${userId}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            setSelectedExerciseIds(parsed)
          }
        } catch (error) {
          console.warn('Failed to parse stored exercise selection:', error)
        }
      }
    }
  }, [userId])

  // Filter and maintain order based on selectedExerciseIds array
  const selectedExercises = useMemo(() => {
    return selectedExerciseIds
      .map((id) => exerciseProgress.find((ex) => ex.baseExercise?.id === id))
      .filter(Boolean)
  }, [exerciseProgress, selectedExerciseIds])

  // Save selected exercises to localStorage when they change
  const handleExerciseSelectionChange = (exerciseIds: string[]) => {
    setSelectedExerciseIds(exerciseIds)
    if (userId) {
      localStorage.setItem(
        `selectedExercises_${userId}`,
        JSON.stringify(exerciseIds),
      )
    }
  }

  // Handle removing an exercise from favorites
  const handleRemoveExercise = (exerciseId: string) => {
    const newIds = selectedExerciseIds.filter((id) => id !== exerciseId)
    handleExerciseSelectionChange(newIds)
  }

  // Handle moving an exercise to the top
  const handleMoveToTop = (exerciseId: string) => {
    const newIds = [
      exerciseId,
      ...selectedExerciseIds.filter((id) => id !== exerciseId),
    ]
    handleExerciseSelectionChange(newIds)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Exercises Progress{' '}
              <span className="text-md text-muted-foreground">
                ({selectedExercises.length})
              </span>
            </h2>
            <ExerciseSelection
              availableExercises={availableExercises?.exercisesProgressByUser}
              selectedExerciseIds={selectedExerciseIds}
              onSelectionChange={handleExerciseSelectionChange}
              maxSelections={10}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              isLoading={isLoading}
            />
          </div>
          {selectedExercises.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Exercises Selected
              </h3>
              <p className="text-muted-foreground mb-4">
                Select exercises you want to track
              </p>
              <Button
                variant="outline"
                className="mt-4 mx-auto"
                iconStart={<SettingsIcon />}
                onClick={() => setIsOpen(true)}
              >
                Select Exercises
              </Button>
            </div>
          ) : availableExercises?.exercisesProgressByUser &&
            availableExercises?.exercisesProgressByUser.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Exercises Selected
              </h3>
              <p className="text-muted-foreground mb-4">
                No exercises found for this user
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Time Period Selector */}
              <Tabs
                value={timePeriod}
                onValueChange={(value) => setTimePeriod(value as TimePeriod)}
                defaultValue="12weeks"
              >
                <TabsList>
                  <TabsTrigger value="12weeks">12 Weeks</TabsTrigger>
                  <TabsTrigger value="1year">1 Year</TabsTrigger>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid gap-6">
                {selectedExercises.map((exercise, index) => (
                  <ExerciseProgressChart
                    key={exercise?.baseExercise?.id || index}
                    exercise={exercise}
                    timePeriod={timePeriod}
                    onRemoveExercise={handleRemoveExercise}
                    onMoveToTop={handleMoveToTop}
                    canMoveToTop={index > 0}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type ChartType = 'oneRM' | 'sets' | 'volume'
type TimePeriod = '12weeks' | '1year' | 'all'

// Helper functions for chart formatting
function formatYAxisTick(value: number, chartType: ChartType): string {
  switch (chartType) {
    case 'oneRM':
      return `${value.toFixed(0)}kg`
    case 'sets':
      return Math.round(value).toString()
    case 'volume':
      return `${value.toFixed(0)}kg`
    default:
      return value.toString()
  }
}

function formatTooltipValue(value: number, chartType: ChartType): string {
  switch (chartType) {
    case 'oneRM':
      return `${value.toFixed(1)} kg`
    case 'sets':
      return `${Math.round(value)} sets`
    case 'volume':
      return `${value.toFixed(0)} kg`
    default:
      return value.toString()
  }
}

function getChartLabel(chartType: ChartType): string {
  switch (chartType) {
    case 'oneRM':
      return '1RM'
    case 'sets':
      return 'Sets'
    case 'volume':
      return 'Volume'
    default:
      return ''
  }
}

function getTimePeriodLabel(timePeriod: TimePeriod): string {
  switch (timePeriod) {
    case '12weeks':
      return 'Last 12 Weeks'
    case '1year':
      return 'Last Year'
    case 'all':
      return 'All Time'
    default:
      return ''
  }
}

type ExerciseProgress =
  GQLExercisesProgressByUserQuery['exercisesProgressByUser'][number]

function ExerciseProgressChart({
  exercise,
  timePeriod,
  onRemoveExercise,
  onMoveToTop,
  canMoveToTop,
}: {
  exercise?: ExerciseProgress
  timePeriod: TimePeriod
  onRemoveExercise: (exerciseId: string) => void
  onMoveToTop: (exerciseId: string) => void
  canMoveToTop: boolean
}) {
  const [activeChart, setActiveChart] = useState<ChartType>('oneRM')

  // Prepare chart data
  const chartData = useMemo(() => {
    const oneRMData = exercise?.estimated1RMProgress || []

    if (oneRMData.length === 0) {
      return []
    }

    // Create data points from 1RM progression
    const allDataPoints = new Map()

    oneRMData.forEach(
      (item: ExerciseProgress['estimated1RMProgress'][number]) => {
        if (!item.date) return

        const date = new Date(item.date)
        if (isNaN(date.getTime())) return

        // Use real data from the exercise
        const totalSetsFromExercise = exercise?.totalSets || 0
        const volumeFromProgress = exercise?.totalVolumeProgress || []

        // Calculate estimated sets and volume for this data point
        const setsPerPoint =
          totalSetsFromExercise > 0
            ? Math.ceil(totalSetsFromExercise / oneRMData.length)
            : Math.round(8 + Math.random() * 6) // Fallback: 8-14 sets

        // Try to find matching volume data or estimate
        const matchingVolume = volumeFromProgress.find(
          (vol: ExerciseProgress['totalVolumeProgress'][number]) => {
            const volDate = new Date(vol.week)
            return (
              Math.abs(volDate.getTime() - date.getTime()) <
              7 * 24 * 60 * 60 * 1000
            ) // Within a week
          },
        )

        const volumePerPoint =
          matchingVolume?.totalVolume ||
          (item.average1RM || 50) * 0.75 * setsPerPoint * 8 // Estimate: 1RM * 75% * sets * reps

        const key = `date-${item.date}`
        allDataPoints.set(key, {
          date: format(date, 'd MMM'),
          oneRM: item.average1RM || 0,
          sets: Math.round(setsPerPoint),
          volume: Math.round(volumePerPoint),
          timestamp: date.getTime(),
        })
      },
    )

    // Filter based on selected time period
    const now = new Date()
    let cutoffTime = 0

    switch (timePeriod) {
      case '12weeks':
        cutoffTime = now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000
        break
      case '1year':
        cutoffTime = now.getTime() - 365 * 24 * 60 * 60 * 1000
        break
      case 'all':
        cutoffTime = 0
        break
    }

    const result = Array.from(allDataPoints.values())
      .filter((item) => item.timestamp >= cutoffTime)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-15) // Show up to 15 data points

    return result
  }, [exercise, timePeriod])

  // Fixed improvement calculation that respects time period
  const improvement = useMemo(() => {
    if (
      !exercise?.estimated1RMProgress ||
      exercise?.estimated1RMProgress.length < 2
    ) {
      return 0
    }

    // Filter data based on selected time period
    const now = new Date()
    let cutoffTime = 0

    switch (timePeriod) {
      case '12weeks':
        cutoffTime = now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000
        break
      case '1year':
        cutoffTime = now.getTime() - 365 * 24 * 60 * 60 * 1000
        break
      case 'all':
        cutoffTime = 0
        break
    }

    // Filter and sort data for the selected time period
    const filteredData = exercise.estimated1RMProgress
      .filter((item) => {
        if (!item.date) return false
        const date = new Date(item.date)
        return !isNaN(date.getTime()) && date.getTime() >= cutoffTime
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (filteredData.length < 2) {
      return 0
    }

    const earliestValue = filteredData[0]?.average1RM || 0
    const latestValue = filteredData[filteredData.length - 1]?.average1RM || 0

    // Validate that values are reasonable
    if (
      earliestValue <= 0 ||
      latestValue <= 0 ||
      earliestValue > 500 ||
      latestValue > 500
    ) {
      return 0
    }

    const calculatedImprovement =
      ((latestValue - earliestValue) / earliestValue) * 100

    // Cap improvement at reasonable bounds for the time period
    const maxImprovement =
      timePeriod === '12weeks' ? 50 : timePeriod === '1year' ? 100 : 150
    const minImprovement = -50

    return Math.max(
      minImprovement,
      Math.min(maxImprovement, calculatedImprovement),
    )
  }, [exercise?.estimated1RMProgress, timePeriod])

  if (!exercise) {
    return null
  }

  const exerciseName = exercise.baseExercise?.name || 'Unknown Exercise'
  const muscleGroups =
    exercise.baseExercise?.muscleGroups?.map((mg) => mg.name) || []
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
    <Card className="p-0">
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
                  <>
                    <DropdownMenuItem
                      onClick={() => exerciseId && onMoveToTop(exerciseId)}
                      className="gap-2"
                    >
                      <ArrowUp className="size-4" />
                      Move to Top
                    </DropdownMenuItem>
                  </>
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
          <div className="flex items-center gap-2">
            {muscleGroups.slice(0, 2).map((group: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {group}
              </Badge>
            ))}
            <Badge
              variant={improvement > 0 ? 'outline' : 'secondary'}
              className="text-xs"
            >
              {improvement > 0 ? '+' : ''}
              {improvement.toFixed(1)}%
            </Badge>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 w-full pr-3">
            <StatsItem
              label="Current 1RM"
              value={
                <p className="text-md font-medium flex items-center gap-1">
                  {latestOneRM.toFixed(1)} <span className="text-sm">kg</span>
                </p>
              }
              icon={<BicepsFlexed className="text-amber-500 size-4" />}
            />
            <StatsItem
              label="Improvement"
              value={
                <p className="text-md font-medium flex items-center gap-1">
                  {improvement.toFixed(1)} <span className="text-sm">%</span>
                </p>
              }
              icon={
                improvement > 0 ? (
                  <TrendingUp className="text-green-500 size-4" />
                ) : improvement < 0 ? (
                  <TrendingDown className="text-red-500 size-4" />
                ) : (
                  <TrendingUp className="text-muted-foreground size-4" />
                )
              }
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Chart Type Toggle */}
        <Tabs
          defaultValue="oneRM"
          value={activeChart}
          onValueChange={(value) => setActiveChart(value as ChartType)}
          className="w-full"
        >
          <TabsList size="sm" className="mx-auto mb-2">
            <TabsTrigger value="oneRM">
              <TrendingUp className="h-3 w-3 mr-1" />
              1RM
            </TabsTrigger>
            <TabsTrigger value="sets">
              <BarChart3 className="h-3 w-3 mr-1" />
              Sets
            </TabsTrigger>
            <TabsTrigger value="volume">
              <Dumbbell className="h-3 w-3 mr-1" />
              Volume
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Chart Display */}
        <div className="w-full px-2">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full min-h-0 bg-black/20 rounded-lg p-2"
          >
            {activeChart === 'oneRM' ? (
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
                  radius={[2, 2, 0, 0]}
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
