'use client'

import { Award, Calendar, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { GQLGetClientByIdQuery } from '@/generated/graphql-client'

interface ProgressOverviewProps {
  plan: NonNullable<GQLGetClientByIdQuery['getClientActivePlan']>
}

export function ProgressOverview({ plan }: ProgressOverviewProps) {
  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return 'text-green-600'
    if (adherence >= 60) return 'text-yellow-600'
    return 'text-primary'
  }

  const currentWeek =
    plan.weeks[plan.currentWeekNumber ? plan.currentWeekNumber - 1 : 0]

  const completedWorkouts = plan.weeks.flatMap((week) =>
    week.days.filter((day) => !day.isRestDay && day.completedAt),
  )

  const averageSessionLength =
    plan.weeks.reduce((acc, week) => {
      return (
        acc +
        week.days.reduce((acc, day) => {
          return acc + (day?.duration ?? 0)
        }, 0)
      )
    }, 0) /
    60 /
    completedWorkouts.length

  const weeksCompleted = plan.weeks.filter((week) => week.completedAt).length

  return (
    <div className="space-y-6">
      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(plan.progress ?? 0)}%
            </div>
            <Progress value={plan.progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Week {weeksCompleted} of {plan.weekCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avarage Session Length
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getAdherenceColor(plan.adherence)}`}
            >
              {Math.round(averageSessionLength)} minutes
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {plan.completedWorkoutsDays} of {plan.totalWorkouts} workouts
              completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.currentWeekNumber}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {currentWeek?.name || `Week ${plan.currentWeekNumber}`}
            </p>
            <div className="mt-2">
              {currentWeek?.completedAt ? (
                <Badge variant="secondary" className="text-xs">
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  In Progress
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
