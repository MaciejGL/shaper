import { cn } from '@/lib/utils'

// Heatmap color configuration - Positive, friendly colors for muscle intensity visualization
export const HEATMAP_COLORS = {
  levels: [
    {
      threshold: 0.6,
      fillColor: cn('fill-orange-600'),
      bgColor: cn('bg-orange-600'),
      textColor: cn('text-black'),
      label: 'Excellent',
    },
    {
      threshold: 0.45,
      fillColor: cn('fill-orange-500'),
      bgColor: cn('bg-orange-500'),
      textColor: cn('text-black'),
      label: 'Great',
    },
    {
      threshold: 0.3,
      fillColor: cn('fill-orange-400'),
      bgColor: cn('bg-orange-400'),
      textColor: cn('text-black'),
      label: 'Good',
    },
    {
      threshold: 0.15,
      fillColor: cn('fill-orange-200'),
      bgColor: cn('bg-orange-200'),
      textColor: cn('text-black'),
      label: 'Light',
    },
    {
      threshold: 0,
      fillColor: cn('fill-orange-100'),
      bgColor: cn('bg-orange-100'),
      textColor: cn('text-black'),
      label: 'None',
    },
  ],
  getColorForIntensity: (intensity: number) => {
    const level = HEATMAP_COLORS.levels.find(
      (level) => intensity >= level.threshold,
    )
    return level || HEATMAP_COLORS.levels[HEATMAP_COLORS.levels.length - 1]
  },
}

// Helper functions for heatmap styling
export const getIntensityColor = (intensity: number) => {
  const colorLevel = HEATMAP_COLORS.getColorForIntensity(intensity)
  return cn(colorLevel.fillColor)
}

// Volume thresholds for Quick Stats categorization
export const VOLUME_THRESHOLDS = {
  HIGH: 0.45,
  MEDIUM_MIN: 0.19,
  MEDIUM_MAX: 0.45,
  LOW_MIN: 0.0,
  LOW_MAX: 0.19,
} as const
