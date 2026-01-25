/**
 * Volume Goal Presets
 *
 * Defines target weekly sets per muscle group for different training focuses.
 * Users select a preset to customize their progress tracking goals.
 */

import type { DisplayGroup } from './muscles'
import { TRACKED_DISPLAY_GROUPS } from './muscles'

export interface VolumeGoalPreset {
  id: string
  name: string
  description: string
  /** Target sets per week for each display group */
  targets: Record<DisplayGroup, number>
}

export const VOLUME_GOAL_PRESET_IDS = [
  'balanced',
  'upper-body',
  'lower-body',
  'push-pull',
  'hypertrophy',
  'maintenance',
] as const

export type VolumeGoalPresetId = (typeof VOLUME_GOAL_PRESET_IDS)[number]

/**
 * Volume goal presets with per-muscle-group targets
 */
export const VOLUME_GOAL_PRESETS: Record<VolumeGoalPresetId, VolumeGoalPreset> =
  {
    balanced: {
      id: 'balanced',
      name: 'Balanced',
      description: 'Even development across all muscle groups',
      targets: {
        Chest: 12,
        'Upper Back': 12,
        'Lower Back': 12,
        Lats: 12,
        Shoulders: 12,
        Biceps: 12,
        Triceps: 12,
        Quads: 12,
        Hamstrings: 12,
        Glutes: 12,
        Calves: 12,
        Core: 12,
        Forearms: 12,
        Traps: 12,
        'Inner Thighs': 12,
        Neck: 8,
      },
    },

    'upper-body': {
      id: 'upper-body',
      name: 'Upper Body Focus',
      description: 'Build chest, back, shoulders & arms',
      targets: {
        Chest: 16,
        'Upper Back': 16,
        'Lower Back': 10,
        Lats: 16,
        Shoulders: 16,
        Biceps: 14,
        Triceps: 14,
        Quads: 8,
        Hamstrings: 8,
        Glutes: 8,
        Calves: 6,
        Core: 10,
        Forearms: 10,
        Traps: 12,
        'Inner Thighs': 6,
        Neck: 8,
      },
    },

    'lower-body': {
      id: 'lower-body',
      name: 'Lower Body & Glutes',
      description: 'Prioritize legs and glutes development',
      targets: {
        Chest: 8,
        'Upper Back': 10,
        'Lower Back': 12,
        Lats: 10,
        Shoulders: 10,
        Biceps: 8,
        Triceps: 8,
        Quads: 16,
        Hamstrings: 16,
        Glutes: 18,
        Calves: 14,
        Core: 12,
        Forearms: 6,
        Traps: 8,
        'Inner Thighs': 12,
        Neck: 6,
      },
    },

    'push-pull': {
      id: 'push-pull',
      name: 'Push/Pull Emphasis',
      description: 'Classic bodybuilding split focus',
      targets: {
        Chest: 14,
        'Upper Back': 14,
        'Lower Back': 10,
        Lats: 14,
        Shoulders: 14,
        Biceps: 12,
        Triceps: 12,
        Quads: 10,
        Hamstrings: 10,
        Glutes: 10,
        Calves: 8,
        Core: 10,
        Forearms: 10,
        Traps: 12,
        'Inner Thighs': 8,
        Neck: 6,
      },
    },

    hypertrophy: {
      id: 'hypertrophy',
      name: 'High Volume',
      description: 'Maximum muscle growth stimulus',
      targets: {
        Chest: 18,
        'Upper Back': 18,
        'Lower Back': 14,
        Lats: 18,
        Shoulders: 18,
        Biceps: 16,
        Triceps: 16,
        Quads: 18,
        Hamstrings: 16,
        Glutes: 16,
        Calves: 14,
        Core: 14,
        Forearms: 12,
        Traps: 14,
        'Inner Thighs': 12,
        Neck: 10,
      },
    },

    maintenance: {
      id: 'maintenance',
      name: 'Maintenance',
      description: 'Lower volume for maintenance or strength focus',
      targets: {
        Chest: 8,
        'Upper Back': 8,
        'Lower Back': 8,
        Lats: 8,
        Shoulders: 8,
        Biceps: 6,
        Triceps: 6,
        Quads: 8,
        Hamstrings: 8,
        Glutes: 8,
        Calves: 6,
        Core: 8,
        Forearms: 6,
        Traps: 6,
        'Inner Thighs': 6,
        Neck: 4,
      },
    },
  }

