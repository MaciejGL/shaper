import { Progress } from '@/components/ui/progress'

export function CompletionStats({
  adherence,
  completedWorkoutsDays,
  totalWorkouts,
}: {
  adherence: number
  completedWorkoutsDays: number
  totalWorkouts: number
}) {
  return (
    <div>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>
            {completedWorkoutsDays} of {totalWorkouts} workouts completed
          </span>
        </div>
        <div className="text-muted-foreground">{adherence}% adherence</div>
      </div>
      <Progress value={adherence} />
    </div>
  )
}
