import { useBodyMeasurementsContext } from './body-measurements-context'
import { MeasurementChart } from './measurement-chart'
import { Section } from './section'

export function WeightProgressChart() {
  const { bodyMeasures } = useBodyMeasurementsContext()

  return (
    <Section title="Weight Progress">
      <MeasurementChart
        measurements={bodyMeasures}
        field="weight"
        label="Weight"
        unit="kg"
        className="h-full w-full min-h-0 bg-card dark:bg-black/20 rounded-lg p-2"
      />
    </Section>
  )
}
