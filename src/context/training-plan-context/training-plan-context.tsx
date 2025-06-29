'use client'

import { useRouter } from 'next/navigation'
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useGetTemplateTrainingPlanByIdQuery } from '@/generated/graphql-client'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'

import type { TrainingPlanFormData } from '../../app/(protected)/trainer/trainings/creator-old/components/types'

import { useDayHandlers } from './day-handlers'
import { useDetailsHandlers } from './details-handlers'
import { useExerciseHandlers } from './exercise-handlers'
import { useTrainingPlanMutations } from './mutations'
import { useSetHandlers } from './set-handlers'
import type { TrainingPlanContextType } from './types'
import { useWeekHandlers } from './week-handlers'

// Initial form data
const initialFormData: TrainingPlanFormData = {
  details: {
    title: '',
    description: '',
    isPublic: false,
    isDraft: true,
    difficulty: undefined,
  },
  weeks: [
    {
      id: 'cmaod14o30004uhht6c7ldfx23',
      weekNumber: 1,
      name: 'Week 1',
      description: '',
      days: Array.from({ length: 7 }, (_, i) => ({
        id: 'cmaod14o30004uhht6c7ldfx2' + i,
        dayOfWeek: i,
        isRestDay: [0, 6].includes(i),
        exercises: [],
      })),
    },
  ],
}

const TrainingPlanContext = createContext<TrainingPlanContextType | null>(null)

