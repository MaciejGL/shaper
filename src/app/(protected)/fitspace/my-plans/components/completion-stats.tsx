import { Progress } from '@/components/ui/progress'

export function CompletionStats({
  completedWorkoutsDays,
  totalWorkouts,
}: {
  completedWorkoutsDays: number
  totalWorkouts: number
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1">Progress</div>
        <div className="text-muted-foreground">
          {Math.round((completedWorkoutsDays / totalWorkouts) * 100)} %
        </div>
      </div>
      <Progress value={(completedWorkoutsDays / totalWorkouts) * 100} />
    </div>
  )
}
