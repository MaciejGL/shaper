'use client'

import { useParams } from 'next/navigation'

import { TrainingPlanProvider } from '../../../../../../context/training-plan-context/training-plan-context'
import { CreateTrainingPlanForm } from '../components/create-training-plan-form/create-training-plan-form'

export default function CreateTrainingPlanPage() {
  const { trainingId } = useParams<{ trainingId: string }>()

  return (
    <div className="container h-full">
      <TrainingPlanProvider trainingId={trainingId}>
        <CreateTrainingPlanForm trainingId={trainingId} />
      </TrainingPlanProvider>
    </div>
  )
}
