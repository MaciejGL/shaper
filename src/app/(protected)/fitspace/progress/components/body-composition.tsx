'use client'

import { BodyCompositionMetrics } from './body-composition-metrics'
import { BodyMeasurementsProvider } from './body-measurements-context'

export function BodyComposition() {
  return (
    <BodyMeasurementsProvider>
      <BodyCompositionMetrics />
    </BodyMeasurementsProvider>
  )
}
