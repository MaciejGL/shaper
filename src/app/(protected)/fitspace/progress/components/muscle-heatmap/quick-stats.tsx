import { Badge } from '@/components/ui/badge'

import { VOLUME_THRESHOLDS } from '../../constants/heatmap-colors'

import type { QuickStatsProps } from './types'

export function QuickStats({ muscleIntensity }: QuickStatsProps) {
  // Now muscleIntensity contains muscle group names as keys (e.g., "Shoulders", "Chest")
  // We can use the keys directly as they are already the display names
  const muscleEntries = Object.entries(muscleIntensity).map(
    ([groupName, intensity]) => {
      return [groupName, intensity] as [string, number]
    },
  )

  // Use thresholds from constants
  const highOverload = muscleEntries
    .filter(([, intensity]) => intensity >= VOLUME_THRESHOLDS.HIGH)
    .sort(([, a], [, b]) => b - a)

  const mediumOverload = muscleEntries
    .filter(
      ([, intensity]) =>
        intensity >= VOLUME_THRESHOLDS.MEDIUM_MIN &&
        intensity < VOLUME_THRESHOLDS.MEDIUM_MAX,
    )
    .sort(([, a], [, b]) => b - a)

  const lowOverload = muscleEntries
    .filter(
      ([, intensity]) =>
        intensity >= VOLUME_THRESHOLDS.LOW_MIN &&
        intensity < VOLUME_THRESHOLDS.LOW_MAX,
    )
    .sort(([, a], [, b]) => b - a)

  // Debug: console.log(highOverload, mediumOverload, lowOverload)

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="space-y-2">
        <div className="text-sm font-medium">High Volume</div>
        <div className="flex flex-col gap-1">
          {highOverload.map(([muscleName]) => (
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
        <div className="text-sm font-medium">Medium Volume</div>
        <div className="flex flex-col gap-1">
          {mediumOverload.map(([muscleName]) => (
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
        <div className="text-sm font-medium">Low Volume</div>
        <div className="flex flex-col gap-1">
          {lowOverload.map(([muscleName]) => (
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
