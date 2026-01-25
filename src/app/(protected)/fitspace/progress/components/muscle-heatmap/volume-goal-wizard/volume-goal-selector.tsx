'use client'

import { ChevronRight, Target } from 'lucide-react'

import { getVolumeGoalPresetById } from '@/config/volume-goals'

import type { VolumeGoalSelectorProps } from './types'

export function VolumeGoalSelector({
  currentGoal,
  durationWeeks,
  onOpenWizard,
}: VolumeGoalSelectorProps) {
  const preset = currentGoal
    ? getVolumeGoalPresetById(currentGoal.focusPreset)
    : null

  if (!currentGoal || !preset) {
    // No goal set - show CTA
    return (
      <button
        onClick={onOpenWizard}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
      >
        <div className="flex items-center gap-2">
          <Target className="size-4 text-primary" />
          <div>
            <p className="text-sm font-medium">Set your volume goal</p>
            <p className="text-xs text-muted-foreground">
              Answer 2 quick questions to set your target
            </p>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </button>
    )
  }

  // Goal is set - show current goal with edit option
  return (
    <button
      onClick={onOpenWizard}
      className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-2">
        <Target className="size-4 text-primary" />
        <div>
          <p className="text-sm font-medium">{preset.name}</p>
          {durationWeeks > 0 && (
            <p className="text-xs text-muted-foreground">
              {durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'} on this
              goal
            </p>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Change</span>
    </button>
  )
}
