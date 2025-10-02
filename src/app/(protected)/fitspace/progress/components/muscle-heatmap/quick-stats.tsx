import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { HEATMAP_COLORS } from '../../constants/heatmap-colors'

import type { QuickStatsProps } from './types'

export function QuickStats({
  muscleIntensity,
  muscleCategorization,
}: QuickStatsProps) {
  // Helper function to get badge color based on intensity
  const getBadgeColorClass = (intensity: number) => {
    const colorLevel = HEATMAP_COLORS.getColorForIntensity(intensity)
    return cn(
      'border-0 text-white font-medium',
      colorLevel.bgColor,
      colorLevel.textColor,
    )
  }

  // Use the new categorization logic based on training volume share and recency
  const overfocused = muscleCategorization.overfocused
    .map(
      (groupName) =>
        [groupName, muscleIntensity[groupName] || 0] as [string, number],
    )
    .sort(([, a], [, b]) => b - a)

  const balanced = muscleCategorization.balanced
    .map(
      (groupName) =>
        [groupName, muscleIntensity[groupName] || 0] as [string, number],
    )
    .sort(([, a], [, b]) => b - a)

  const underfocused = muscleCategorization.underfocused
    .map(
      (groupName) =>
        [groupName, muscleIntensity[groupName] || 0] as [string, number],
    )
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="space-y-2">
        <div className="text-sm font-medium">Primary Focus</div>
        <div className="flex flex-col gap-1">
          {overfocused.map(([muscleName, intensity]) => (
            <Badge
              key={muscleName}
              className={cn('w-full', getBadgeColorClass(intensity))}
              size="md"
            >
              {muscleName}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">Well-Balanced</div>
        <div className="flex flex-col gap-1">
          {balanced.map(([muscleName, intensity]) => (
            <Badge
              key={muscleName}
              className={cn('w-full', getBadgeColorClass(intensity))}
              size="md"
            >
              {muscleName}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">Light Focus</div>
        <div className="flex flex-col gap-1">
          {underfocused.map(([muscleName, intensity]) => (
            <Badge
              key={muscleName}
              className={cn('w-full', getBadgeColorClass(intensity))}
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
