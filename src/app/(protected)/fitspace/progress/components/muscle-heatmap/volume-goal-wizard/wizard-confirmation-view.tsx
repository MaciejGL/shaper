'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useMemo } from 'react'

import { computeTargets, getVolumeGoalPresetById } from '@/config/volume-goals'
import { Button } from '@/components/ui/button'

import { BodyTargetPreview } from './body-target-preview'

const COMMITMENT_DISPLAY_NAMES: Record<string, string> = {
  realistic: 'Realistic',
  moderate: 'Moderate',
  'all-in': 'All-in',
}

interface WizardConfirmationViewProps {
  focusPreset: string
  commitment: string
  onConfirm: () => void
  onBack: () => void
  onRestart: () => void
}

export function WizardConfirmationView({
  focusPreset,
  commitment,
  onConfirm,
  onBack,
  onRestart,
}: WizardConfirmationViewProps) {
  const preset = getVolumeGoalPresetById(focusPreset)
  const targets = computeTargets(focusPreset, commitment)

  // Get top focus areas (highest target sets)
  const focusAreas = useMemo(() => {
    return Object.entries(targets)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
  }, [targets])

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="relative flex items-center justify-center">
        <div className="absolute left-0">
          <Button variant="ghost" iconOnly={<ArrowLeft />} onClick={onBack}>
            Back
          </Button>
        </div>
        <span className="text-base font-semibold text-muted-foreground">
          Your Weekly Targets
        </span>
      </div>

      {/* Goal Summary */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          {preset?.name}
        </div>
        <p className="text-sm text-muted-foreground">
          {COMMITMENT_DISPLAY_NAMES[commitment]} commitment
        </p>
      </div>

      {/* Body Heatmap Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <BodyTargetPreview targets={targets} />
      </motion.div>

      {/* Focus Areas */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
          Top Focus Areas
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {focusAreas.map(([group, sets]) => (
            <div
              key={group}
              className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 px-2.5 py-1 rounded-full text-xs font-medium"
            >
              <span>{group}</span>
              <span className="tabular-nums font-bold">{sets}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded bg-orange-500" />
          <span>High priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded bg-orange-200" />
          <span>Baseline</span>
        </div>
      </div>

      {/* CTA */}
      <Button className="w-full" size="lg" onClick={onConfirm}>
        Set this goal
      </Button>

      {/* Footer */}
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={onRestart}>
          Start over
        </Button>
      </div>
    </motion.div>
  )
}
