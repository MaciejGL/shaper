import { Progress } from '@/components/ui/progress'

export function CompletionStats({
  completedWorkoutsDays,
  totalWorkouts,
  title = 'Progress',
}: {
  completedWorkoutsDays: number
  totalWorkouts: number
  title?: boolean | string
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm text-muted-foreground w-full">
        {title && <div className="flex items-center gap-1">{title}</div>}
        <div className="text-muted-foreground ml-auto">
          {Math.round((completedWorkoutsDays / totalWorkouts) * 100)} %
        </div>
      </div>
      <Progress value={(completedWorkoutsDays / totalWorkouts) * 100} />
    </div>
  )
}
