'use client'

import { ExtendHeader } from '../workout/[trainingId]/components/workout-page.client'

import { BodyMeasurementsProvider } from './components/body-measurements-context'
import { CheckinScheduleSection } from './components/checkin-schedule/checkin-schedule-section'
import { LatestPRs } from './components/latest-prs/latest-prs'
import { LogsSection } from './components/logs-section/logs-section'
import { MuscleHeatmapSection } from './components/muscle-heatmap/muscle-heatmap-section'
import { SnapshotsSection } from './components/snapshots-section/snapshots-section'

export default function ProgressPage() {
  return (
    <ExtendHeader
      headerChildren={
        <div className="pb-2 px-2 dark space-y-4">
          <CheckinScheduleSection />
        </div>
      }
    >
      <div className="container-hypertro mx-auto mt-6">
        <div className="space-y-6">
          <BodyMeasurementsProvider>
            <LogsSection />

            <SnapshotsSection />
          </BodyMeasurementsProvider>

          <LatestPRs />

          <MuscleHeatmapSection />
        </div>
      </div>
    </ExtendHeader>
  )
}
