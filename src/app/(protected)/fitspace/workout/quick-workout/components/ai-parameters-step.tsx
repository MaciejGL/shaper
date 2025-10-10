'use client'

import type {
  AiWorkoutInputData,
  RepFocus,
} from '../hooks/use-ai-workout-generation'

import { ExerciseCountControl } from './controls/exercise-count-control'
import { MaxSetsControl } from './controls/max-sets-control'
import { RepFocusSelector } from './controls/rep-focus-selector'

interface AiParametersStepProps {
  data: AiWorkoutInputData
  onDataChange: (data: AiWorkoutInputData) => void
}

export function AiParametersStep({
  data,
  onDataChange,
}: AiParametersStepProps) {
  const updateExerciseCount = (count: number) => {
    onDataChange({ ...data, exerciseCount: count })
  }

  const updateMaxSets = (sets: number) => {
    onDataChange({ ...data, maxSetsPerExercise: sets })
  }

  const updateRepFocus = (repFocus: RepFocus) => {
    onDataChange({ ...data, repFocus })
  }

  return (
    <div className="space-y-2">
      <ExerciseCountControl
        value={data.exerciseCount}
        onChange={updateExerciseCount}
      />
      <MaxSetsControl
        value={data.maxSetsPerExercise}
        onChange={updateMaxSets}
      />

      <RepFocusSelector value={data.repFocus} onChange={updateRepFocus} />
    </div>
  )
}
