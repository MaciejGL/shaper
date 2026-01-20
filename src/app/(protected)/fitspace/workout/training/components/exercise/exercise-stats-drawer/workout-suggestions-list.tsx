'use client'

import { ArrowUp, Plus } from 'lucide-react'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'

export function WorkoutSuggestionsList({
  sets,
  previousLogs,
  weightUnit,
  toDisplayWeight,
  onApplySuggested,
  isApplyingSuggested = false,
}: {
  sets: {
    setId: string
    order: number
    minReps: number | null
    maxReps: number | null
  }[]
  previousLogs:
    | {
        order: number
        log?: { reps?: number | null; weight?: number | null } | null
      }[]
    | null
  weightUnit: 'kg' | 'lbs'
  toDisplayWeight: (weightKg: number | null | undefined) => number | null
  onApplySuggested?: (
    suggestions: { setId: string; suggestedWeightKg: number }[],
  ) => void
  isApplyingSuggested?: boolean
}) {
  const stepDisplay = weightUnit === 'lbs' ? 5 : 2.5
  const stepKg = weightUnit === 'lbs' ? stepDisplay / 2.2046226218 : stepDisplay

  const rows = useMemo(() => {
    return sets
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => {
        const prev = previousLogs?.find((p) => p.order === s.order) ?? null
        const prevReps = prev?.log?.reps ?? null
        const prevWeightKg = prev?.log?.weight ?? null
        const max = typeof s.maxReps === 'number' ? s.maxReps : null
        const min = typeof s.minReps === 'number' ? s.minReps : null

        const shouldIncrease =
          typeof prevReps === 'number' &&
          typeof prevWeightKg === 'number' &&
          (max ? prevReps >= max : min ? prevReps >= min : false)

        const suggestedKg =
          typeof prevWeightKg === 'number'
            ? prevWeightKg + (shouldIncrease ? stepKg : 0)
            : null

        return {
          setId: s.setId,
          order: s.order,
          range:
            min && max
              ? min === max
                ? `${min}`
                : `${min}-${max}`
              : min
                ? `${min}+`
                : max
                  ? `1-${max}`
                  : null,
          prevReps,
          prevWeight: toDisplayWeight(prevWeightKg),
          suggested: toDisplayWeight(suggestedKg),
          suggestedKg,
          shouldIncrease,
        }
      })
  }, [previousLogs, sets, stepKg, toDisplayWeight])

  if (rows.length === 0) return null

  const canApply = rows.some((r) => typeof r.suggestedKg === 'number')

  const applySuggestions = () => {
    const suggestions = rows
      .filter(
        (r): r is typeof r & { suggestedKg: number } =>
          typeof r.suggestedKg === 'number',
      )
      .map((r) => ({ setId: r.setId, suggestedWeightKg: r.suggestedKg }))

    if (suggestions.length === 0) return
    onApplySuggested?.(suggestions)
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-baseline justify-between">
        <p className="text-lg font-medium">Suggested load</p>
        {onApplySuggested ? (
          <Button
            size="sm"
            loading={isApplyingSuggested}
            disabled={!canApply || isApplyingSuggested}
            onClick={applySuggestions}
            iconStart={<Plus />}
          >
            Apply loads
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden space-y-2">
        {rows.map((row) => {
          const repsLabel = row.range ?? '—'

          return (
            <div
              key={row.order}
              className={[
                'grid grid-cols-[auto_1fr] items-center gap-4 p-1.5 rounded-2xl bg-card-on-card',
              ].join(' ')}
            >
              <div className="dark text-xs font-medium tabular-nums text-muted-foreground flex-center size-10 bg-black/90 rounded-xl flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {row.order}
                </span>
                <span className="text-[10px] tabular-nums uppercase text-muted-foreground shrink-0">
                  Set
                </span>
              </div>

              <div className="text-sm font-medium tabular-nums flex items-baseline gap-1.5 min-w-0">
                <span className="shrink-0 text-muted-foreground">
                  {repsLabel}
                </span>
                <span className="text-muted-foreground/70 shrink-0">×</span>
                <div className="flex items-baseline min-w-0">
                  <span className="shrink-0 text-lg">
                    {typeof row.suggested === 'number'
                      ? formatNumber(row.suggested, 1)
                      : '—'}
                  </span>
                  {typeof row.suggested === 'number' ? (
                    <span className="text-xs font-medium text-muted-foreground shrink-0">
                      {weightUnit}
                    </span>
                  ) : null}
                </div>
                {row.shouldIncrease ? (
                  <Badge
                    variant="primary"
                    size="xs"
                    className="ml-2 h-5 px-1.5"
                  >
                    <ArrowUp className="size-3" />
                    {formatNumber(stepDisplay, 1)}
                    {weightUnit}
                  </Badge>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
