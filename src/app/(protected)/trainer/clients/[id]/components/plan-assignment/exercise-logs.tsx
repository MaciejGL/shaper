'use client'

import { RotateCcw, TrendingUp, Weight } from 'lucide-react'

import { dayNames } from '@/app/(protected)/trainer/trainings/creator/components/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GQLGetClientByIdQuery } from '@/generated/graphql-client'

interface ExerciseLogsProps {
  plan: NonNullable<GQLGetClientByIdQuery['getClientActivePlan']>
}

type Exercise = NonNullable<
  GQLGetClientByIdQuery['getClientActivePlan']
>['weeks'][number]['days'][number]['exercises'][number]

export function ExerciseLogs({ plan }: ExerciseLogsProps) {
  // Get all exercises from completed workouts
  const getAllExercises = () => {
    const exercises: (Exercise & {
      weekName: string
      dayName: string
      completedAt?: string | null
    })[] = []

    plan.weeks.forEach((week) => {
      week.days.forEach((day) => {
        if (day.completedAt && !day.isRestDay) {
          day.exercises.forEach((exercise) => {
            exercises.push({
              ...exercise,
              weekName: week.name || `Week ${plan.weeks.indexOf(week) + 1}`,
              dayName: dayNames[day.dayOfWeek],
              completedAt: day.completedAt,
            })
          })
        }
      })
    })

    return exercises
  }

  const getExerciseProgress = (exerciseName: string) => {
    const exerciseInstances = getAllExercises().filter(
      (ex) => ex.name === exerciseName,
    )
    if (exerciseInstances.length === 0) return null

    const firstInstance = exerciseInstances[0]
    const lastInstance = exerciseInstances[exerciseInstances.length - 1]

    // Calculate average weight progression
    const getAverageWeight = (exercise: Exercise) => {
      const weights = exercise.sets
        .flatMap((set) =>
          set.logs.length > 0
            ? set.logs.map((log) => log.weight)
            : [set.weight],
        )
        .filter((w): w is number => w !== null && w !== undefined && w > 0)
      return weights.length > 0
        ? weights.reduce((a, b) => a + b, 0) / weights.length
        : 0
    }

    const firstWeight = getAverageWeight(firstInstance)
    const lastWeight = getAverageWeight(lastInstance)
    const improvement = lastWeight - firstWeight

    return {
      sessions: exerciseInstances.length,
      weightImprovement: improvement,
      improvementPercentage:
        firstWeight > 0 ? (improvement / firstWeight) * 100 : 0,
    }
  }

  const uniqueExercises = [...new Set(getAllExercises().map((ex) => ex.name))]
  const recentExercises = getAllExercises().slice(-10) // Last 10 completed exercises

  return (
    <div className="space-y-6">
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
          <TabsTrigger value="progress">Exercise Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Exercise Sessions</h3>
          {recentExercises.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No completed exercises yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentExercises.map((exercise, index) => (
                <Card key={`${exercise.id}-${index}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {exercise.name}
                      </CardTitle>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {exercise.weekName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.dayName}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {exercise.sets.map((set) => (
                        <div
                          key={set.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <span className="text-sm font-medium">
                            Set {set.order}
                          </span>
                          <div className="flex items-center gap-4 text-sm">
                            {set.logs.length > 0 ? (
                              <>
                                <span>{set.logs[0].reps} reps</span>
                                <span>{set.logs[0].weight} kg</span>
                                <Badge variant="outline" className="text-xs">
                                  RPE {set.logs[0].rpe}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <span>{set.reps} reps (planned)</span>
                                <span>{set.weight} kg (planned)</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <h3 className="text-lg font-semibold">Exercise Progress Tracking</h3>
          {uniqueExercises.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No exercise data available yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {uniqueExercises.map((exerciseName) => {
                const progress = getExerciseProgress(exerciseName)
                if (!progress) return null

                return (
                  <Card key={exerciseName}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {exerciseName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Sessions</p>
                            <p className="text-lg font-bold">
                              {progress.sessions}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              Weight Progress
                            </p>
                            <p
                              className={`text-lg font-bold ${
                                progress.weightImprovement > 0
                                  ? 'text-green-600'
                                  : progress.weightImprovement < 0
                                    ? 'text-red-600'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {progress.weightImprovement > 0 ? '+' : ''}
                              {progress.weightImprovement.toFixed(1)} kg
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Improvement</p>
                            <p
                              className={`text-lg font-bold ${
                                progress.improvementPercentage > 0
                                  ? 'text-green-600'
                                  : progress.improvementPercentage < 0
                                    ? 'text-red-600'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {progress.improvementPercentage > 0 ? '+' : ''}
                              {progress.improvementPercentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
