import { Activity } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type DashboardStatsProps = {
  stats: {
    streak: number
    currentWeight: number
    weightLastWeek: number
    activeWorkout: {
      name: string
      thisWeekSessions: {
        date: string
        type: string
        completed: boolean
        isRestDay: boolean
      }[]
      percentageCompleted: number
      totalCompletedDays: number
      totalDays: number
    }
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const workoutsThisWeekCompleted = stats.activeWorkout.thisWeekSessions.filter(
    (session) => session.completed && !session.isRestDay,
  ).length
  const workoutsThisWeekGoal = stats.activeWorkout.thisWeekSessions.filter(
    (session) => !session.isRestDay,
  ).length

  const diffWeight = stats.currentWeight - stats.weightLastWeek
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold ">{stats.streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold ">
                {stats.currentWeight}kg
                {diffWeight > 0 && (
                  <span className="text-xs text-muted-foreground">
                    +{diffWeight}kg
                  </span>
                )}
                {diffWeight < 0 && (
                  <span className="text-xs text-muted-foreground">
                    {diffWeight}kg
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Current Weight
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.activeWorkout.percentageCompleted}%
              </div>
              <div className="text-xs text-muted-foreground">
                Workouts Completed
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Workouts This Week</span>
              <span className="font-medium">
                {workoutsThisWeekCompleted} of {workoutsThisWeekGoal} workouts
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {stats.activeWorkout.thisWeekSessions.map((session, index) => (
                <div
                  key={index}
                  className={cn(
                    'rounded-md p-2',
                    !session.isRestDay && 'border',
                    session.completed &&
                      !session.isRestDay &&
                      'bg-primary text-primary-foreground',
                    session.isRestDay &&
                      'bg-muted-foreground/10 text-muted-foreground',
                  )}
                >
                  <div className="flex-center flex-col text-xs md:text-sm text-center aspect-square">
                    <span>{getDayOfWeek(session.date)}</span>
                    <span className="font-medium truncate max-md:hidden">
                      {session.type.split(' ').at(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getDayOfWeek(date: string) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
}
