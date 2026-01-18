'use client'

import { Progress } from '@/components/ui/progress'
import { formatNumber } from '@/lib/utils'

import type { RepMaxConfidence } from './types'

interface Suggestion {
  reps: number
  percentOf1RM: number
  displayWeight: number
  confidence: RepMaxConfidence
}

export function RepMaxGrid({
  latestOneRMKg,
  weightUnit,
  suggestions,
}: {
  latestOneRMKg: number | null
  weightUnit: 'kg' | 'lbs'
  suggestions: Suggestion[]
}) {
  if (suggestions.length === 0 || !latestOneRMKg) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-card/50 rounded-xl border border-border">
        <p>Log a session to see rep-max suggestions.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium">Est. Maxes</p>
        <div className="flex items-baseline gap-1.5 text-sm">
          <span className="text-muted-foreground">1RM:</span>
          <span className="font-bold tabular-nums">
            {formatNumber(latestOneRMKg, 1)} {weightUnit}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-3">
        {suggestions.map((s) => {
          return (
            <div
              key={s.reps}
              className="flex flex-col justify-center gap-1.5 py-1"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground w-12 whitespace-nowrap">
                  {s.reps} {s.reps === 1 ? 'Rep' : 'Reps'}
                </span>
                <span className="font-bold tabular-nums text-foreground">
                  {formatNumber(s.displayWeight, 1)}{' '}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {weightUnit}
                  </span>
                </span>
              </div>

              <Progress
                value={s.percentOf1RM}
                className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
