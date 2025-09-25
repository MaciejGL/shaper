'use client'

import { useParams } from 'next/navigation'

import { TrainingPlanProvider } from '../../../../../../context/training-plan-context/training-plan-context'
import WorkoutPlanner from '../components/workout-planner'
import { CreatorProvider } from '../hooks/use-creator-context'

export default function CreateTrainingPlanPage() {
  const { trainingId } = useParams<{ trainingId: string }>()

  return (
    <div className="h-full">
      <CreatorProvider>
        <TrainingPlanProvider trainingId={trainingId}>
          <WorkoutPlanner />
        </TrainingPlanProvider>
      </CreatorProvider>
    </div>
  )
}
