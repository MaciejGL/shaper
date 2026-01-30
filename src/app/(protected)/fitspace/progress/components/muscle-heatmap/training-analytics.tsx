'use client'

import { PremiumUpgradeNote } from '@/components/premium-upgrade-note'
import { Button } from '@/components/ui/button'
import { TRACKED_DISPLAY_GROUPS } from '@/config/muscles'

import { TrainingAnalytics as TrainingAnalyticsType } from './analytics-types'
import { RecoveryBodyPreview } from './recovery-body-preview'
import { TrainingAnalyticsContent } from './training-analytics-content'
import { useTrainingAnalytics } from './use-training-analytics'

const LOADING_PLACEHOLDER_ANALYTICS: TrainingAnalyticsType = {
  totalSets: 0,
  trendPercent: 0,
  strong: [],
  needsWork: [],
  insight: null,
  status: 'empty',
  recovery: TRACKED_DISPLAY_GROUPS.map((muscle) => ({
    muscle,
    hours: 72,
    targetHours: 72,
    percentRecovered: 100,
  })),
}

// Placeholder recovery data for non-premium preview (all muscles shown as "recovering")
const PREVIEW_RECOVERY = TRACKED_DISPLAY_GROUPS.slice(0, 6).map((muscle) => ({
  muscle,
  percentRecovered: 50,
}))

export function TrainingAnalytics() {
  const { analytics, isLoading, error, refetch, hasPremium } =
    useTrainingAnalytics()

  // Show preview for non-premium users
  if (!hasPremium) {
    return (
      <div className="space-y-4">
        <RecoveryBodyPreview recovery={PREVIEW_RECOVERY} colorsEnabled={false} />
        <PremiumUpgradeNote className="text-sm px-4">
          Upgrade to track muscle recovery and optimize your training splits
        </PremiumUpgradeNote>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10">
        <p className="text-sm text-destructive">{error.message}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (!analytics && !isLoading) {
    return null
  }
  return (
    <TrainingAnalyticsContent
      analytics={analytics ?? LOADING_PLACEHOLDER_ANALYTICS}
      isLoading={isLoading}
    />
  )
}
