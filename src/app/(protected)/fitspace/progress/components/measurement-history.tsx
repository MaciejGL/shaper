import { Calendar } from 'lucide-react'

import { CardTitle } from '@/components/ui/card'

import { useBodyMeasurementsContext } from './body-measurements-context'
import { MeasurementHistoryList } from './measurement-history-list'

export function MeasurementHistory() {
  const { bodyMeasures, onMeasurementAdded } = useBodyMeasurementsContext()

  if (bodyMeasures.length === 0) {
    return null
  }

  return (
    <div className="mt-10">
      <div>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Measurement History
        </CardTitle>
      </div>
      <div>
        <div className="pt-6">
          <MeasurementHistoryList
            measurements={bodyMeasures}
            onUpdate={onMeasurementAdded}
          />
        </div>
      </div>
    </div>
  )
}
