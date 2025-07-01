import { StatsItem } from '@/components/stats-item'
import { Progress } from '@/components/ui/progress'

export function ProgressOverview({
  completedWorkoutsDays,
  currentWeekNumber,
  completedWorkoutsThisWeek,
  totalWorkoutsThisWeek,
  weeksCompleted,
  completedWorkouts,
  totalWorkouts,
  weekCount,
}: {
  completedWorkoutsDays: number
  currentWeekNumber?: number | null
  completedWorkoutsThisWeek: number
  totalWorkoutsThisWeek: number
  weeksCompleted: number
  completedWorkouts: number
  totalWorkouts: number
  weekCount: number
}) {
  return (
    <div>
      <ProgressBar
        completedWorkoutsDays={completedWorkoutsDays}
        totalWorkouts={totalWorkouts}
      />
      <div className="grid grid-cols-2 gap-4 bg-card-on-card p-4 mt-6 rounded-lg">
        <StatsItem
          variant="secondary"
          value={currentWeekNumber ?? 1}
          label="Current Week"
        />
        <StatsItem
          variant="secondary"
          value={
            <div>
              <span>{weeksCompleted}</span>
              <span className="text-xs text-muted-foreground">
                / {weekCount}
              </span>
            </div>
          }
          label="Weeks Completed"
        />
        <StatsItem
          variant="secondary"
          value={
            <div>
              <span>{completedWorkoutsThisWeek}</span>
              <span className="text-xs text-muted-foreground">
                / {totalWorkoutsThisWeek}
              </span>
            </div>
          }
          label="Workouts This Week"
        />
        <StatsItem
          variant="secondary"
          value={
            <div>
              <span>{completedWorkouts}</span>
              <span className="text-xs text-muted-foreground">
                / {totalWorkouts}
              </span>
            </div>
          }
          label="Total workouts"
        />
      </div>
    </div>
  )
}

function ProgressBar({
  completedWorkoutsDays,
  totalWorkouts,
}: {
  completedWorkoutsDays: number
  totalWorkouts: number
}) {
  const progress = Math.round((completedWorkoutsDays / totalWorkouts) * 100)
  return (
    <div>
      <p className="text-xs text-right text-muted-foreground">{progress}%</p>

      <Progress value={progress} className="w-full" />
    </div>
  )
}
