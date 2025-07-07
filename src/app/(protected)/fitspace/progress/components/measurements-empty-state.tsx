import { Scale } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import { AddMeasurementModal } from './add-measurement-modal'

interface MeasurementsEmptyStateProps {
  onMeasurementAdded: () => void
}

export function MeasurementsEmptyState({
  onMeasurementAdded,
}: MeasurementsEmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Measurements Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your body measurements to see progress over time.
          </p>
          <AddMeasurementModal onSuccess={onMeasurementAdded} />
        </div>
      </CardContent>
    </Card>
  )
}
