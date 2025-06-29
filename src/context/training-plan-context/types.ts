import { TrainingPlanFormData } from '@/app/(protected)/trainer/types'

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

export type TrainingPlanContextType = {
  // State
  formData: TrainingPlanFormData
  trainingId?: string
  isDirty: boolean

  activeWeek: number

  isLoadingInitialData: boolean
  isDeletingTrainingPlan: boolean
  isDuplicatingTrainingPlan: boolean

  // Data
  createdAt?: string
  updatedAt?: string
  assignedCount?: number

  // Actions
  setActiveWeek: (week: number) => void

  // Granular update functions
  updateDetails: (details: PartialTrainingPlanFormDataDetails) => void
  updateWeek: (weekIndex: number, week: PartialTrainingPlanFormDataWeek) => void
  removeWeek: (weekIndex: number) => void
  addWeek: () => void
  cloneWeek: (weekIndex: number) => void
  updateDay: (
    weekIndex: number,
    dayIndex: number,
    day: PartialTrainingPlanFormDataDay,
  ) => void
  updateExercise: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    exercise: PartialTrainingPlanFormDataExercise,
  ) => void
  addExercise: (
    weekIndex: number,
    dayIndex: number,
    exercise: PartialTrainingPlanFormDataExercise,
    atIndex?: number,
  ) => void
  removeExercise: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
  ) => void
  moveExercise: (
    sourceWeekIndex: number,
    sourceDayIndex: number,
    sourceExerciseIndex: number,
    targetWeekIndex: number,
    targetDayIndex: number,
    targetExerciseIndex: number,
  ) => void
  updateSet: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    set: PartialTrainingPlanFormDataSet,
  ) => void
  addSet: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    set: PartialTrainingPlanFormDataSet,
  ) => void
  removeSet: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
  ) => void

  // Other actions
  clearDraft: () => void
  handleDelete: (trainingId: string) => Promise<void>
  handleDuplicate: (trainingId: string) => Promise<void>
}
