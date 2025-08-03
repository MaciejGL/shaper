import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { AddMeasurementModal } from './add-measurement-modal'
import { useBodyMeasurementsContext } from './body-measurements-context'
import { MeasurementCategoryDrawer } from './measurement-category-drawer'
import { measurementCategories } from './measurement-constants'
import { Section } from './section'
import { StatCard } from './stat-card'

export function MeasurementsOverview() {
  const {
    bodyMeasures,
    getLatestMeasurement,
    getTrend,
    getEstimatedBodyFat,
    onMeasurementAdded,
  } = useBodyMeasurementsContext()

  const { toDisplayWeight, weightUnit } = useWeightConversion()

  const estimatedBodyFat = getEstimatedBodyFat()
  const manualBodyFat = getLatestMeasurement('bodyFat')

  // Determine which body fat value to display
  const displayBodyFat = manualBodyFat || estimatedBodyFat?.percentage
  const bodyFatLabel =
    !manualBodyFat && estimatedBodyFat?.percentage
      ? 'Body Fat (Est.)'
      : 'Body Fat'

  return (
    <Section
      title="Body Measurements Overview"
      action={<AddMeasurementModal onSuccess={onMeasurementAdded} />}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <MeasurementCategoryDrawer
          key={'weight'}
          category={measurementCategories[0]}
          measurements={bodyMeasures}
          onUpdate={onMeasurementAdded}
          focusField={'weight'}
        >
          <button className="text-left">
            <StatCard
              label="Weight"
              value={
                toDisplayWeight(getLatestMeasurement('weight')) || undefined
              }
              unit={weightUnit}
              trend={getTrend('weight')}
            />
          </button>
        </MeasurementCategoryDrawer>

        <MeasurementCategoryDrawer
          key={'bodyFat'}
          category={measurementCategories[0]}
          measurements={bodyMeasures}
          onUpdate={onMeasurementAdded}
          focusField={'bodyFat'}
        >
          <button className="text-left h-full">
            <StatCard label={bodyFatLabel} value={displayBodyFat} unit="%" />
          </button>
        </MeasurementCategoryDrawer>
      </div>
    </Section>
  )
}
