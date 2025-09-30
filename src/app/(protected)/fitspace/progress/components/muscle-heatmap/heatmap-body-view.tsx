'use client'

import { FrontBodyView } from '@/components/human-body/body-front/body-front'
import { cn } from '@/lib/utils'

interface HeatmapBodyViewProps {
  muscleIntensity: Record<string, number>
  selectedMuscle: string | null
  onMuscleClick: (muscle: string) => void
}

export function HeatmapBodyView({
  muscleIntensity,
  selectedMuscle,
  onMuscleClick,
}: HeatmapBodyViewProps) {
  const getPathProps = (aliases: string[]) => {
    // Find the muscle with highest intensity from aliases
    const muscleKey = aliases.find(
      (alias) => muscleIntensity[alias.toLowerCase()] !== undefined,
    )
    const intensity = muscleKey ? muscleIntensity[muscleKey.toLowerCase()] : 0

    // Convert intensity to color (0-1 scale to color intensity)
    const getIntensityColor = (intensity: number) => {
      if (intensity >= 0.8) return 'fill-red-500'
      if (intensity >= 0.6) return 'fill-orange-500'
      if (intensity >= 0.4) return 'fill-yellow-500'
      if (intensity >= 0.2) return 'fill-green-500'
      return 'fill-gray-300'
    }

    const getIntensityOpacity = (intensity: number) => {
      return Math.max(0.3, intensity) // Minimum 30% opacity
    }

    return {
      className: cn(
        'cursor-pointer transition-all duration-200',
        getIntensityColor(intensity),
        selectedMuscle &&
          aliases.includes(selectedMuscle) &&
          'ring-2 ring-blue-500',
      ),
      style: {
        fillOpacity: getIntensityOpacity(intensity),
      },
      onClick: () => {
        if (muscleKey) {
          onMuscleClick(muscleKey)
        }
      },
    }
  }

  const isRegionSelected = (aliases: string[]) => {
    return selectedMuscle ? aliases.includes(selectedMuscle) : false
  }

  const handleRegionClick = (aliases: string[]) => {
    const muscleKey = aliases.find(
      (alias) => muscleIntensity[alias.toLowerCase()] !== undefined,
    )
    if (muscleKey) {
      onMuscleClick(muscleKey)
    }
  }

  return (
    <div className="relative">
      <FrontBodyView
        getPathProps={getPathProps}
        isRegionSelected={isRegionSelected}
        handleRegionClick={handleRegionClick}
      />

      {/* Intensity Legend */}
      <div className="absolute top-4 right-4 space-y-1">
        <div className="text-xs font-medium text-muted-foreground">
          Intensity
        </div>
        <div className="space-y-1">
          {[
            { color: 'bg-red-500', label: 'High' },
            { color: 'bg-orange-500', label: 'Med-High' },
            { color: 'bg-yellow-500', label: 'Medium' },
            { color: 'bg-green-500', label: 'Low' },
            { color: 'bg-gray-300', label: 'None' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded', item.color)} />
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
