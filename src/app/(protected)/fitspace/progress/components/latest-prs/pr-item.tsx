'use client'

import { Trophy } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { formatConditionalDate } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

interface PRItemProps {
  pr: {
    id: string
    exerciseName?: string
    weight: number
    reps: number
    estimated1RM: number
    achievedAt: string
  }
  onClick?: () => void
}

export function PRItem({ pr, onClick }: PRItemProps) {
  const { toDisplayWeight, weightUnit } = useWeightConversion()

  return (
    <Card
      variant="tertiary"
      className={cn(
        'py-3 shadow-none',
        onClick
          ? 'cursor-pointer hover:bg-card-on-card/80 transition-colors'
          : '',
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3">
        <div
          className={cn(
            'flex size-6 items-center justify-center shrink-0 rounded-full bg-amber-500 text-white',
          )}
        >
          <Trophy className="h-3 w-3" />
        </div>
        <div className="flex justify-between w-full">
          <div>
            <div className="font-medium text-sm">{pr.exerciseName}</div>
            <div className="text-xs text-muted-foreground">
              {formatConditionalDate(pr.achievedAt)}
            </div>
          </div>

          <div className="text-right">
            <div className="font-medium text-sm">
              {toDisplayWeight(pr.estimated1RM)?.toFixed(1)} {weightUnit}
            </div>
            <div className="text-xs text-muted-foreground">
              {toDisplayWeight(pr.weight)?.toFixed(1)} {weightUnit} × {pr.reps}{' '}
              reps
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
