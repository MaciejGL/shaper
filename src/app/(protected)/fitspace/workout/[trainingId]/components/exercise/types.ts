import { GQLFitspaceGetWorkoutDayQuery } from '@/generated/graphql-client'

type WorkoutExercise = NonNullable<
  GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
>['day']['exercises'][number]

type PreviousDayLogs = NonNullable<
  GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
>['previousDayLogs']

export interface ExerciseProps {
  exercise: WorkoutExercise
  previousDayLogs?: PreviousDayLogs
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
  previousLogs?: PreviousDayLogs[number]['sets'][number][] | null
}

export interface ExerciseSetProps {
  set: WorkoutExercise['sets'][number]
  previousSetWeightLog?: number | null
  previousSetRepsLog?: number | null
  reps: string
  weight: string
  onRepsChange: (reps: string) => void
  onWeightChange: (weight: string) => void
  onDelete: () => void
  isLastSet: boolean
  restDuration?: number | null
  isTimerActive: boolean
  onSetCompleted: (skipTimer?: boolean) => void
  onSetUncompleted: () => void
  onTimerComplete: () => void
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
