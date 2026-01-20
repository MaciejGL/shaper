'use client'

import { useSearchParams } from 'next/navigation'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { ExtendHeader } from '@/components/extend-header'
import { PostPaymentSuccessModal } from '@/components/post-payment-success-modal'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import { usePostPaymentSuccess } from '@/hooks/use-post-payment-success'

import { BodyMeasurementsProvider } from './components/body-measurements-context'
import { CheckinScheduleSection } from './components/checkin-schedule/checkin-schedule-section'
import { LatestPRs } from './components/latest-prs/latest-prs'
import { LogsSection } from './components/logs-section/logs-section'
import { ActivityByDaySection } from './components/muscle-heatmap/activity-by-day-section'
import { MuscleHeatmapSection } from './components/muscle-heatmap/muscle-heatmap-section'
import { SnapshotsSection } from './components/snapshots-section/snapshots-section'

enum ProgressTab {
  Activity = 'activity',
  Logs = 'logs',
}

export default function ProgressPage() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum<ProgressTab>(Object.values(ProgressTab)).withDefault(
      ProgressTab.Activity,
    ),
  )
  const { user, hasPremium } = useUser()

  const isPremiumActivated = searchParams?.get('premium_activated') === 'true'

  const {
    isPostPayment,
    state: paymentState,
    refetch,
  } = usePostPaymentSuccess(user?.id)

  // Show modal when coming from payment success
  const showPaymentModal = isPremiumActivated || isPostPayment

  return (
    <>
      <PostPaymentSuccessModal
        open={showPaymentModal}
        state={paymentState}
        onRefresh={refetch}
      />
      <ExtendHeader
        headerChildren={<div />}
        classNameHeaderContent="pb-8"
        classNameContent="px-0 pt-0"
      >
        <div className="space-y-6">
          <Tabs
            value={tab}
            defaultValue={ProgressTab.Activity}
            onValueChange={(value) => setTab(value as ProgressTab)}
            className="gap-0"
          >
            <div className="mb-2 -mt-6 relative px-3">
              <PrimaryTabList
                options={[
                  { label: 'Performance', value: ProgressTab.Activity },
                  { label: 'Body', value: ProgressTab.Logs },
                ]}
                onClick={setTab}
                active={tab}
                size="lg"
                className="grid grid-cols-2"
              />
            </div>

            <TabsContent
              value={ProgressTab.Activity}
              className="space-y-6 py-6 px-4"
            >
              <ActivityByDaySection />
              <MuscleHeatmapSection />
              <LatestPRs />
            </TabsContent>

            <TabsContent value={ProgressTab.Logs} className="space-y-6 py-6 px-4">
              <BodyMeasurementsProvider>
                <LogsSection />
                <SnapshotsSection />
              </BodyMeasurementsProvider>
              {hasPremium && <CheckinScheduleSection variant="minimal" />}
            </TabsContent>
          </Tabs>
        </div>
      </ExtendHeader>
    </>
  )
}
