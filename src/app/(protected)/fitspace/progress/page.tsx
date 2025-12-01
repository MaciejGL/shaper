'use client'

import { ExtendHeader } from '@/components/extend-header'
import { useUser } from '@/context/user-context'

import { BodyMeasurementsProvider } from './components/body-measurements-context'
import { CheckinScheduleSection } from './components/checkin-schedule/checkin-schedule-section'
import { useCheckinDismissal } from './components/checkin-schedule/use-checkin-dismissal'
import {
  isCheckinWithinThreeDays,
  useCheckinStatus,
} from './components/checkin-schedule/use-checkin-schedule'
import { LatestPRs } from './components/latest-prs/latest-prs'
import { LogsSection } from './components/logs-section/logs-section'
import { MuscleHeatmapSection } from './components/muscle-heatmap/muscle-heatmap-section'
import { SnapshotsSection } from './components/snapshots-section/snapshots-section'

export default function ProgressPage() {
  const { hasPremium } = useUser()
  const { data } = useCheckinStatus()
  const { isDismissed } = useCheckinDismissal()

  const checkinStatus = data?.checkinStatus
  const hasSchedule = checkinStatus?.hasSchedule
  const isCheckinDue = checkinStatus?.isCheckinDue
  const nextCheckinDate = checkinStatus?.nextCheckinDate

  const isWithinThreeDays = isCheckinWithinThreeDays(nextCheckinDate || null)

  const showInHeader =
    hasPremium &&
    ((!hasSchedule && !isDismissed) ||
      (hasSchedule && (isWithinThreeDays || isCheckinDue)))

  const showAtBottom = hasPremium && !showInHeader

  return (
    <ExtendHeader
      headerChildren={showInHeader ? <CheckinScheduleSection /> : null}
    >
      <div className="space-y-6">
        <BodyMeasurementsProvider>
          <LogsSection />

          <SnapshotsSection />
        </BodyMeasurementsProvider>

        <LatestPRs />

        {/* <MuscleHeatmapSection /> */}

        {showAtBottom && <CheckinScheduleSection variant="minimal" />}
      </div>
    </ExtendHeader>
  )
}
