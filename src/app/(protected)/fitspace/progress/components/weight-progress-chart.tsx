import { GQLWeightUnit } from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { useBodyMeasurementsContext } from './body-measurements-context'
import { MeasurementChart } from './measurement-chart'

export function WeightProgressChart() {
  const { bodyMeasures } = useBodyMeasurementsContext()
  const { weightUnit } = useWeightConversion()

  return (
    <MeasurementChart
      measurements={bodyMeasures}
      field="weight"
      label="Weight"
      unit={weightUnit || GQLWeightUnit.Kg}
      className="h-full w-full min-h-0 bg-card dark:bg-black/20 rounded-lg p-2"
    />
  )
}
