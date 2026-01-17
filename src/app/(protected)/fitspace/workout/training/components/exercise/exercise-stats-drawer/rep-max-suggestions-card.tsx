'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn, formatNumber } from '@/lib/utils'

import type { RepMaxConfidence } from './types'

const CONFIDENCE_CONFIG: Record<
  RepMaxConfidence,
  { label: string; className: string }
> = {
  high: { label: 'High', className: 'bg-green-500/15 text-green-600' },
  medium: { label: 'Med', className: 'bg-amber-500/15 text-amber-600' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
}

export function RepMaxSuggestionsCard({
  latestOneRMKg,
  weightUnit,
  suggestions,
}: {
  latestOneRMKg: number | null
  weightUnit: 'kg' | 'lbs'
  suggestions: {
    reps: number
    percentOf1RM: number
    displayWeight: number
    confidence: RepMaxConfidence
  }[]
}) {
  return (
    <Card variant="secondary" className="p-0 overflow-hidden shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Rep-max suggestions</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {latestOneRMKg ? 'NSCA Load Chart' : 'No 1RM data'}
          </p>
        </div>
        {latestOneRMKg ? (
          <p className="text-xs text-muted-foreground mt-1">
            Based on estimated 1RM of {formatNumber(latestOneRMKg, 1)} kg
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="pb-4 px-0">
        {suggestions.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 px-4">
            Log a session to see suggestions.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {suggestions.map((row) => {
              const conf = CONFIDENCE_CONFIG[row.confidence]
              return (
                <div key={row.reps} className="py-2.5 px-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium tabular-nums w-14">
                        {row.reps} rep{row.reps > 1 ? 's' : ''}
                      </p>

                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px] px-1.5 py-0 h-4 font-medium',
                          conf.className,
                        )}
                      >
                        Confidence:{' '}
                        <span className="capitalize font-bold">
                          {conf.label}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {row.percentOf1RM}%
                      </span>
                      <p className="text-sm font-semibold tabular-nums">
                        {formatNumber(row.displayWeight, 1)} {weightUnit}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={row.percentOf1RM} duration={650} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
