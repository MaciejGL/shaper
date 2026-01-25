import type { VolumeGoalPreset } from '@/config/volume-goals'

export interface VolumeGoalSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPresetId: string | null
  onSelect: (presetId: string) => void
}

export interface VolumeGoalBannerProps {
  currentGoal: {
    presetId: string
    startedAt: string
  } | null
  onEditClick: () => void
}
