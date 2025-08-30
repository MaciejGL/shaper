import type {
  GQLAddExerciseToDayInput,
  GQLAddSetToExerciseInput,
  GQLUpdateExerciseSetInput,
  GQLUpdateTrainingDayDataInput,
  GQLUpdateTrainingExerciseInput,
  GQLUpdateTrainingPlanDetailsInput,
} from '@/generated/graphql-server'

import type { TrainingPlanFormData } from '../../app/(protected)/trainer/types'

export type PartialTrainingPlanFormDataWeek = Partial<
  TrainingPlanFormData['weeks'][number]
>
export type PartialTrainingPlanFormDataDay = Partial<
  TrainingPlanFormData['weeks'][number]['days'][number]
>

export type PartialTrainingPlanFormDataExercise = Partial<
  TrainingPlanFormData['weeks'][number]['days'][number]['exercises'][number]
>

export type PartialTrainingPlanFormDataSet = Partial<
  TrainingPlanFormData['weeks'][number]['days'][number]['exercises'][number]['sets'][number]
>

export type PartialTrainingPlanFormDataDetails = Partial<
  TrainingPlanFormData['details']
>

export interface TrainingPlanContextType {
  // Data from React Query cache (can be null while loading)
  formData: TrainingPlanFormData | null
  trainingId?: string
  isDirty: boolean
  activeWeek: number
  isDeletingTrainingPlan: boolean
  isDuplicatingTrainingPlan: boolean

  // Loading states
  isLoadingInitialData: boolean

  // Metadata
  createdAt?: string
  updatedAt?: string
  assignedCount?: number

  // UI Actions
  setActiveWeek: (weekIndex: number) => void

  // Unified Optimistic Mutations (ALL fully type-safe now)
  updateDetails: (
    detailsData: Partial<Omit<GQLUpdateTrainingPlanDetailsInput, 'id'>>,
  ) => void
  updateExercise: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    exerciseData: Partial<Omit<GQLUpdateTrainingExerciseInput, 'id'>>,
  ) => void
  addExercise: (
    weekIndex: number,
    dayIndex: number,
    exercise: Omit<GQLAddExerciseToDayInput, 'dayId' | 'order'>,
    atIndex?: number,
  ) => void
  removeExercise: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
  ) => void
  removeAllExercisesFromDay: (weekIndex: number, dayIndex: number) => void
  addSet: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setData: Omit<GQLAddSetToExerciseInput, 'exerciseId' | 'order'>,
  ) => void
  updateSet: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    setData: Partial<Omit<GQLUpdateExerciseSetInput, 'id'>>,
  ) => void
  removeSet: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
  ) => void
  updateDay: (
    weekIndex: number,
    dayIndex: number,
    dayData: Partial<Omit<GQLUpdateTrainingDayDataInput, 'dayId'>>,
  ) => void
  moveExercise: (
    sourceWeekIndex: number,
    sourceDayIndex: number,
    sourceExerciseIndex: number,
    targetWeekIndex: number,
    targetDayIndex: number,
    targetExerciseIndex: number,
  ) => void
  copyExercisesFromDay: (sourceDayId: string, targetDayId: string) => void

  // Week operations - now fully implemented with proper types
  addWeek: () => void
  removeWeek: (weekIndex: number) => void
  cloneWeek: (weekIndex: number) => void
  updateWeek: (
    weekIndex: number,
    weekData: Partial<{
      weekNumber: number
      name: string
      description: string
    }>,
  ) => void

  // Utility functions
  clearDraft: () => void
  handleDelete: (trainingId: string) => Promise<void>
  handleDuplicate: (trainingId: string) => Promise<void>
}
