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

import type { TrainingPlanFormData } from '../../app/(protected)/trainer/trainings/creator/components/types'

import { useDayHandlers } from './day-handlers'
import { useExerciseHandlers } from './exercise-handlers'
import { useTrainingPlanMutations } from './mutations'
import { useSetHandlers } from './set-handlers'
import type { TrainingPlanContextType } from './types'
import { useWeekHandlers } from './week-handlers'

// Initial form data (moved from use-training-plan-form.ts)
const initialFormData: TrainingPlanFormData = {
  details: {
    title: '',
    description: '',
    isPublic: false,
    isDraft: true,
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

  // ## Queries and mutations (moved from use-training-plan-form.ts)
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
          },
          weeks: data.getTrainingPlanById.weeks,
        }),
      },
    )

  // ## Set initial data
  useEffect(() => {
    if (templateTrainingPlan) {
      setDetails(templateTrainingPlan.details)
      setWeeks(templateTrainingPlan.weeks)
    }
  }, [templateTrainingPlan])

  // ## Mutations
  const {
    createTrainingPlan,
    updateTrainingPlan,
    deleteTrainingPlan,
    duplicateTrainingPlan,
    isPending,
    isUpdating,
    isDeleting,
    isDuplicating,
  } = useTrainingPlanMutations()

  // ## Granular update functions
  const { updateWeek, removeWeek, addWeek, cloneWeek } = useWeekHandlers(
    setWeeks,
    setIsDirty,
  )
  const updateDetails = useCallback(
    (newDetails: Partial<TrainingPlanFormData['details']>) => {
      setDetails((prev) => ({ ...prev, ...newDetails }))
      setIsDirty(true)
    },
    [],
  )
  const { updateDay } = useDayHandlers(setWeeks, setIsDirty)
  const { updateExercise, addExercise, removeExercise } = useExerciseHandlers(
    setWeeks,
    setIsDirty,
  )
  const { updateSet, addSet, removeSet } = useSetHandlers(setWeeks, setIsDirty)

  // Memoize handlers to prevent unnecessary re-renders
  const clearDraft = useCallback(() => {
    setDetails(templateTrainingPlan?.details || initialFormData.details)
    setWeeks(templateTrainingPlan?.weeks || initialFormData.weeks)
    setIsDirty(false)
  }, [templateTrainingPlan])

  const handleSubmit = useCallback(async () => {
    if (trainingId) {
      await updateTrainingPlan({
        input: {
          id: trainingId,
          isPublic: details.isPublic,
          isDraft: details.isDraft,
          title: details.title,
          description: details.description,
          weeks: weeks,
        },
      })
      setIsDirty(false)
      router.refresh()
    } else {
      const res = await createTrainingPlan({
        input: {
          isPublic: details.isPublic,
          isDraft: details.isDraft,
          title: details.title,
          description: details.description,
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
  }, [
    trainingId,
    updateTrainingPlan,
    createTrainingPlan,
    clearDraft,
    router,
    details,
    weeks,
  ])

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
      isDirty,
      currentStep,
      activeWeek,
      activeDay,

      // Loading states
      isLoadingInitialData,
      isPending,
      isUpdating,
      isDeleting,
      isDuplicating,

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
      isDirty,
      currentStep,
      activeWeek,
      activeDay,
      isLoadingInitialData,
      isPending,
      isUpdating,
      isDeleting,
      isDuplicating,
      updateDetails,
      updateWeek,
      removeWeek,
      addWeek,
      cloneWeek,
      updateDay,
      updateExercise,
      addExercise,
      removeExercise,
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
