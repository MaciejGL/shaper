'use client'

import { Crown, TrendingUp } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import { useExercisesProgressByUserQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { BodyMeasurements } from './components/body-measurements'
import { MuscleDistribution } from './components/muscle-distribution'
import { SelectedExercisesProgress } from './components/selected-exercises-progress'

export default function ProgressPage() {
  const { user, hasPremium } = useUser()

  // Use nuqs for tab persistence
  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringEnum<'body-measures' | 'muscle-distribution' | 'exercises'>([
      'body-measures',
      'muscle-distribution',
      'exercises',
    ])
      .withDefault('body-measures')
      .withOptions({ clearOnDefault: true }),
  )

  // Get progress data for all exercises
  const { data: exerciseProgress } = useExercisesProgressByUserQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id && hasPremium },
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
        <TabsList className="w-full">
          <TabsTrigger
            value="body-measures"
            className="flex items-center gap-2"
          >
            Measures
          </TabsTrigger>
          <TabsTrigger
            value="muscle-distribution"
            className="flex items-center gap-2 relative"
            // disabled={!hasPremium || true}
          >
            Muscle Balance
            {!hasPremium ? <PremiumBadge /> : null}
          </TabsTrigger>

          <TabsTrigger
            value="exercises"
            className="flex items-center gap-2 relative"
            disabled={!hasPremium || true}
          >
            Exercises {!hasPremium ? <PremiumBadge /> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body-measures">
          <BodyMeasurements />
        </TabsContent>

        <TabsContent value="muscle-distribution">
          <MuscleDistribution />
        </TabsContent>

        <TabsContent value="exercises">
          <SelectedExercisesProgress
            exerciseProgress={exerciseProgress?.exercisesProgressByUser || []}
            userId={user?.id || ''}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PremiumBadge() {
  return (
    <Badge variant="premium" className="p-1 rounded-md">
      <Crown className="size-3 rounded-full" />
    </Badge>
  )
}
