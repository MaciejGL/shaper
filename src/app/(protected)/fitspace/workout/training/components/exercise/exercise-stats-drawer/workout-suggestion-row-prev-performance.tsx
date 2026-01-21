import type { GQLWeightUnit } from '@/generated/graphql-client'
import { formatNumber } from '@/lib/utils'

interface WorkoutSuggestionRowPrevPerformanceProps {
  prevReps: number | null
  prevWeight: number | null
  overshootReps: number | null
  weightUnit: GQLWeightUnit
  weightDecimals: number
}

export function WorkoutSuggestionRowPrevPerformance({
  prevReps,
  prevWeight,
  overshootReps,
  weightUnit,
  weightDecimals,
}: WorkoutSuggestionRowPrevPerformanceProps) {
  return (
    <div className="min-w-0">
      <div className="text-sm font-medium tabular-nums flex items-baseline gap-2 min-w-0">
        <span className="shrink-0 text-muted-foreground">
          {typeof prevReps === 'number' ? prevReps : '—'}
          <span className="ml-1 text-muted-foreground/70">×</span>
        </span>
        <div className="flex items-baseline min-w-0 gap-1">
          <span className="shrink-0 text-lg">
            {typeof prevWeight === 'number'
              ? formatNumber(prevWeight, weightDecimals)
              : '—'}
          </span>
          {typeof prevWeight === 'number' ? (
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {weightUnit}
            </span>
          ) : null}
        </div>
      </div>

      {typeof overshootReps === 'number' && overshootReps >= 1 ? (
        <div className="text-xs font-medium text-success shrink-0">
          +{overshootReps} reps above
        </div>
      ) : null}
    </div>
  )
}

