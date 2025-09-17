'use client'

import { Crown, TrendingUp } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { Badge } from '@/components/ui/badge'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { BodyMeasurements } from './components/body-measurements'
import { BodyProgress } from './components/body-progress'
import { ExercisesList } from './components/exercises-list'
import { MuscleDistribution } from './components/muscle-distribution'

export default function ProgressPage() {
  const { hasPremium } = useUser()

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
        <PrimaryTabList
          size="sm"
          className="w-full grid grid-cols-4 md:grid-cols-4"
          options={[
            { label: 'Measures', value: 'body-measures' },
            {
              label: 'Snapshots',
              value: 'body-progress',
              disabled: !hasPremium,
              disabledIcon: <PremiumBadge />,
            },
            {
              label: 'Muscles',
              value: 'muscle-distribution',
              disabled: !hasPremium,
              disabledIcon: <PremiumBadge />,
            },
            {
              label: 'Exercises',
              value: 'exercises',
            },
          ]}
          onClick={setActiveTab}
          active={activeTab}
        />

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
    <Badge variant="premium" className="p-1 rounded-md opacity-75" size="2xs">
      <Crown />
    </Badge>
  )
}
