import { cn } from '@/lib/utils'

// Progress-based color configuration for weekly muscle heatmap
// Colors represent progress toward weekly target (12 sets = 100%)
export const HEATMAP_COLORS = {
  levels: [
    {
      threshold: 1.0, // 100% - Complete
      fillColor: cn('fill-orange-500'),
      bgColor: cn('bg-orange-500'),
      textColor: cn('text-white'),
      progressColor: cn('bg-orange-500 dark:bg-orange-500'),
      label: 'Complete',
    },
    {
      threshold: 0.75, // 75-99%
      fillColor: cn('fill-orange-400'),
      bgColor: cn('bg-orange-400'),
      textColor: cn('text-white'),
      progressColor: cn('bg-orange-400 dark:bg-orange-400'),
      label: 'Almost',
    },
    {
      threshold: 0.5, // 50-74%
      fillColor: cn('fill-orange-300'),
      bgColor: cn('bg-orange-300'),
      textColor: cn('text-orange-900'),
      progressColor: cn('bg-orange-300 dark:bg-orange-300'),
      label: 'Good',
    },
    {
      threshold: 0.25, // 25-49%
      fillColor: cn('fill-orange-200'),
      bgColor: cn('bg-orange-200'),
      textColor: cn('text-orange-900'),
      progressColor: cn('bg-orange-200 dark:bg-orange-200'),
      label: 'Started',
    },
    {
      threshold: 0.01, // 1-24%
      fillColor: cn('fill-orange-100'),
      bgColor: cn('bg-orange-100'),
      textColor: cn('text-orange-800'),
      progressColor: cn('bg-orange-100 dark:bg-orange-100'),
      label: 'Light',
    },
    {
      threshold: 0, // 0% - Not trained
      fillColor: cn('fill-neutral-500 dark:fill-neutral-700'),
      bgColor: cn('bg-neutral-500 dark:bg-neutral-700'),
      textColor: cn('text-muted-foreground'),
      progressColor: cn('bg-neutral-500 dark:bg-neutral-500'),
      label: 'None',
    },
  ],
  getColorForProgress: (progress: number) => {
    // Progress is 0-1 (representing 0-100%)
    const level = HEATMAP_COLORS.levels.find(
      (level) => progress >= level.threshold,
    )
    return level || HEATMAP_COLORS.levels[HEATMAP_COLORS.levels.length - 1]
  },
  // Alias for backward compatibility
  getColorForIntensity: (intensity: number) => {
    return HEATMAP_COLORS.getColorForProgress(intensity)
  },
}

// Helper function for body SVG fill colors
export const getProgressColor = (progress: number) => {
  const colorLevel = HEATMAP_COLORS.getColorForProgress(progress)
  return cn(colorLevel.fillColor)
}

// Alias for backward compatibility
export const getIntensityColor = getProgressColor
