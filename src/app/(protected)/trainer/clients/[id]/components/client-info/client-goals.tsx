import { Badge } from '@/components/ui/badge'

export function ClientGoals({ goals }: { goals: string[] }) {
  if (!goals || goals.length === 0) {
    return (
      <div className="pt-2">
        <h4 className="font-medium mb-2">Goals</h4>
        <div className="text-sm text-muted-foreground">No goals set.</div>
      </div>
    )
  }

  return (
    <div className="pt-2">
      <h4 className="font-medium mb-2">Goals</h4>
      <ul className="space-y-1 text-sm">
        {goals.map((goal) => (
          <li key={goal}>
            <Badge variant="outline">{goal}</Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}
