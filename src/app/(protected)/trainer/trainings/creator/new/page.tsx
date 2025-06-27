'use client'

import { TrainingPlanProvider } from '../../../../../../context/training-plan-context/training-plan-context'
import { CreateTrainingPlanForm } from '../components/create-training-plan-form/create-training-plan-form'

export default function CreateTrainingPlanPage() {
  return (
    <div className="container h-full">
      <TrainingPlanProvider>
        <CreateTrainingPlanForm />
      </TrainingPlanProvider>
    </div>
  )
}
