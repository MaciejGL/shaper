'use client'

import { TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useExercisesProgressByUserQuery,
  useProgressUserQuery,
} from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

// import { BodyComposition } from './components/body-composition'
import { BodyMeasurements } from './components/body-measurements'
import { SelectedExercisesProgress } from './components/selected-exercises-progress'

export default function ProgressPage() {
  const { data: userData } = useProgressUserQuery()
  const [userId, setUserId] = useState<string | null>(null)

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

  return (
    <div className="container-hypertro mx-auto">
      <DashboardHeader title="Progress" icon={TrendingUp} className="mb-6" />

      <Tabs defaultValue="body-measures" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="body-measures"
            className="flex items-center gap-2"
          >
            Body Measures
          </TabsTrigger>
          {/* <TabsTrigger
            value="body-composition"
            className="flex items-center gap-2"
          >
            BMI & BMR
          </TabsTrigger> */}
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            Exercises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body-measures">
          <BodyMeasurements />
        </TabsContent>

        {/* <TabsContent value="body-composition">
          <BodyComposition />
        </TabsContent> */}

        <TabsContent value="exercises">
          <SelectedExercisesProgress
            exerciseProgress={exerciseProgress?.exercisesProgressByUser || []}
            userId={userId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
