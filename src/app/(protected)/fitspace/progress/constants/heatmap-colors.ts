import { cn } from '@/lib/utils'

// Volume preset types
export interface VolumePreset {
  id: string
  name: string
  description: string
  targetSets: number
  ranges: {
    low: { min: number; max: number }
    moderate: { min: number; max: number }
    optimal: { min: number; max: number }
    maximum: { min: number }
  }
}

// Training volume presets based on scientific recommendations
export const VOLUME_PRESETS = {
  general: {
    id: 'general',
    name: 'General Fitness',
    description: 'Balanced approach for overall fitness and health',
    targetSets: 16,
    ranges: {
      low: { min: 1, max: 6 },
      moderate: { min: 7, max: 11 },
      optimal: { min: 12, max: 16 },
      maximum: { min: 17 },
    },
  },
  hypertrophy: {
    id: 'hypertrophy',
    name: 'Hypertrophy',
    description: 'Optimized for muscle growth (10-20 sets recommended)',
    targetSets: 20,
    ranges: {
      low: { min: 1, max: 9 },
      moderate: { min: 10, max: 14 },
      optimal: { min: 15, max: 20 },
      maximum: { min: 21 },
    },
  },
  strength: {
    id: 'strength',
    name: 'Strength',
    description:
      'Focused on building strength (lower volume, higher intensity)',
    targetSets: 12,
    ranges: {
      low: { min: 1, max: 4 },
      moderate: { min: 5, max: 8 },
      optimal: { min: 9, max: 12 },
      maximum: { min: 13 },
    },
  },
  maintenance: {
    id: 'maintenance',
    name: 'Maintenance',
    description: 'Minimal effective dose to maintain muscle',
    targetSets: 8,
    ranges: {
      low: { min: 1, max: 3 },
      moderate: { min: 4, max: 5 },
      optimal: { min: 6, max: 8 },
      maximum: { min: 9 },
    },
  },
} as const satisfies Record<string, VolumePreset>

export type VolumePresetId = keyof typeof VOLUME_PRESETS

// Default preset
export const DEFAULT_VOLUME_PRESET = VOLUME_PRESETS.general

// Progress-based color configuration for weekly muscle heatmap
// Colors represent progress toward weekly target (16 sets = 100%)
// 4 colors + neutral: Low (1-6), Moderate (7-11), Optimal (12-16), Maximum (17+)
export const HEATMAP_COLORS = {
  levels: [
    {
      threshold: 1.0625, // 106%+ = 17+ sets - Maximum
      fillColor: cn('fill-orange-500'),
      bgColor: cn('bg-orange-500'),
      textColor: cn('text-white'),
      progressColor: cn('bg-green-500 dark:bg-green-500'),
      label: 'Maximum',
    },
    {
      threshold: 0.75, // 75-106% = 12-16 sets - Optimal
      fillColor: cn('fill-orange-400'),
      bgColor: cn('bg-orange-400'),
      textColor: cn('text-white'),
      progressColor: cn('bg-green-400 dark:bg-green-400'),
      label: 'Optimal',
    },
    {
      threshold: 0.44, // 44-74% = 7-11 sets - Moderate
      fillColor: cn('fill-orange-200'),
      bgColor: cn('bg-orange-200'),
      textColor: cn('text-orange-900'),
      progressColor: cn('bg-green-200 dark:bg-green-200'),
      label: 'Moderate',
    },
    {
      threshold: 0.01, // 1-43% = 1-6 sets - Low
      fillColor: cn('fill-orange-100 dark:fill-orange-50'),
      bgColor: cn('bg-orange-100'),
      textColor: cn('text-orange-800'),
      progressColor: cn('bg-green-100 dark:bg-green-100'),
      label: 'Low',
    },
    {
      threshold: 0, // 0% = 0 sets - Not trained
      fillColor: cn('fill-orange-50 dark:fill-neutral-400'),
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
