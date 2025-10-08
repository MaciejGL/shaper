import { Card, CardContent } from '@/components/ui/card'
import type { TrainingStats } from '@/lib/ai-training/types'

interface StatsDisplayProps {
  stats: TrainingStats | null
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  if (!stats) return null

  const progress = (stats.approved / stats.targetCount) * 100

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Examples</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.approved}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold">
              {Math.round(progress)}%
              <span className="text-sm text-muted-foreground">
                {' '}
                / {stats.targetCount}
              </span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
