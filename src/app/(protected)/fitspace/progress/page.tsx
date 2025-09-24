'use client'

import { Crown, TrendingUp } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { BodyMeasurements } from './components/body-measurements'
import { BodyProgress } from './components/body-progress'
import { ExercisesList } from './components/exercises-list'
import { MuscleDistribution } from './components/muscle-distribution'

export default function ProgressPage() {
  const { hasPremium, isLoading } = useUser()

  // Use nuqs for tab persistence
  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringEnum<
      'body-measures' | 'body-progress' | 'muscle-distribution' | 'exercises'
    >(['body-measures', 'body-progress', 'muscle-distribution', 'exercises'])
      .withDefault('body-measures')
      .withOptions({ clearOnDefault: true }),
  )

  return (
    <div className="container-hypertro mx-auto">
      <DashboardHeader
        title="Progress"
        icon={TrendingUp}
        className="mb-6"
        variant="green"
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="space-y-6"
      >
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="body-measures">Measures </TabsTrigger>
          <TabsTrigger
            value="body-progress"
            className="relative"
            disabled={!hasPremium || isLoading}
          >
            Snapshots{' '}
            {!hasPremium && !isLoading && (
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <PremiumBadge />
              </div>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="muscle-distribution"
            className="relative"
            disabled={!hasPremium || isLoading}
          >
            Muscles{' '}
            {!hasPremium && !isLoading && (
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <PremiumBadge />
              </div>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="exercises"
            className="relative"
            disabled={!hasPremium || isLoading}
          >
            Exercises{' '}
            {!hasPremium && !isLoading && (
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <PremiumBadge />
              </div>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body-measures">
          <BodyMeasurements />
        </TabsContent>

        <TabsContent value="body-progress">
          <BodyProgress />
        </TabsContent>

        <TabsContent value="muscle-distribution">
          <MuscleDistribution />
        </TabsContent>

        <TabsContent value="exercises">
          <ExercisesList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PremiumBadge() {
  return (
    <Badge variant="premium" className="p-1 rounded-md" size="2xs">
      <Crown className="!size-3" />
    </Badge>
  )
}
