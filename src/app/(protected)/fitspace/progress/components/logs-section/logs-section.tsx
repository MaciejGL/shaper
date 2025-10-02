'use client'

import { List, Plus, Weight } from 'lucide-react'
import { useState } from 'react'

import { PremiumGate } from '@/components/premium-gate'
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
    <>
      <Card borderless>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 whitespace-nowrap">
            <Weight className="h-5 w-5 text-blue-500" />
            Body Measurements
          </CardTitle>
          <AddMeasurementModal onSuccess={onMeasurementAdded}>
            <Button
              variant="default"
              size="sm"
              iconStart={<Plus />}
              disabled={!hasPremium}
            >
              Log
            </Button>
          </AddMeasurementModal>
        </CardHeader>
        <PremiumGate feature="Progress Logs" compact>
          <MeasurementChart
            measurements={bodyMeasures}
            field="weight"
            label="Weight"
            unit={weightUnit || GQLWeightUnit.Kg}
            className="bg-black/90 dark:bg-black/20 p-2 w-full rounded-lg"
          />
          <CardContent>
            <div className="space-y-4">
              {/* Weight Progress Chart Placeholder */}
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
                        toDisplayWeight(getLatestMeasurement('weight')) ||
                        undefined
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
          </CardFooter>
        </PremiumGate>
      </Card>

      <MuscleLogsDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        userId={user.id}
      />
    </>
  )
}
