'use client'

import { useMemo, useState } from 'react'

import { convertToKg } from '@/lib/weight-utils'

import { getSuggestedLoadRangeDisplay } from './suggested-load'
import { WorkoutSuggestionRow } from './workout-suggestion-row'
import type {
  WorkoutSuggestionRowModel,
  WorkoutSuggestionsListProps,
} from './workout-suggestions.types'

export function WorkoutSuggestionsList({
  sets,
  previousLogs,
  weightUnit,
  toDisplayWeight,
  equipment,
  onApplySuggested,
  isApplyingSuggested = false,
}: WorkoutSuggestionsListProps) {
  const allRows = useMemo<WorkoutSuggestionRowModel[]>(() => {
    return sets
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => {
        const prev = previousLogs?.find((p) => p.order === s.order) ?? null
        const prevReps = prev?.log?.reps ?? null
        const prevWeightKg = prev?.log?.weight ?? null
        const loggedWeightKg =
          typeof s.loggedWeightKg === 'number' ? s.loggedWeightKg : null
        const max = typeof s.maxReps === 'number' ? s.maxReps : null
        const min = typeof s.minReps === 'number' ? s.minReps : null
        const targetReps =
          typeof max === 'number' ? max : typeof min === 'number' ? min : null
        const overshootReps =
          typeof prevReps === 'number' && typeof targetReps === 'number'
            ? Math.max(0, prevReps - targetReps)
            : null

        const suggestionRange =
          typeof prevReps === 'number' && typeof prevWeightKg === 'number'
            ? getSuggestedLoadRangeDisplay({
                equipment,
                weightUnit,
                prevWeightKg,
                prevReps,
                minReps: min,
                maxReps: max,
              })
            : null

        return {
          setId: s.setId,
          order: s.order,
          prevReps,
          prevWeight: toDisplayWeight(prevWeightKg),
          prevWeightKg,
          loggedWeight: toDisplayWeight(loggedWeightKg),
          loggedWeightKg,
          suggestionRange,
          overshootReps,
        }
      })
  }, [equipment, previousLogs, sets, toDisplayWeight, weightUnit])

  const rows = useMemo(
    () =>
      allRows.filter(
        (r) =>
          typeof r.prevWeightKg === 'number' && typeof r.prevReps === 'number',
      ),
    [allRows],
  )
  const hasRows = rows.length > 0
  const canMutate = typeof onApplySuggested === 'function'

  const [applyingKey, setApplyingKey] = useState<string | null>(null)

  const applyForSet = async (setId: string, deltaDisplay: number) => {
    if (!onApplySuggested || isApplyingSuggested) return

    const row = rows.find((r) => r.setId === setId) ?? null
    if (!row?.suggestionRange) return
    if (
      typeof row.prevWeightKg !== 'number' ||
      typeof row.prevWeight !== 'number'
    )
      return

    const deltaKg = convertToKg(deltaDisplay, weightUnit)
    if (!Number.isFinite(deltaKg) || deltaKg < 0) return

    const prevWeightKg = row.prevWeightKg
    const suggestedWeightKg = prevWeightKg + deltaKg
    const key = `${setId}:${deltaDisplay}`
    setApplyingKey(key)
    try {
      await onApplySuggested([{ setId, suggestedWeightKg }])
    } finally {
      setApplyingKey(null)
    }
  }

  if (!hasRows) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <p className="text-lg font-medium">Suggested load</p>
      </div>

      <div className="overflow-hidden space-y-2">
        {rows.map((row) => (
          <WorkoutSuggestionRow
            key={row.order}
            row={row}
            weightUnit={weightUnit}
            canMutate={canMutate}
            isApplyingSuggested={isApplyingSuggested}
            applyingKey={applyingKey}
            onApplyDelta={applyForSet}
          />
        ))}
      </div>
    </div>
  )
}
