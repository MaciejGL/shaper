export type ExerciseSuggestionRole =
  | 'activation'
  | 'primary_compound'
  | 'secondary_compound'
  | 'accessory'
  | 'isolation'

export interface ExerciseSuggestion {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  role: ExerciseSuggestionRole
}

export interface SuggestionsResponse {
  suggestions: ExerciseSuggestion[]
  context: string
}

export interface MuscleProgressData {
  muscle: string
  completedSets: number
  targetSets: number
  percentRecovered: number
  lastSessionSets: number
}

export interface ExerciseForSelection {
  id: string
  name: string
  muscleGroup: string
  equipment: string | null
  type: string | null
  difficulty: string | null
  primaryDisplayGroups: string[]
  secondaryDisplayGroups: string[]
}

export interface AiOrderedSuggestion {
  exerciseId: string
  role: ExerciseSuggestionRole
}


