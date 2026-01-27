'use client'

import {
  List,
  // Mars,
  Plus,
  // Settings2Icon,
  TrendingUpDown,
  // Venus,
} from 'lucide-react'
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
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
import { useUser } from '@/context/user-context'
import {
  GQLWeightUnit,
  // useUpdateProfileMutation,
} from '@/generated/graphql-client'
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
  // const { mutate: updateProfile, isPending: isUpdatingProfile } =
  //   useUpdateProfileMutation()

  // const isMale = user?.profile?.sex !== 'Female'

  // const handleToggleSex = () => {
  //   updateProfile({
  //     input: { sex: isMale ? 'Female' : 'Male' },
  //   })
  // }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 whitespace-nowrap">
          <TrendingUpDown className="h-5 w-5 text-blue-500" />
          Body Measurements
        </CardTitle>
        <div className="flex items-center gap-2">
          <PremiumButtonWrapper
            hasPremium={hasPremium}
            tooltipText="Track your body changes over time and spot patterns you'd otherwise miss."
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
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                variant="secondary"
                iconOnly={<Settings2Icon className="size-4" />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleToggleSex}
                disabled={isUpdatingProfile}
              >
                {isMale ? (
                  <Venus className="size-4" />
                ) : (
                  <Mars className="size-4" />
                )}
                Switch to {isMale ? 'female' : 'male'} body
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
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
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            iconStart={<List />}
            className="w-full"
          >
            Detailed Logs
          </Button>
          <PremiumButtonWrapper
            hasPremium={hasPremium}
            tooltipText="Track your body changes over time and spot patterns you'd otherwise miss."
          >
            {hasPremium ? (
              <AddMeasurementModal onSuccess={onMeasurementAdded}>
                <Button
                  variant="default"
                  size="sm"
                  iconStart={<Plus />}
                  className="w-full"
                >
                  Add Logs
                </Button>
              </AddMeasurementModal>
            ) : (
              <Button
                variant="default"
                size="sm"
                iconStart={<Plus />}
                disabled={!hasPremium}
                className="w-full"
              >
                Add Logs
              </Button>
            )}
          </PremiumButtonWrapper>
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
