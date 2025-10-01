import { cn } from '@/lib/utils'

// Heatmap color configuration - Positive, friendly colors for muscle intensity visualization
export const HEATMAP_COLORS = {
  levels: [
    {
      threshold: 0.6,
      fillColor: 'fill-orange-600',
      bgColor: 'bg-orange-600',
      label: 'Excellent',
    },
    {
      threshold: 0.45,
      fillColor: 'fill-orange-400',
      bgColor: 'bg-orange-400',
      label: 'Great',
    },
    {
      threshold: 0.3,
      fillColor: 'fill-orange-300',
      bgColor: 'bg-orange-300',
      label: 'Good',
    },
    {
      threshold: 0.15,
      fillColor: 'fill-orange-200',
      bgColor: 'bg-orange-200',
      label: 'Light',
    },
    {
      threshold: 0,
      fillColor: 'fill-orange-100',
      bgColor: 'bg-orange-100',
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

export const getIntensityOpacity = (intensity: number) => {
  return Math.max(0.3, intensity) // Minimum 30% opacity
}

// Volume thresholds for Quick Stats categorization
export const VOLUME_THRESHOLDS = {
  HIGH: 0.6,
  MEDIUM_MIN: 0.3,
  MEDIUM_MAX: 0.6,
  LOW_MIN: 0.05,
  LOW_MAX: 0.3,
} as const
