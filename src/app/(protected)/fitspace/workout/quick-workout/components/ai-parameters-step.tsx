'use client'

import type {
  AiWorkoutInputData,
  RepFocus,
  RpeRange,
} from '../hooks/use-ai-workout-generation'

import { ExerciseCountControl } from './controls/exercise-count-control'
import { MaxSetsControl } from './controls/max-sets-control'
import { RepFocusSelector } from './controls/rep-focus-selector'
import { RpeRangeSelector } from './controls/rpe-range-selector'

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

  const updateRpeRange = (rpeRange: RpeRange) => {
    onDataChange({ ...data, rpeRange })
  }

  const updateRepFocus = (repFocus: RepFocus) => {
    onDataChange({ ...data, repFocus })
  }

  return (
    <div className="space-y-6 ">
      {/* Exercise Count and Max Sets in one card */}
      <ExerciseCountControl
        value={data.exerciseCount}
        onChange={updateExerciseCount}
      />
      <MaxSetsControl
        value={data.maxSetsPerExercise}
        onChange={updateMaxSets}
      />

      {/* Rep Focus Selection */}
      <RepFocusSelector value={data.repFocus} onChange={updateRepFocus} />

      {/* RPE Range Selection */}
      <RpeRangeSelector value={data.rpeRange} onChange={updateRpeRange} />
    </div>
  )
}
