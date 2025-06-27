'use client'

import { useParams } from 'next/navigation'

import { Loader } from '@/components/loader'
import { useFitspaceGetWorkoutQuery } from '@/generated/graphql-client'

import { WorkoutPageClient } from './components/workout-page.client'

export default function WorkoutPage() {
  const params = useParams<{ trainingId: string }>()
  const trainingId = params.trainingId
  const { data, isLoading } = useFitspaceGetWorkoutQuery(
    {
      trainingId,
    },
    {
      enabled: !!trainingId,
    },
  )

  if (isLoading) {
    return <Loader />
  }

  return data?.getWorkout ? (
    <WorkoutPageClient plan={data.getWorkout.plan} />
  ) : null
}
