'use client'

import { TrendingUp } from 'lucide-react'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { BodyMeasurementsProvider } from './components/body-measurements-context'
import { LatestPRs } from './components/latest-prs/latest-prs'
import { LogsSection } from './components/logs-section/logs-section'
import { MuscleHeatmapSection } from './components/muscle-heatmap/muscle-heatmap-section'
import { SnapshotsSection } from './components/snapshots-section/snapshots-section'

export default function ProgressPage() {
  return (
    <div className="container-hypertro mx-auto">
      <DashboardHeader
        title="Progress"
        icon={TrendingUp}
        className="mb-6"
        variant="green"
      />

      <div className="space-y-6">
        {/* Latest PRs Section */}
        <LatestPRs />

        {/* Logs Section */}
        <BodyMeasurementsProvider>
          <LogsSection />
        </BodyMeasurementsProvider>

        {/* Snapshots Section */}
        <SnapshotsSection />

        {/* Muscle Heatmap Section */}
        {/* <MuscleHeatmapSection /> */}
      </div>
    </div>
  )
}
