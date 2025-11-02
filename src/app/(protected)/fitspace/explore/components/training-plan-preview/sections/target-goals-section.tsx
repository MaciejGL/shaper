import { translateTargetGoal } from '@/utils/translate-target-goal'

interface TargetGoalsSectionProps {
  targetGoals: string[]
}

export function TargetGoalsSection({ targetGoals }: TargetGoalsSectionProps) {
  if (!targetGoals || targetGoals.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm">What You'll Achieve</h3>
      <ul className="space-y-1">
        {targetGoals.map((goal: string, index: number) => (
          <li
            key={index}
            className="text-sm text-muted-foreground flex items-start gap-2"
          >
            <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
            {translateTargetGoal(goal as any)}
          </li>
        ))}
      </ul>
    </div>
  )
}
