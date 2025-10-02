import { Badge } from '@/components/ui/badge'
import { GQLGoal } from '@/generated/graphql-client'
import { translateGoal } from '@/utils/goals'

export function ClientGoals({ goals }: { goals: GQLGoal[] }) {
  if (!goals || goals.length === 0) {
    return (
      <div>
        <h4 className="font-medium mb-2">Goals</h4>
        <div className="text-sm text-muted-foreground">No goals set.</div>
      </div>
    )
  }

  return (
    <div>
      <h4 className="font-medium mb-2">Goals</h4>
      <div className="flex flex-wrap gap-2">
        {goals.map((goal) => (
          <Badge key={goal} variant="outline">
            {translateGoal(goal)}
          </Badge>
        ))}
      </div>
    </div>
  )
}