/** Get all presets as an array for UI display */
export const getVolumeGoalPresetsList = (): VolumeGoalPreset[] =>
  VOLUME_GOAL_PRESET_IDS.map((id) => VOLUME_GOAL_PRESETS[id])

/** Get a specific preset by ID, returns undefined if not found */
export const getVolumeGoalPresetById = (
  id: string | null | undefined,
): VolumeGoalPreset | undefined => {
  if (!id) return undefined
  return VOLUME_GOAL_PRESETS[id as VolumeGoalPresetId]
}

/** Get the target sets for a specific display group from a preset */
export const getTargetSetsForGroup = (
  presetId: string | null | undefined,
  displayGroup: DisplayGroup,
): number => {
  const preset = getVolumeGoalPresetById(presetId)
  if (!preset) {
    // Default fallback when no preset selected
    return 12
  }
  return preset.targets[displayGroup] ?? 12
}

/** Get all target sets for a preset, with fallback to defaults */
export const getTargetSetsMap = (
  presetId: string | null | undefined,
): Record<string, number> => {
  const preset = getVolumeGoalPresetById(presetId)
  if (!preset) {
    // Return default targets when no preset selected
    return TRACKED_DISPLAY_GROUPS.reduce(
      (acc, group) => {
        acc[group] = 12
        return acc
      },
      {} as Record<string, number>,
    )
  }
  return { ...preset.targets }
}

/** Default preset ID for new users */
export const DEFAULT_VOLUME_GOAL_PRESET_ID: VolumeGoalPresetId = 'balanced'

// ============================================================================
// Dynamic Volume Goal Calculation
// ============================================================================

export const COMMITMENT_IDS = ['realistic', 'moderate', 'all-in'] as const
export type CommitmentId = (typeof COMMITMENT_IDS)[number]

export const COMMITMENT_MULTIPLIERS: Record<CommitmentId, number> = {
  realistic: 0.85,
  moderate: 1.0,
  'all-in': 1.3,
}

export const COMMITMENT_OPTIONS: {
  id: CommitmentId
  name: string
  description: string
}[] = [
  {
    id: 'realistic',
    name: 'Keep it realistic',
    description: 'Sustainable volume for busy schedules',
  },
  {
    id: 'moderate',
    name: 'Moderate push',
    description: 'Balanced effort for steady progress',
  },
  {
    id: 'all-in',
    name: 'All-in',
    description: 'Maximum volume for serious gains',
  },
]

/** Minimum sets per muscle group floor */
const MIN_SETS_FLOOR = 12

/**
 * Compute dynamic target sets based on focus preset and commitment level.
 * - Focused muscles get multiplied by commitment
 * - Non-focused muscles are capped at minimum 12 sets
 */
export function computeTargets(
  focusPreset: string | null | undefined,
  commitment: string | null | undefined,
): Record<DisplayGroup, number> {
  const preset = getVolumeGoalPresetById(focusPreset)
  const multiplier =
    COMMITMENT_MULTIPLIERS[commitment as CommitmentId] ?? COMMITMENT_MULTIPLIERS.moderate

  if (!preset) {
    // Fallback to balanced preset with moderate commitment
    return TRACKED_DISPLAY_GROUPS.reduce(
      (acc, group) => {
        acc[group] = MIN_SETS_FLOOR
        return acc
      },
      {} as Record<DisplayGroup, number>,
    )
  }

  const targets = {} as Record<DisplayGroup, number>
  for (const group of TRACKED_DISPLAY_GROUPS) {
    const baseTarget = preset.targets[group] ?? MIN_SETS_FLOOR
    const computed = Math.round(baseTarget * multiplier)
    // Non-focused muscles (lower base) get floored at 12 sets
    targets[group] = Math.max(computed, MIN_SETS_FLOOR)
  }

  return targets
}

/**
 * Get target sets for a specific muscle group with dynamic calculation.
 */
export function getComputedTargetForGroup(
  focusPreset: string | null | undefined,
  commitment: string | null | undefined,
  displayGroup: DisplayGroup,
): number {
  const targets = computeTargets(focusPreset, commitment)
  return targets[displayGroup] ?? MIN_SETS_FLOOR
}
