'use client'

import { BodyMeasurementsContent } from './body-measurements-content'
import { BodyMeasurementsProvider } from './body-measurements-context'

export function BodyMeasurements() {
  return (
    <BodyMeasurementsProvider>
      <BodyMeasurementsContent />
    </BodyMeasurementsProvider>
  )
}
