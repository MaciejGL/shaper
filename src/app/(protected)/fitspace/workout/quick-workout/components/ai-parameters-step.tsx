'use client'

import { GQLEquipment } from '@/generated/graphql-client'

import type { AiWorkoutInputData, RepFocus, RpeRange } from './ai-workout-input'
import { ExerciseCountControl } from './controls/exercise-count-control'
import { MaxSetsControl } from './controls/max-sets-control'
import { RepFocusSelector } from './controls/rep-focus-selector'
import { RpeRangeSelector } from './controls/rpe-range-selector'
import { WorkoutSummary } from './controls/workout-summary'

interface AiParametersStepProps {
  data: AiWorkoutInputData
  onDataChange: (data: AiWorkoutInputData) => void
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
}

export function AiParametersStep({
  data,
  onDataChange,
  selectedMuscleGroups,
  selectedEquipment,
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
    <div className="space-y-8">
      {/* Exercise Count and Max Sets in one card */}
      <ExerciseCountControl
        value={data.exerciseCount}
        onChange={updateExerciseCount}
      />
      <MaxSetsControl
        value={data.maxSetsPerExercise}
        onChange={updateMaxSets}
      />

      {/* RPE Range Selection */}
      <RpeRangeSelector value={data.rpeRange} onChange={updateRpeRange} />

      {/* Rep Focus Selection */}
      <RepFocusSelector value={data.repFocus} onChange={updateRepFocus} />

      {/* Summary */}
      <WorkoutSummary
        exerciseCount={data.exerciseCount}
        maxSetsPerExercise={data.maxSetsPerExercise}
        rpeRange={data.rpeRange}
        repFocus={data.repFocus}
        selectedMuscleGroups={selectedMuscleGroups}
        selectedEquipment={selectedEquipment}
      />
    </div>
  )
}
