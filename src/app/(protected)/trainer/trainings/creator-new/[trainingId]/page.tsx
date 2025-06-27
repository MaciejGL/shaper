'use client'

import { useParams } from 'next/navigation'

import { TrainingPlanProvider } from '../../../../../../context/training-plan-context/training-plan-context'
import WorkoutPlanner from '../components/workout-planner'

export default function CreateTrainingPlanPage() {
  const { trainingId } = useParams<{ trainingId: string }>()

  return (
    <div className="h-full">
      <TrainingPlanProvider trainingId={trainingId}>
        <WorkoutPlanner />
      </TrainingPlanProvider>
    </div>
  )
}
