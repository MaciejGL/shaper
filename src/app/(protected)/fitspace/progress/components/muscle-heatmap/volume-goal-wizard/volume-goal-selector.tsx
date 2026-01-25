'use client'

import { ChevronRight, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  COMMITMENT_OPTIONS,
  getVolumeGoalPresetById,
} from '@/config/volume-goals'

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
      <div className="w-full rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Set weekly volume goal</p>
            <p className="text-xs text-muted-foreground">
              Get targets per muscle and track progress in the heatmap
            </p>
          </div>
          <div className="shrink-0">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="size-4 text-primary" />
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-3"
          size="lg"
          iconStart={<Target />}
          iconEnd={<ChevronRight />}
          onClick={onOpenWizard}
        >
          Set goal
        </Button>
      </div>
    )
  }

  const commitmentLabel =
    COMMITMENT_OPTIONS.find((c) => c.id === currentGoal.commitment)?.name ??
    'Moderate push'

  // Goal is set - show current goal with edit option
  return (
    <button onClick={onOpenWizard} className="w-full text-left">
      <Card className="w-full p-3 dark" variant="highlighted">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{preset.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {commitmentLabel}
                {durationWeeks > 0
                  ? ` • ${durationWeeks} ${durationWeeks === 1 ? 'week' : 'weeks'}`
                  : ''}
              </p>
            </div>
          </div>

          <Button variant="link" size="sm" iconEnd={<ChevronRight />}>
            Change
          </Button>
        </div>
      </Card>
    </button>
  )
}
