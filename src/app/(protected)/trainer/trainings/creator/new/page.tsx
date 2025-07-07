'use client'

import { TrainingPlanProvider } from '../../../../../../context/training-plan-context/training-plan-context'
import WorkoutPlanner from '../components/workout-planner'

export default function CreateTrainingPlanPage() {
  return (
    <div className="h-full flex flex-col">
      <TrainingPlanProvider>
        <WorkoutPlanner />
      </TrainingPlanProvider>
    </div>
  )
}
