import { Badge } from '@/components/ui/badge'

import type { QuickStatsProps } from './types'

export function QuickStats({
  muscleIntensity,
  rawMuscleData,
}: QuickStatsProps) {
  // Use the same individual muscle data as heatmap - no grouping
  const muscleEntries = Object.entries(muscleIntensity).map(
    ([muscleId, intensity]) => {
      const muscle = rawMuscleData?.find((m) => m.muscleId === muscleId)
      return [muscle?.muscleAlias || 'Unknown', intensity] as [string, number]
    },
  )

  // Use same thresholds as heatmap color levels
  const highFocus = muscleEntries
    .filter(([, intensity]) => intensity >= 0.8) // Excellent level
    .sort(([, a], [, b]) => b - a)

  const mediumFocus = muscleEntries
    .filter(([, intensity]) => intensity >= 0.4 && intensity < 0.8) // Good to Great levels
    .sort(([, a], [, b]) => b - a)

  const lowFocus = muscleEntries
    .filter(([, intensity]) => intensity >= 0.05 && intensity < 0.4) // Light to Good levels
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="space-y-2">
        <div className="text-sm font-medium">High Focus</div>
        <div className="flex flex-col gap-1">
          {highFocus.map(([muscleName]) => (
            <Badge
              key={muscleName}
              variant="secondary"
              className="w-full"
              size="md"
            >
              {muscleName}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">Medium Focus</div>
        <div className="flex flex-col gap-1">
          {mediumFocus.map(([muscleName]) => (
            <Badge
              key={muscleName}
              variant="secondary"
              className="w-full"
              size="md"
            >
              {muscleName}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">Low Focus</div>
        <div className="flex flex-col gap-1">
          {lowFocus.map(([muscleName]) => (
            <Badge
              key={muscleName}
              variant="secondary"
              className="w-full"
              size="md"
            >
              {muscleName}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
