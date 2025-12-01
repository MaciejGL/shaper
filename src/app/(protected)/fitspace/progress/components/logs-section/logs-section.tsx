'use client'

import { List, Plus, TrendingUpDown } from 'lucide-react'
import { useState } from 'react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { GQLWeightUnit } from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'

import { AddMeasurementModal } from '../add-measurement-modal'
import { useBodyMeasurementsContext } from '../body-measurements-context'
import { MeasurementBodyMapDisplay } from '../measurement-body-map/measurement-body-map-display'
import { MeasurementCategoryDrawer } from '../measurement-category-drawer'
import { MeasurementChart } from '../measurement-chart'
import { measurementCategories } from '../measurement-constants'
import { StatCard } from '../stat-card'

import { MuscleLogsDrawer } from './muscle-logs-drawer'

export function LogsSection() {
  const { user, hasPremium } = useUser()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const {
    bodyMeasures,
    getLatestMeasurement,
    getTrend,
    getEstimatedBodyFat,
    isLoading,
    onMeasurementAdded,
  } = useBodyMeasurementsContext()
  const { toDisplayWeight, weightUnit } = useWeightConversion()

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 whitespace-nowrap">
          <TrendingUpDown className="h-5 w-5 text-blue-500" />
          Body Measurements
        </CardTitle>
        <PremiumButtonWrapper
          hasPremium={hasPremium}
          tooltipText="Upgrade to log measurements"
        >
          {hasPremium ? (
            <AddMeasurementModal onSuccess={onMeasurementAdded}>
              <Button variant="default" size="sm" iconStart={<Plus />}>
                Log
              </Button>
            </AddMeasurementModal>
          ) : (
            <Button
              variant="default"
              size="sm"
              iconStart={<Plus />}
              disabled={!hasPremium}
            >
              Log
            </Button>
          )}
        </PremiumButtonWrapper>
      </CardHeader>
      <MeasurementChart
        measurements={bodyMeasures}
        field="weight"
        label="Weight"
        unit={weightUnit || GQLWeightUnit.Kg}
        className="bg-black/90 dark:bg-black/20 h-[190px] w-full rounded-lg"
      />
      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <MeasurementCategoryDrawer
              key={'weight'}
              category={measurementCategories[0]}
              measurements={bodyMeasures}
              onUpdate={onMeasurementAdded}
              focusField={'weight'}
            >
              <button className="text-left w-full">
                <StatCard
                  label="Current Weight"
                  value={
                    toDisplayWeight(getLatestMeasurement('weight')) || undefined
                  }
                  unit={weightUnit}
                  trend={getTrend('weight')}
                  size="sm"
                  isLoading={isLoading}
                  isOnCard
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
                  label="Body Fat"
                  value={
                    getLatestMeasurement('bodyFat') ||
                    getEstimatedBodyFat()?.percentage
                  }
                  unit="%"
                  size="sm"
                  isLoading={isLoading}
                  isOnCard
                />
              </button>
            </MeasurementCategoryDrawer>
          </div>

          {/* Body Circumferences Map */}
          <div className="-mx-2 mt-12 mb-12">
            <MeasurementBodyMapDisplay size="sm" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid grid-cols-1 w-full">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            iconStart={<List />}
            className="w-full"
          >
            Detailed Logs
          </Button>
        </div>
        <MuscleLogsDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          userId={user.id}
        />
      </CardFooter>
    </Card>
  )
}
