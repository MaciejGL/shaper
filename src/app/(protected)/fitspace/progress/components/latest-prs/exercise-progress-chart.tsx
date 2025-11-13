'use client'

import { TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useUser } from '@/context/user-context'
import {
  GQLGetUserPrHistoryQuery,
  useGetExerciseProgressQuery,
} from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn } from '@/lib/utils'

interface ExerciseProgressChartProps {
  exercisePRs: GQLGetUserPrHistoryQuery['getUserPRHistory']
  exerciseId: string
}

export function ExerciseProgressChart({
  exercisePRs,
  exerciseId,
}: ExerciseProgressChartProps) {
  const { user } = useUser()
  const { toDisplayWeight, weightUnit } = useWeightConversion()

  // Fetch exercise historical logs
  const { data: exerciseLogsData, isLoading: exerciseLogsLoading } =
    useGetExerciseProgressQuery(
      { userId: user?.id || '', exerciseId },
      { enabled: !!user?.id && !!exerciseId },
    )

  const chartData = useMemo(() => {
    // Create a set of dates when PRs happened
    const prDates = new Set<string>()
    exercisePRs.forEach((pr) => {
      const date = new Date(pr.achievedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      prDates.add(date)
    })

    // Get exercise progress data
    const exerciseProgress = exerciseLogsData?.exercisesProgressByUser.find(
      (exercise) => exercise.baseExercise?.id === exerciseId,
    )

    // Create chart data from exercise logs
    const chartData =
      exerciseProgress?.estimated1RMProgress
        ?.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )
        .map((log) => {
          const date = new Date(log.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
          const isPR = prDates.has(date)

          return {
            date,
            estimated1RM: toDisplayWeight(log.average1RM) || 0,
            isPR,
            fullDate: log.date,
          }
        }) || []

    return chartData
  }, [exercisePRs, exerciseLogsData, exerciseId, toDisplayWeight])

  const chartConfig = {
    estimated1RM: {
      label: 'Estimated 1RM',
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig

  if (chartData.length === 0 && !exerciseLogsLoading) {
    return (
      <Card variant="secondary" className="p-0 bg-transparent">
        <CardContent className="h-64 flex items-center justify-center p-0">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No data available</p>
            <p className="text-xs">Complete some workouts to see progress</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate progress from first to last data point
  const latestData = chartData[chartData.length - 1]
  const firstData = chartData[0]
  const progressPercentage =
    latestData && firstData
      ? ((latestData.estimated1RM - firstData.estimated1RM) /
          firstData.estimated1RM) *
        100
      : 0

  return (
    <div className="mt-4">
      <div>
        <CardTitle>1 Rep Max</CardTitle>
        <CardDescription>
          Estimated 1RM over time ({weightUnit})
        </CardDescription>
      </div>
      <CardContent className="bg-black/90 dark:bg-black/20 py-2 mt-4 mb-2 rounded-lg">
        <ChartContainer id={`exercise-pr-${exerciseId}`} config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 28,
              right: 28,
            }}
          >
            <CartesianGrid vertical={false} className="!stroke-border/20" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="estimated1RM"
              type="natural"
              stroke="var(--chart-2)"
              strokeWidth={1.5}
              dot={(props) => {
                const { payload } = props
                return (
                  <circle
                    key={`dot-${props.index}`}
                    cx={props.cx}
                    cy={props.cy}
                    r={payload?.isPR ? 4 : 4}
                    fill={payload?.isPR ? 'var(--chart-1)' : 'var(--chart-2)'}
                    stroke={payload?.isPR ? 'var(--chart-1)' : 'var(--chart-2)'}
                    strokeWidth={2}
                  />
                )
              }}
              activeDot={{
                r: 7,
                stroke: 'var(--chart-2)',
                fill: 'transparent',
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-amber-500"
                fontSize={10}
                formatter={(value: number) => value.toFixed(1)}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="items-baseline gap-2 text-sm justify-end">
        <div className="text-muted-foreground leading-none">
          From {firstData?.estimated1RM?.toFixed(1) || 0} to{' '}
          {latestData?.estimated1RM?.toFixed(1) || 0} {weightUnit}
        </div>
        <div
          className={cn(
            'flex gap-1 leading-none font-medium text-base',
            progressPercentage > 0 ? 'text-amber-500' : 'text-muted-foreground',
          )}
        >
          {progressPercentage > 0 ? '+' : ''}
          {progressPercentage.toFixed(1)}%
          {progressPercentage > 0 && <TrendingUp className="size-6" />}
        </div>
      </CardFooter>
    </div>
  )
}
