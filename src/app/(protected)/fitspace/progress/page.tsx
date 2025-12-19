'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ExtendHeader } from '@/components/extend-header'
import { PremiumActivatedModal } from '@/components/premium-activated-modal'
import { useUser } from '@/context/user-context'
import { usePostPaymentSuccess } from '@/hooks/use-post-payment-success'

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
import { TrainingAnalyticsSection } from './components/muscle-heatmap/training-analytics-section'
import { SnapshotsSection } from './components/snapshots-section/snapshots-section'

export default function ProgressPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, hasPremium } = useUser()
  const { data } = useCheckinStatus()
  const { isDismissed } = useCheckinDismissal()

  const isPremiumActivated = searchParams?.get('premium_activated') === 'true'
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const { state: paymentState } = usePostPaymentSuccess(user?.id)

  useEffect(() => {
    if (isPremiumActivated) {
      setShowPremiumModal(true)
    }
  }, [isPremiumActivated])

  const handleCloseModal = () => {
    setShowPremiumModal(false)
    router.replace('/fitspace/progress', { scroll: false })
  }

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
    <>
      <PremiumActivatedModal
        open={!showPremiumModal}
        onClose={handleCloseModal}
        isVerifying={paymentState === 'polling'}
      />
      <ExtendHeader
        headerChildren={showInHeader ? <CheckinScheduleSection /> : null}
      >
        <div className="space-y-6">
          <MuscleHeatmapSection />
          <TrainingAnalyticsSection />
          <BodyMeasurementsProvider>
            <LogsSection />

            <SnapshotsSection />
          </BodyMeasurementsProvider>

          <LatestPRs />

          {showAtBottom && <CheckinScheduleSection variant="minimal" />}
        </div>
      </ExtendHeader>
    </>
  )
}
