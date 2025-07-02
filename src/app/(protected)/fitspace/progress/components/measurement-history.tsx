import { Calendar } from 'lucide-react'

import { CardTitle } from '@/components/ui/card'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'

import { MeasurementHistoryList } from './measurement-history-list'

interface MeasurementHistoryProps {
  bodyMeasures: GQLBodyMeasuresQuery['bodyMeasures']
  onMeasurementAdded: () => void
}

export function MeasurementHistory({
  bodyMeasures,
  onMeasurementAdded,
}: MeasurementHistoryProps) {
  if (bodyMeasures.length === 0) {
    return null
  }

  return (
    <div className="mt-10">
      <div className="px-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Measurement History
        </CardTitle>
      </div>
      <div className="px-2">
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
