import { TrainingPlanFormData } from '@/app/(protected)/trainer/trainings/creator/components/types'

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
  isDirty: boolean
  currentStep: number
  activeWeek: number
  activeDay: number
  isLoadingInitialData: boolean
  isPending: boolean
  isUpdating: boolean
  isDeleting: boolean
  isDuplicating: boolean

  // Actions
  setCurrentStep: (step: number) => void
  setActiveWeek: (week: number) => void
  setActiveDay: (day: number) => void

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
  ) => void
  removeExercise: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
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
  handleSubmit: () => Promise<void>
  handleDelete: (trainingId: string) => Promise<void>
  handleDuplicate: (trainingId: string) => Promise<void>
}
