import { BicepsFlexed, TrendingDown, TrendingUp } from 'lucide-react'

import { StatsItem } from '@/components/stats-item'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { formatNumber } from '@/lib/utils'

interface ExerciseProgressStatsProps {
  currentOneRM: number
  improvement: number
}

export function ExerciseProgressStats({
  currentOneRM,
  improvement,
}: ExerciseProgressStatsProps) {
  const { toDisplayWeight, weightUnit } = useWeightConversion()
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 w-full pr-3">
      <StatsItem
        label="Current 1RM"
        value={
          <p className="text-md font-medium flex items-center gap-1">
            {formatNumber(toDisplayWeight(currentOneRM) || 0, 1)}{' '}
            <span className="text-sm">{weightUnit}</span>
          </p>
        }
        icon={<BicepsFlexed className="text-amber-500 size-4" />}
      />
      <StatsItem
        label="Improvement"
        value={
          <p className="text-md font-medium flex items-center gap-1">
            {formatNumber(improvement, 1)} <span className="text-sm">%</span>
          </p>
        }
        icon={
          improvement > 0 ? (
            <TrendingUp className="text-green-500 size-4" />
          ) : improvement < 0 ? (
            <TrendingDown className="text-red-500 size-4" />
          ) : (
            <TrendingUp className="text-muted-foreground size-4" />
          )
        }
      />
    </div>
  )
}
