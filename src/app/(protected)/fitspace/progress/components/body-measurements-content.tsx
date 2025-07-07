import { useBodyMeasurementsContext } from './body-measurements-context'
import { DetailedMeasurements } from './detailed-measurements'
import { MeasurementHistory } from './measurement-history'
import { MeasurementsOverview } from './measurements-overview'
import { WeightProgressChart } from './weight-progress-chart'

export function BodyMeasurementsContent() {
  const { bodyMeasures } = useBodyMeasurementsContext()

  return (
    <div className="space-y-8">
      {/* Quick Stats Overview */}
      <MeasurementsOverview />

      {/* Weight Progress Chart */}
      {bodyMeasures.length > 1 && <WeightProgressChart />}

      {/* Detailed Measurements by Category */}
      <DetailedMeasurements />

      {/* Measurement History */}
      <MeasurementHistory />
    </div>
  )
}
