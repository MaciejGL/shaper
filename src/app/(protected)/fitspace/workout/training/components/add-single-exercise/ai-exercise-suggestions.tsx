'use client'

import {
  AiExerciseSuggestionsProvider,
  type AiExerciseSuggestionsExercise,
} from './ai-exercise-suggestions-context'
import { AiExerciseSuggestionsPanel } from './ai-exercise-suggestions-panel'
import { AiExerciseSuggestionsTrigger } from './ai-exercise-suggestions-trigger'

interface AiExerciseSuggestionsProps {
  workoutType?: string
  allExercises: AiExerciseSuggestionsExercise[]
  selectedExerciseIds: string[]
  onToggleExercise: (exerciseId: string) => void
}

export { AiExerciseSuggestionsProvider }
export { AiExerciseSuggestionsTrigger } from './ai-exercise-suggestions-trigger'
export { AiExerciseSuggestionsPanel } from './ai-exercise-suggestions-panel'

export function AiExerciseSuggestions({
  workoutType,
  allExercises,
  selectedExerciseIds,
  onToggleExercise,
}: AiExerciseSuggestionsProps) {
  return (
    <AiExerciseSuggestionsProvider
      workoutType={workoutType}
      allExercises={allExercises}
      selectedExerciseIds={selectedExerciseIds}
      onToggleExercise={onToggleExercise}
    >
      <div>
        <AiExerciseSuggestionsTrigger />
        <AiExerciseSuggestionsPanel />
      </div>
    </AiExerciseSuggestionsProvider>
  )
}
