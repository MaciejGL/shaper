import type { GQLWeightUnit } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { WorkoutSuggestionRowActions } from './workout-suggestion-row-actions'
import { WorkoutSuggestionRowPrevPerformance } from './workout-suggestion-row-prev-performance'
import { WorkoutSuggestionRowSetBadge } from './workout-suggestion-row-set-badge'
import type { WorkoutSuggestionRowModel } from './workout-suggestions.types'
import { shouldUseTwoDecimals } from './workout-suggestions.utils'

interface WorkoutSuggestionRowProps {
  row: WorkoutSuggestionRowModel
  weightUnit: GQLWeightUnit
  canMutate: boolean
  isApplyingSuggested: boolean
  applyingKey: string | null
  onApplyDelta: (setId: string, deltaDisplay: number) => void
}

export function WorkoutSuggestionRow({
  row,
  weightUnit,
  canMutate,
  isApplyingSuggested,
  applyingKey,
  onApplyDelta,
}: WorkoutSuggestionRowProps) {
  const range = row.suggestionRange
  const weightDecimals = range && shouldUseTwoDecimals(range.step) ? 2 : 1

  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr] items-center gap-4 py-1.5 pl-1.5 pr-4 rounded-2xl bg-card-on-card',
      )}
    >
      <WorkoutSuggestionRowSetBadge order={row.order} />

      <div className="min-w-0 grid grid-cols-[1fr_auto] gap-3 items-center">
        <WorkoutSuggestionRowPrevPerformance
          prevReps={row.prevReps}
          prevWeight={row.prevWeight}
          overshootReps={row.overshootReps}
          weightUnit={weightUnit}
          weightDecimals={weightDecimals}
        />

        <div className="flex flex-wrap justify-center gap-2">
          <WorkoutSuggestionRowActions
            setId={row.setId}
            suggestionRange={row.suggestionRange}
            prevWeight={row.prevWeight}
            prevWeightKg={row.prevWeightKg}
            loggedWeight={row.loggedWeight}
            loggedWeightKg={row.loggedWeightKg}
            weightUnit={weightUnit}
            canMutate={canMutate}
            isApplyingSuggested={isApplyingSuggested}
            applyingKey={applyingKey}
            onApplyDelta={onApplyDelta}
          />
        </div>
      </div>
    </div>
  )
}
