import { StatsItem } from '@/components/stats-item'
import { Progress } from '@/components/ui/progress'

export function ProgressOverview({
  currentWeekNumber,
  completedWorkoutsDays,
  adherence,
  totalWorkouts,
  weekCount,
}: {
  currentWeekNumber?: number | null
  completedWorkoutsDays: number
  adherence: number
  totalWorkouts: number
  weekCount: number
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 bg-muted p-4 mb-6 rounded-md">
        <StatsItem value={currentWeekNumber ?? 1} label="Current Week" />
        <StatsItem value={adherence} label="Weeks Completed" />
        <StatsItem value={completedWorkoutsDays} label="Workouts Done" />
        <StatsItem
          value={Math.round(totalWorkouts / weekCount)}
          label="Days per week"
        />
      </div>
      <ProgressBar
        completedWorkoutsDays={completedWorkoutsDays}
        totalWorkouts={totalWorkouts}
      />
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
  return (
    <div>
      <p className="text-xs text-right text-muted-foreground">
        {Math.round((completedWorkoutsDays / totalWorkouts) * 100)}%
      </p>

      <Progress value={33} className="w-full" />
    </div>
  )
}
