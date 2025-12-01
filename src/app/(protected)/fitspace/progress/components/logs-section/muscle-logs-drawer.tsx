'use client'

import { Drawer, DrawerContent } from '@/components/ui/drawer'

import { useBodyMeasurementsContext } from '../body-measurements-context'
import { DetailedMeasurements } from '../detailed-measurements'
import { MeasurementHistoryList } from '../measurement-history-list'
import { MeasurementsOverview } from '../measurements-overview'

interface MuscleLogsDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function MuscleLogsDrawer({
  isOpen,
  onOpenChange,
}: MuscleLogsDrawerProps) {
  const { bodyMeasures, onMeasurementAdded } = useBodyMeasurementsContext()

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent
        className="max-h-[90vh]"
        dialogTitle="Muscle Progress Overview"
      >
        <div className="px-4 pb-4 space-y-6 overflow-y-auto compact-scrollbar">
          <div className="mt-4">
            <MeasurementsOverview className="!max-h-[87vh]" />
          </div>

          <DetailedMeasurements className="!max-h-[87vh]" />
          <div>
            <h3 className="font-semibold text-lg mb-3">History</h3>
            <MeasurementHistoryList
              measurements={bodyMeasures}
              onUpdate={onMeasurementAdded}
              isOnCard
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
