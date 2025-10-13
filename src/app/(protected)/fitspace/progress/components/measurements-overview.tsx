import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { AddMeasurementModal } from './add-measurement-modal'
import { useBodyMeasurementsContext } from './body-measurements-context'
import { MeasurementCategoryDrawer } from './measurement-category-drawer'
import { measurementCategories } from './measurement-constants'
import { Section } from './section'
import { StatCard } from './stat-card'

export function MeasurementsOverview({ className }: { className?: string }) {
  const { hasPremium } = useUser()
  const {
    bodyMeasures,
    getLatestMeasurement,
    getTrend,
    getEstimatedBodyFat,
    isLoading,
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
      title="Body Measurements"
      action={
        <PremiumButtonWrapper
          hasPremium={hasPremium}
          tooltipText="Upgrade to log measurements"
        >
          {hasPremium ? (
            <AddMeasurementModal onSuccess={onMeasurementAdded} />
          ) : (
            <Button size="sm" disabled={!hasPremium}>
              Log
            </Button>
          )}
        </PremiumButtonWrapper>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <MeasurementCategoryDrawer
          key={'weight'}
          category={measurementCategories[0]}
          measurements={bodyMeasures}
          onUpdate={onMeasurementAdded}
          focusField={'weight'}
          className={className}
        >
          <button className="text-left w-full">
            <StatCard
              label="Weight"
              value={
                toDisplayWeight(getLatestMeasurement('weight')) || undefined
              }
              unit={weightUnit}
              trend={getTrend('weight')}
              isLoading={isLoading}
              isOnCard
              size="sm"
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
          <button className="text-left h-full w-full">
            <StatCard
              label={bodyFatLabel}
              value={displayBodyFat}
              unit="%"
              isLoading={isLoading}
              isOnCard
              size="sm"
            />
          </button>
        </MeasurementCategoryDrawer>
      </div>
    </Section>
  )
}
