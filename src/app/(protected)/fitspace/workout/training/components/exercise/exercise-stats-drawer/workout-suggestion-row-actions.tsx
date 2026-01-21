import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { GQLWeightUnit } from '@/generated/graphql-client'
import { formatNumber } from '@/lib/utils'
import { convertToKg } from '@/lib/weight-utils'

import {
  buildDeltaOptions,
  shouldUseTwoDecimals,
} from './workout-suggestions.utils'

interface WorkoutSuggestionRowActionsProps {
  setId: string
  suggestionRange: { minDelta: number; maxDelta: number; step: number } | null
  prevWeight: number | null
  prevWeightKg: number | null
  loggedWeight: number | null
  loggedWeightKg: number | null
  weightUnit: GQLWeightUnit
  canMutate: boolean
  isApplyingSuggested: boolean
  applyingKey: string | null
  onApplyDelta: (setId: string, deltaDisplay: number) => void
}

function isSuggestionApplied(args: {
  deltaOptions: number[]
  prevWeightKg: number
  loggedWeightKg: number
  weightUnit: GQLWeightUnit
}): boolean {
  const { deltaOptions, prevWeightKg, loggedWeightKg, weightUnit } = args
  return deltaOptions.some((delta) => {
    const deltaKg = convertToKg(delta, weightUnit)
    const suggestedWeightKg = prevWeightKg + deltaKg
    return Math.abs(suggestedWeightKg - loggedWeightKg) < 1e-4
  })
}

export function WorkoutSuggestionRowActions({
  setId,
  suggestionRange,
  prevWeight,
  prevWeightKg,
  loggedWeight,
  loggedWeightKg,
  weightUnit,
  canMutate,
  isApplyingSuggested,
  applyingKey,
  onApplyDelta,
}: WorkoutSuggestionRowActionsProps) {
  const canSuggest =
    !!suggestionRange &&
    typeof prevWeightKg === 'number' &&
    typeof prevWeight === 'number'

  const deltaOptions =
    canSuggest && canMutate ? buildDeltaOptions(suggestionRange) : []

  const isApplied =
    canSuggest &&
    typeof loggedWeightKg === 'number' &&
    typeof prevWeightKg === 'number' &&
    isSuggestionApplied({
      deltaOptions,
      prevWeightKg,
      loggedWeightKg,
      weightUnit,
    })

  const weightDecimals =
    suggestionRange && shouldUseTwoDecimals(suggestionRange.step) ? 2 : 1

  const appliedWeightLabel =
    typeof loggedWeight === 'number'
      ? `${formatNumber(loggedWeight, weightDecimals)}${weightUnit}`
      : null

  if (isApplied) {
    return (
      <Button
        size="xs"
        variant="secondary"
        disabled
        iconStart={<Check className="size-3 text-green-600" />}
        className="animate-in fade-in duration-200 text-green-600 text-sm"
      >
        <span className="tabular-nums whitespace-nowrap text-green-600">
          Applied{appliedWeightLabel ? ': ' : ''}
          {appliedWeightLabel ? (
            <span className="font-semibold">{appliedWeightLabel}</span>
          ) : (
            ''
          )}
        </span>
      </Button>
    )
  }

  if (!canSuggest || !canMutate) return null

  return deltaOptions.map((delta) => {
    const labelDecimals = shouldUseTwoDecimals(suggestionRange.step) ? 2 : 1
    const label = `+${formatNumber(delta, labelDecimals)}${weightUnit}`
    const key = `${setId}:${delta}`
    return (
      <Button
        key={key}
        size="xs"
        variant="secondary"
        loading={applyingKey === key}
        disabled={isApplyingSuggested || !!applyingKey}
        onClick={() => onApplyDelta(setId, delta)}
      >
        {label}
      </Button>
    )
  })
}