export function TrainingPlanProvider({
  children,
  trainingId,
}: {
  children: ReactNode
  trainingId?: string
}) {
  // ## State
  const router = useRouter()
  const [isDirty, setIsDirty] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeWeek, setActiveWeek] = useState(0)
  const [activeDay, setActiveDay] = useState(0)
  const [details, setDetails] = useState<TrainingPlanFormData['details']>(
    initialFormData.details,
  )
  const [weeks, setWeeks] = useState<TrainingPlanFormData['weeks']>(
    initialFormData.weeks,
  )

  // ## Queries and mutations
  const { data: templateTrainingPlan, isLoading: isLoadingInitialData } =
    useGetTemplateTrainingPlanByIdQuery(
      { id: trainingId! },
      {
        enabled: !!trainingId,
        refetchOnMount: 'always',
        select: (data) => ({
          details: {
            title: data.getTrainingPlanById.title,
            description: data.getTrainingPlanById.description,
            isPublic: data.getTrainingPlanById.isPublic,
            isTemplate: data.getTrainingPlanById.isTemplate,
            isDraft: data.getTrainingPlanById.isDraft,
            difficulty: data.getTrainingPlanById.difficulty,
          },
          createdAt: data.getTrainingPlanById.createdAt,
          updatedAt: data.getTrainingPlanById.updatedAt,
          assignedCount: data.getTrainingPlanById.assignedCount,
          weeks: data.getTrainingPlanById.weeks,
        }),
      },
    )

  // ## Set initial data
  useEffect(() => {
    if (templateTrainingPlan) {
      setDetails(templateTrainingPlan.details)
      setWeeks(templateTrainingPlan.weeks as TrainingPlanFormData['weeks'])
    }
  }, [templateTrainingPlan])

  // ## Mutations
  const {
    createTrainingPlan,
    deleteTrainingPlan,
    duplicateTrainingPlan,
    isPending,
    isDeleting,
    isDuplicating,
  } = useTrainingPlanMutations()

  // ## Granular update functions (with debounced auto-save)
  const { updateWeek, removeWeek, addWeek, cloneWeek } = useWeekHandlers({
    trainingId,
    weeks,
    setWeeks,
    setIsDirty,
    setActiveWeek,
  })
  const { updateDetails } = useDetailsHandlers({
    trainingId,
    details,
    setDetails,
    setIsDirty,
  })
  const { updateDay } = useDayHandlers(weeks, setWeeks, setIsDirty)
  const { updateExercise, addExercise, removeExercise, moveExercise } =
    useExerciseHandlers({ setWeeks, setIsDirty, weeks })
  const { updateSet, addSet, removeSet } = useSetHandlers(
    setWeeks,
    setIsDirty,
    weeks,
  )

  // Memoize handlers to prevent unnecessary re-renders
  const clearDraft = useCallback(() => {
    setDetails(templateTrainingPlan?.details || initialFormData.details)
    setWeeks(
      (templateTrainingPlan?.weeks as TrainingPlanFormData['weeks']) ||
        initialFormData.weeks,
    )
    setIsDirty(false)
  }, [templateTrainingPlan])

  // ## Unsaved Changes Protection
  // Warn user when trying to close page with unsaved changes or any pending operations
  // TanStack Query automatically detects all pending mutations
  useUnsavedChangesWarning({
    isDirty,
    enabled: !!trainingId, // Only enable for existing training plans
  })

  const handleSubmit = useCallback(async () => {
    const currentTrainingId = trainingId
    if (!currentTrainingId) {
      const res = await createTrainingPlan({
        input: {
          isPublic: details.isPublic,
          isDraft: details.isDraft,
          title: details.title,
          description: details.description,
          difficulty: details.difficulty,
          weeks: weeks.map((week) => ({
            ...week,
            id: undefined,
            days: week.days.map((day) => ({
              ...day,
              id: undefined,
              exercises: day.exercises.map((exercise) => ({
                ...exercise,
                id: undefined,
                sets: exercise.sets.map((set) => ({
                  ...set,
                  id: undefined,
                })),
              })),
            })),
          })),
        },
      })
      clearDraft()
      setIsDirty(false)
      router.push(`/trainer/trainings/${res.createTrainingPlan.id}`)
    }
  }, [trainingId, createTrainingPlan, clearDraft, router, details, weeks])

  const handleDelete = useCallback(
    async (trainingId: string) => {
      await deleteTrainingPlan({ id: trainingId })
    },
    [deleteTrainingPlan],
  )

  const handleDuplicate = useCallback(
    async (trainingId: string) => {
      await duplicateTrainingPlan({ id: trainingId })
    },
    [duplicateTrainingPlan],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // State
      formData: { details, weeks },
      trainingId: trainingId,
      isDirty,
      currentStep,
      activeWeek,
      activeDay,

      // Loading states
      isLoadingInitialData: isLoadingInitialData,
      isPending,
      isUpdating: false, // TODO: Track update mutation status
      isDeleting,
      isDuplicating,

      // Data
      createdAt: templateTrainingPlan?.createdAt,
      updatedAt: templateTrainingPlan?.updatedAt,
      assignedCount: templateTrainingPlan?.assignedCount,

      // Actions
      setCurrentStep,
      setActiveWeek,
      setActiveDay,
      updateDetails,
      updateWeek,
      removeWeek,
      cloneWeek,
      addWeek,
      updateDay,
      updateExercise,
      addExercise,
      removeExercise,
      moveExercise,
      updateSet,
      addSet,
      removeSet,
      clearDraft,
      handleSubmit,
      handleDelete,
      handleDuplicate,
    }),
    [
      details,
      weeks,
      trainingId,
      isDirty,
      currentStep,
      activeWeek,
      activeDay,
      isLoadingInitialData,
      isPending,
      isDeleting,
      isDuplicating,
      templateTrainingPlan?.createdAt,
      templateTrainingPlan?.updatedAt,
      templateTrainingPlan?.assignedCount,
      updateDetails,
      updateWeek,
      removeWeek,
      addWeek,
      cloneWeek,
      updateDay,
      updateExercise,
      addExercise,
      removeExercise,
      moveExercise,
      updateSet,
      addSet,
      removeSet,
      clearDraft,
      handleSubmit,
      handleDelete,
      handleDuplicate,
    ],
  )

  return (
    <TrainingPlanContext.Provider value={value}>
      {children}
    </TrainingPlanContext.Provider>
  )
}

// Custom hook to use the training plan context
export function useTrainingPlan() {
  const context = useContext(TrainingPlanContext)
  if (!context) {
    throw new Error(
      'useTrainingPlan must be used within a TrainingPlanProvider',
    )
  }
  return context
}
