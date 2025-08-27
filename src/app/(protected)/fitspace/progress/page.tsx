'use client'

import { Crown, Lock, TrendingUp } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import { useExercisesProgressByUserQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

// import { BodyComposition } from './components/body-composition'
import { BodyMeasurements } from './components/body-measurements'
import { SelectedExercisesProgress } from './components/selected-exercises-progress'

export default function ProgressPage() {
  const { user, hasPremium } = useUser()

  // Get progress data for all exercises
  const { data: exerciseProgress } = useExercisesProgressByUserQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id && hasPremium },
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
          <TabsTrigger
            value="exercises"
            className="flex items-center gap-2"
            disabled={!hasPremium}
          >
            Exercises {!hasPremium ? <Lock /> : <Crown />}
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
            userId={user?.id || ''}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
