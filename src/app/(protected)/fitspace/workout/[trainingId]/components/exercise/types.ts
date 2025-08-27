import { WorkoutExercise } from '../workout-page.client'

export interface ExerciseProps {
  exercise: WorkoutExercise
  exercises: WorkoutExercise[]
  onPaginationClick: (exerciseId: string, type: 'prev' | 'next') => void
}

export interface ExerciseHeaderProps {
  exercise: WorkoutExercise
  exercises: WorkoutExercise[]
  onPaginationClick: (exerciseId: string, type: 'prev' | 'next') => void
}

export interface ExerciseSelectorProps {
  exercise?: WorkoutExercise
  activeExerciseId?: string | null
  setActiveExerciseId: (exerciseId: string) => void
  className?: string
}

export interface ExerciseSetsProps {
  exercise: WorkoutExercise
  previousLogs: (WorkoutExercise & {
    performedOnWeekNumber: number
    performedOnDayNumber: number
  })[]
}

export interface ExerciseSetProps {
  set: WorkoutExercise['sets'][number]
  previousSetWeightLog?: number | null
  previousSetRepsLog?: number | null
  previousLogs: (WorkoutExercise & {
    performedOnWeekNumber: number
    performedOnDayNumber: number
  })[]
  reps: string
  weight: string
  onRepsChange: (reps: string) => void
  onWeightChange: (weight: string) => void
}

export interface ExerciseMetadataProps {
  exercise: WorkoutExercise
  handleMarkAsCompleted: (checked: boolean) => void
  isCompleted: boolean
  handleRemoveExercise: () => void
  isRemoving: boolean
}

export interface ExerciseNotebookProps {
  exercise: WorkoutExercise
}

export interface SupersetsNavigationProps {
  exercise: WorkoutExercise
  exercises: WorkoutExercise[]
  onPaginationClick: (exerciseId: string, type: 'prev' | 'next') => void
}
