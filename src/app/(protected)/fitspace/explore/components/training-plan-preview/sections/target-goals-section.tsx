import { Badge } from '@/components/ui/badge'
import { GQLTargetGoal } from '@/generated/graphql-client'
import { translateTargetGoal } from '@/utils/translate-target-goal'

interface TargetGoalsSectionProps {
  targetGoals: string[]
}

export function TargetGoalsSection({ targetGoals }: TargetGoalsSectionProps) {
  if (!targetGoals || targetGoals.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-2 text-base">Goals</h3>
      <div className="flex flex-wrap gap-1">
        {targetGoals.map((goal: string, index: number) => (
          <Badge
            key={index}
            size="md-lg"
            variant="primary"
            className="capitalize rounded-full"
          >
            {translateTargetGoal(goal as GQLTargetGoal)}
          </Badge>
        ))}
      </div>
    </div>
  )
}
