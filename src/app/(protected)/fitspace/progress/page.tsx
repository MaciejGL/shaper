'use client'

import { Dumbbell, Scale, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLUserBodyMeasure,
  useExercisesProgressByUserQuery,
  useUserQuery,
} from '@/generated/graphql-client'
import { isProd } from '@/lib/get-base-url'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { BodyMeasurements } from './components/body-measurements'
import { SelectedExercisesProgress } from './components/selected-exercises-progress'

export default function ProgressPage() {
  const { data: userData } = useUserQuery()
  const [userId, setUserId] = useState<string | null>(null)

  // Use the generated FitspaceGoalProgress query hook

  useEffect(() => {
    // Get user ID from the user data
    if (userData?.user?.id) {
      setUserId(userData.user.id)
    }
  }, [userData])

  // Get progress data for all exercises
  const { data: exerciseProgress } = useExercisesProgressByUserQuery(
    { userId: userId || '' },
    { enabled: !!userId },
  )

  if (isProd) {
    return <div>Progress page</div>
  }
  // Mock body measures for MVP - in real implementation, this would come from GraphQL
  const bodyMeasures = userData?.user?.profile?.bodyMeasures || []

  const handleAddMeasurement = async (measurements: GQLUserBodyMeasure) => {
    // TODO: Implement addBodyMeasurement mutation
    console.info('Adding measurement:', measurements)
  }

  return (
    <div className="container-fitspace mx-auto mb-24">
      <DashboardHeader
        title="Progress"
        icon={<TrendingUp />}
        className="mb-6"
      />

      <Tabs defaultValue="body-measures" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="body-measures"
            className="flex items-center gap-2"
          >
            <Scale className="size-4" />
            Body Measures
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <Dumbbell className="size-4" />
            Exercises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body-measures">
          <BodyMeasurements
            bodyMeasures={bodyMeasures}
            onAddMeasurement={handleAddMeasurement}
          />
        </TabsContent>

        <TabsContent value="exercises">
          <div className="space-y-6">
            <SelectedExercisesProgress
              exerciseProgress={exerciseProgress?.exercisesProgressByUser || []}
              userId={userId}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
