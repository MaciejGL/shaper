'use client'

import { format, getWeek } from 'date-fns'
import { groupBy, sortBy, uniqBy } from 'lodash'
import { Fragment, useState } from 'react'
import * as Recharts from 'recharts'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Loader } from '@/components/loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipWrapper,
} from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLExercisesProgressByUserQuery,
  type GQLGetClientByIdQuery,
  useExercisesProgressByUserQuery,
} from '@/generated/graphql-client'

interface ExerciseLogsProps {
  plan: NonNullable<GQLGetClientByIdQuery['getClientActivePlan']>
  clientId: string
}

export function ExerciseLogs({ clientId }: ExerciseLogsProps) {
  const { data, isLoading } = useExercisesProgressByUserQuery({
    userId: clientId,
  })
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(
    null,
  )

  const allMuscleGroups = data?.exercisesProgressByUser.flatMap(
    (exercise) => exercise.baseExercise?.muscleGroups,
  )

  const uniqueMuscleGroups = sortBy(
    uniqBy(allMuscleGroups, (mg) => mg?.groupSlug),
    (mg) => mg?.category?.name,
  )

  const exercisesCounter = groupBy(allMuscleGroups, (mg) => mg?.groupSlug)

  const filteredExercises = data?.exercisesProgressByUser.filter((exercise) =>
    exercise.baseExercise?.muscleGroups.some(
      (group) => group?.category?.name === selectedMuscleGroup,
    ),
  )

  if (isLoading)
    return (
      <Card className="flex justify-center items-center h-full py-40">
        <Loader />
      </Card>
    )

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="allExercises"
        className="w-full"
        onValueChange={(value) => {
          setSelectedMuscleGroup(value)
        }}
      >
        <TabsList>
          <TabsTrigger value="allExercises">
            All Exercises ({data?.exercisesProgressByUser.length})
          </TabsTrigger>
          {uniqueMuscleGroups.map(
            (mg) =>
              mg?.category?.name && (
                <TabsTrigger key={mg.category.name} value={mg.category.name}>
                  {mg?.category?.name} ({exercisesCounter[mg.groupSlug]?.length}
                  )
                </TabsTrigger>
              ),
          )}
        </TabsList>

        {/* ALL EXERCISES TAB */}
        <TabsContent value="allExercises" className="space-y-6">
          {data?.exercisesProgressByUser.map((exercise) => (
            <ExerciseProgressCard
              key={exercise.baseExercise?.id}
              exercise={exercise}
            />
          ))}
        </TabsContent>

        {/* GROUPED BY MUSCLE GROUP */}
        {uniqueMuscleGroups.map((mg) => (
          <TabsContent
            key={mg?.category?.name}
            value={mg?.category?.name ?? ''}
            className="space-y-6 grid grid-cols-1 gap-6"
          >
            <div>
              {filteredExercises?.map((exercise) => (
                <ExerciseProgressCard
                  key={exercise.baseExercise?.id}
                  exercise={exercise}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

interface ExerciseProgressCardProps {
  exercise: GQLExercisesProgressByUserQuery['exercisesProgressByUser'][number]
}

export function ExerciseProgressCard({ exercise }: ExerciseProgressCardProps) {
  const config = {
    estimated1RM: { label: 'Estimated 1RM', color: 'var(--chart-1)' },
    totalVolume: { label: 'Total Volume', color: 'var(--chart-2)' },
    totalSets: { label: 'Sets', color: 'var(--chart-3)' },
  }

  const dailyOneRmData = exercise.estimated1RMProgress.map((entry) => ({
    date: entry.date,
    average1RM: entry.average1RM,
    detailedLogs: entry.detailedLogs,
  }))

  // Helper functions for clean Y-axis range calculations
  const calculateWeightYAxisRange = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 100 }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    const padding = Math.max(range * 0.1, 5) // Minimum 5kg padding

    return {
      min: Math.max(0, min - padding),
      max: max + padding,
    }
  }

  const calculateVolumeYAxisRange = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 1000 }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    const padding = Math.max(range * 0.1, 50) // Minimum 50kg padding

    return {
      min: Math.max(0, min - padding),
      max: max + padding,
    }
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

    const padding = Math.max(dataRange * 0.1, 1)
    return {
      min: Math.max(0, Math.floor(min - padding)),
      max: Math.ceil(max + padding),
    }
  }

  // Main calculation functions
  const calculate1RMRange = () => {
    if (dailyOneRmData.length < 2) return { min: 0, max: 100 }
    const values = dailyOneRmData
      .map((item) => item.average1RM)
      .filter((val) => val > 0)
    return calculateWeightYAxisRange(values)
  }

  const calculateVolumeSetRanges = () => {
    if (exercise.totalVolumeProgress.length < 2) {
      return {
        volume: { min: 0, max: 1000 },
        sets: { min: 0, max: 20 },
      }
    }

    const volumes = exercise.totalVolumeProgress
      .map((item) => item.totalVolume)
      .filter((val) => val > 0)
    const sets = exercise.totalVolumeProgress
      .map((item) => item.totalSets)
      .filter((val) => val > 0)

    return {
      volume: calculateVolumeYAxisRange(volumes),
      sets: calculateSetsYAxisRange(sets),
    }
  }

  const oneRMRange = calculate1RMRange()
  const volumeSetRanges = calculateVolumeSetRanges()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exercise.baseExercise?.name}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* 1️⃣ 1RM Progress */}
        <div className="flex flex-col gap-2">
          <h4 className="font-medium mb-2">1RM Progress</h4>
          <ChartContainer config={config}>
            <BarChart
              accessibilityLayer
              data={dailyOneRmData}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => format(new Date(value), 'dd MMM')}
              />
              <YAxis
                dataKey="average1RM"
                type="number"
                label={
                  {
                    value: 'kg',
                    dy: 10,
                    dx: 10,
                    position: 'bottom',
                  } as Recharts.LabelProps
                }
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                domain={[oneRMRange.min, oneRMRange.max]}
              />
              <ChartTooltip
                content={({ payload }) => {
                  if (!payload?.length) return null

                  const dayData = payload[0]
                    .payload as (typeof dailyOneRmData)[number]

                  return (
                    <ChartTooltipWrapper>
                      <div>
                        <strong>
                          {format(new Date(dayData.date), 'dd MMM yyyy')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg 1RM:</span>{' '}
                        <strong>{dayData.average1RM} kg</strong>
                      </div>
                      <div className="mt-2 text-sm grid grid-cols-[3fr_1fr_3fr_3fr] gap-2">
                        {dayData.detailedLogs.map((log, idx) => (
                          <Fragment key={idx}>
                            <div>{log.weight}kg</div>
                            <div>x</div>
                            <div>{log.reps} reps</div>
                            <div>1RM {log.estimated1RM.toFixed(1)}</div>
                          </Fragment>
                        ))}
                      </div>
                    </ChartTooltipWrapper>
                  )
                }}
              />
              <Bar
                dataKey="average1RM"
                fill="var(--color-estimated1RM)"
                radius={8}
                maxBarSize={40}
                label={
                  {
                    position: 'top',
                  } as Recharts.LabelProps
                }
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* 2️⃣ Total Volume + Sets */}
        <div className="flex flex-col gap-2">
          <h4 className="font-medium mb-2">Total Volume & Sets</h4>
          <ChartContainer config={config}>
            <BarChart
              accessibilityLayer
              data={exercise.totalVolumeProgress}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  `Week ${getWeek(new Date(value), { weekStartsOn: 1 })}`
                }
              />
              {/* Left Y-axis for total volume */}
              <YAxis
                dataKey="totalVolume"
                type="number"
                yAxisId="left" // This defines the left axis
                label={{
                  value: 'kg',
                  dy: 10,
                  dx: 10,
                  position: 'bottom',
                }}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                domain={[
                  volumeSetRanges.volume.min,
                  volumeSetRanges.volume.max,
                ]}
              />
              {/* Right Y-axis for total sets */}
              <YAxis
                dataKey="totalSets"
                type="number"
                yAxisId="right" // This defines the right axis
                orientation="right"
                label={{
                  value: 'sets',
                  dy: 10,
                  dx: 10,
                  position: 'bottom',
                }}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                domain={[volumeSetRanges.sets.min, volumeSetRanges.sets.max]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {/* Bar for total volume - matches left axis */}
              <Bar
                dataKey="totalVolume"
                yAxisId="left" // This must match the left YAxis
                fill="var(--color-totalVolume)"
                radius={8}
                maxBarSize={40}
                label={{
                  position: 'top',
                }}
              />
              {/* Bar for total sets - matches right axis */}
              <Bar
                dataKey="totalSets"
                yAxisId="right" // This must match the right YAxis
                fill="var(--color-totalSets)"
                radius={8}
                maxBarSize={40}
                label={{
                  position: 'top',
                }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
