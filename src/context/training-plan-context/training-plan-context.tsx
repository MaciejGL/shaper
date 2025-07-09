'use client'

import { useIsMutating } from '@tanstack/react-query'
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { useGetTemplateTrainingPlanByIdQuery } from '@/generated/graphql-client'
import { useTrainingPlanMutations } from '@/hooks/use-training-plan-mutations'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'

import { useTrainingPlanMutations as useLegacyMutations } from './mutations'
import type { TrainingPlanContextType } from './types'

const TrainingPlanContext = createContext<TrainingPlanContextType | null>(null)

export function TrainingPlanProvider({
  children,
  trainingId,
}: {
  children: ReactNode
  trainingId?: string
}) {
  // ## State - Only keep UI-specific state, not data state
  const [activeWeek, setActiveWeek] = useState(0)

  // ## Queries - React Query cache as single source of truth
  const { data: templateTrainingPlan, isLoading: isLoadingInitialData } =
    useGetTemplateTrainingPlanByIdQuery(
      { id: trainingId! },
      {
        enabled: !!trainingId,
        refetchOnMount: 'always',
        // No need for select transformation - use data directly
      },
    )

  // ## Unified Optimistic Mutations - Replace all handler files
  const {
    updateDetails,
    updateExercise,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    updateDay,
    moveExercise: moveExerciseMutation,
    moveExercisesToDay,
    addWeek,
    removeWeek,
    cloneWeek,
    updateWeek,
  } = useTrainingPlanMutations(trainingId)

  // ## Legacy mutations (delete, duplicate) - Keep for now
  const {
    deleteTrainingPlan,
    duplicateTrainingPlan,
    isDeleting: isDeletingTrainingPlan,
    isDuplicating: isDuplicatingTrainingPlan,
  } = useLegacyMutations()

  // ## Derived data from React Query cache
  const formData = useMemo(() => {
    if (!templateTrainingPlan?.getTrainingPlanById) return null

    const plan = templateTrainingPlan.getTrainingPlanById
    return {
      details: {
        title: plan.title,
        description: plan.description,
        isPublic: plan.isPublic,
        isTemplate: plan.isTemplate,
        isDraft: plan.isDraft,
        difficulty: plan.difficulty,
        assignedTo: plan.assignedTo,
        completedAt: plan.completedAt,
      },
      weeks: plan.weeks,
    }
  }, [templateTrainingPlan])

  // ## Check if there are any pending mutations (for unsaved changes warning)
  // With optimistic updates, "dirty" means pending mutations that haven't completed

  const mutationKeys = [
    'UpdateTrainingPlanDetails',
    'UpdateTrainingWeekDetails',
    'DuplicateTrainingWeek',
    'RemoveTrainingWeek',
    'AddTrainingWeek',
    'UpdateTrainingDayData',
    'UpdateTrainingExercise',
    'UpdateExerciseSet',
    'AddExerciseToDay',
    'RemoveExerciseFromDay',
    'MoveExercise',
    'AddSetToExercise',
    'RemoveSetFromExercise',
  ]
  const isDirty =
    useIsMutating({
      mutationKey: mutationKeys,
    }) > 0

  // ## Unsaved Changes Protection
  useUnsavedChangesWarning({
    isDirty,
    enabled: !!trainingId,
    mutationKeyFilter: mutationKeys,
  })

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

  // Clear draft status by setting isDraft to false
  const clearDraft = useCallback(() => {
    updateDetails({ isDraft: false })
  }, [updateDetails])

  // Wrapper for moveExercise to maintain API compatibility
  const moveExercise = useCallback(
    (
      sourceWeekIndex: number,
      sourceDayIndex: number,
      sourceExerciseIndex: number,
      targetWeekIndex: number,
      targetDayIndex: number,
      targetExerciseIndex: number,
    ) => {
      if (!formData) return

      // Calculate target day ID
      const targetDay = formData.weeks[targetWeekIndex]?.days[targetDayIndex]
      const newOrder = targetExerciseIndex + 1 // Convert from 0-based index to 1-based order

      moveExerciseMutation(
        sourceWeekIndex,
        sourceDayIndex,
        sourceExerciseIndex,
        newOrder,
        targetDay?.id,
      ).catch((error) => {
        console.error('Failed to move exercise:', error)
      })
    },
    [formData, moveExerciseMutation],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // Data directly from React Query cache (no more local state!)
      formData,
      trainingId,
      isDirty,
      activeWeek,
      isDeletingTrainingPlan,
      isDuplicatingTrainingPlan,

      // Loading states
      isLoadingInitialData,

      // Metadata
      createdAt: templateTrainingPlan?.getTrainingPlanById?.createdAt,
      updatedAt: templateTrainingPlan?.getTrainingPlanById?.updatedAt,
      assignedCount: templateTrainingPlan?.getTrainingPlanById?.assignedCount,

      // UI Actions
      setActiveWeek,

      // Unified Optimistic Mutations (NEW)
      updateDetails,
      updateExercise,
      addExercise,
      removeExercise,
      addSet,
      updateSet,
      removeSet,
      updateDay,
      moveExercise,
      moveExercisesToDay,
      addWeek,
      removeWeek,
      cloneWeek,
      updateWeek,
      clearDraft,

      // Legacy/Not Yet Migrated (OLD - will be replaced gradually)
      handleDelete,
      handleDuplicate,
    }),
    [
      formData,
      trainingId,
      isDirty,
      activeWeek,
      isDeletingTrainingPlan,
      isDuplicatingTrainingPlan,
      isLoadingInitialData,
      templateTrainingPlan?.getTrainingPlanById?.createdAt,
      templateTrainingPlan?.getTrainingPlanById?.updatedAt,
      templateTrainingPlan?.getTrainingPlanById?.assignedCount,
      updateDetails,
      updateDay,
      updateExercise,
      addExercise,
      removeExercise,
      addSet,
      updateSet,
      moveExercisesToDay,
      removeSet,
      removeWeek,
      addWeek,
      cloneWeek,
      updateWeek,
      moveExercise,
      clearDraft,
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
