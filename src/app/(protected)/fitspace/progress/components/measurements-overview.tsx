import { AddMeasurementModal } from './add-measurement-modal'
import { useBodyMeasurementsContext } from './body-measurements-context'
import { MeasurementCategoryDrawer } from './measurement-category-drawer'
import { measurementCategories } from './measurement-constants'
import { Section } from './section'
import { StatCard } from './stat-card'

export function MeasurementsOverview() {
  const { bodyMeasures, getLatestMeasurement, getTrend, onMeasurementAdded } =
    useBodyMeasurementsContext()

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
              value={getLatestMeasurement('weight')}
              unit="kg"
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
          <button className="text-left">
            <StatCard
              label="Body Fat"
              value={getLatestMeasurement('bodyFat')}
              unit="%"
              trend={getTrend('bodyFat')}
            />
          </button>
        </MeasurementCategoryDrawer>
      </div>
    </Section>
  )
}
