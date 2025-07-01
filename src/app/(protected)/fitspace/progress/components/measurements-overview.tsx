import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'

import { AddMeasurementModal } from './add-measurement-modal'
import { Section } from './section'
import { StatCard } from './stat-card'
import { useBodyMeasurements } from './use-body-measurements'

interface MeasurementsOverviewProps {
  bodyMeasures: GQLBodyMeasuresQuery['bodyMeasures']
  onMeasurementAdded: () => void
}

export function MeasurementsOverview({
  bodyMeasures,
  onMeasurementAdded,
}: MeasurementsOverviewProps) {
  const { getLatestMeasurement, getTrend } = useBodyMeasurements(bodyMeasures)

  return (
    <Section
      title="Body Measurements Overview"
      action={<AddMeasurementModal onSuccess={onMeasurementAdded} />}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <StatCard
          label="Weight"
          value={getLatestMeasurement('weight')}
          unit="kg"
          trend={getTrend('weight')}
        />
        <StatCard
          label="Body Fat"
          value={getLatestMeasurement('bodyFat')}
          unit="%"
          trend={getTrend('bodyFat')}
        />
        <StatCard
          label="Waist"
          value={getLatestMeasurement('waist')}
          unit="cm"
          trend={getTrend('waist')}
        />
        <StatCard
          label="Chest"
          value={getLatestMeasurement('chest')}
          unit="cm"
          trend={getTrend('chest')}
        />
      </div>
    </Section>
  )
}
