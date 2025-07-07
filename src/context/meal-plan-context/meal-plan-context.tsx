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

import { useGetMealPlanByIdQuery } from '@/generated/graphql-client'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'

import type { MealPlanContextType, MealPlanFormData } from './types'

const MealPlanContext = createContext<MealPlanContextType | null>(null)

export function MealPlanProvider({
  children,
  mealPlanId,
}: {
  children: ReactNode
  mealPlanId?: string
}) {
  // ## State - Only keep UI-specific state, not data state
  const [activeWeek, setActiveWeek] = useState(0)

  // ## Queries - React Query cache as single source of truth
  const { data: mealPlanData, isLoading: isLoadingInitialData } =
    useGetMealPlanByIdQuery(
      { id: mealPlanId! },
      {
        enabled: !!mealPlanId,
        refetchOnMount: 'always',
      },
    )

  // ## Derived data from React Query cache
  const formData = useMemo(() => {
    if (!mealPlanData?.getMealPlanById) return null

    const plan = mealPlanData.getMealPlanById
    return {
      details: {
        title: plan.title,
        description: plan.description || '',
        isDraft: plan.isDraft,
        dailyCalories: plan.dailyCalories || undefined,
        dailyProtein: plan.dailyProtein || undefined,
        dailyCarbs: plan.dailyCarbs || undefined,
        dailyFat: plan.dailyFat || undefined,
      },
      weeks: plan.weeks || [],
    } as MealPlanFormData
  }, [mealPlanData])

  // ## Stub mutations for now - will be implemented later
  const updateDetails = useCallback((detailsData: any) => {
    console.log('updateDetails (stub):', detailsData)
    // TODO: Implement optimistic update
  }, [])

  const updateMeal = useCallback(
    (weekIndex: number, dayIndex: number, mealIndex: number, mealData: any) => {
      console.log('updateMeal (stub):', {
        weekIndex,
        dayIndex,
        mealIndex,
        mealData,
      })
      // TODO: Implement optimistic update
    },
    [],
  )

  const addMeal = useCallback(
    (weekIndex: number, dayIndex: number, meal: any, atIndex?: number) => {
      console.log('addMeal (stub):', { weekIndex, dayIndex, meal, atIndex })
      // TODO: Implement optimistic update
    },
    [],
  )

  const removeMeal = useCallback(
    (weekIndex: number, dayIndex: number, mealIndex: number) => {
      console.log('removeMeal (stub):', { weekIndex, dayIndex, mealIndex })
      // TODO: Implement optimistic update
    },
    [],
  )

  const addFood = useCallback(
    (weekIndex: number, dayIndex: number, mealIndex: number, foodData: any) => {
      console.log('addFood (stub):', {
        weekIndex,
        dayIndex,
        mealIndex,
        foodData,
      })
      // TODO: Implement optimistic update
    },
    [],
  )

  const updateFood = useCallback(
    (
      weekIndex: number,
      dayIndex: number,
      mealIndex: number,
      foodIndex: number,
      foodData: any,
    ) => {
      console.log('updateFood (stub):', {
        weekIndex,
        dayIndex,
        mealIndex,
        foodIndex,
        foodData,
      })
      // TODO: Implement optimistic update
    },
    [],
  )

  const removeFood = useCallback(
    (
      weekIndex: number,
      dayIndex: number,
      mealIndex: number,
      foodIndex: number,
    ) => {
      console.log('removeFood (stub):', {
        weekIndex,
        dayIndex,
        mealIndex,
        foodIndex,
      })
      // TODO: Implement optimistic update
    },
    [],
  )

  const updateDay = useCallback(
    (weekIndex: number, dayIndex: number, dayData: any) => {
      console.log('updateDay (stub):', { weekIndex, dayIndex, dayData })
      // TODO: Implement optimistic update
    },
    [],
  )

  const moveMeal = useCallback(
    (
      sourceWeekIndex: number,
      sourceDayIndex: number,
      sourceMealIndex: number,
      targetWeekIndex: number,
      targetDayIndex: number,
      targetMealIndex: number,
    ) => {
      console.log('moveMeal (stub):', {
        sourceWeekIndex,
        sourceDayIndex,
        sourceMealIndex,
        targetWeekIndex,
        targetDayIndex,
        targetMealIndex,
      })
      // TODO: Implement optimistic update
    },
    [],
  )

  const addWeek = useCallback(() => {
    console.log('addWeek (stub)')
    // TODO: Implement optimistic update
  }, [])

  const removeWeek = useCallback((weekIndex: number) => {
    console.log('removeWeek (stub):', { weekIndex })
    // TODO: Implement optimistic update
  }, [])

  const cloneWeek = useCallback((weekIndex: number) => {
    console.log('cloneWeek (stub):', { weekIndex })
    // TODO: Implement optimistic update
  }, [])

  const updateWeek = useCallback((weekIndex: number, weekData: any) => {
    console.log('updateWeek (stub):', { weekIndex, weekData })
    // TODO: Implement optimistic update
  }, [])

  // ## Check if there are any pending mutations (for unsaved changes warning)
  const mutationKeys = [
    'UpdateMealPlanDetails',
    'UpdateMealWeekDetails',
    'UpdateMealDayData',
    'UpdateMeal',
    'UpdateMealFood',
    'AddMealToDay',
    'RemoveMealFromDay',
    'AddFoodToMeal',
    'RemoveFoodFromMeal',
  ]

  const isDirty =
    useIsMutating({
      mutationKey: mutationKeys,
    }) > 0

  // ## Unsaved Changes Protection
  useUnsavedChangesWarning({
    isDirty,
    enabled: !!mealPlanId,
    mutationKeyFilter: mutationKeys,
  })

  // ## Legacy mutations (delete, duplicate) - Stub for now
  const isDeletingMealPlan = false
  const isDuplicatingMealPlan = false

  const handleDelete = useCallback(async (mealPlanId: string) => {
    console.log('handleDelete (stub):', mealPlanId)
    // TODO: Implement delete mutation
  }, [])

  const handleDuplicate = useCallback(async (mealPlanId: string) => {
    console.log('handleDuplicate (stub):', mealPlanId)
    // TODO: Implement duplicate mutation
  }, [])

  const clearDraft = useCallback(() => {
    updateDetails({ isDraft: false })
  }, [updateDetails])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // Data directly from React Query cache
      formData,
      mealPlanId,
      isDirty,
      activeWeek,
      isDeletingMealPlan,
      isDuplicatingMealPlan,

      // Loading states
      isLoadingInitialData,

      // Metadata
      createdAt: mealPlanData?.getMealPlanById?.createdAt,
      updatedAt: mealPlanData?.getMealPlanById?.updatedAt,
      assignedCount: mealPlanData?.getMealPlanById?.assignedCount,

      // UI Actions
      setActiveWeek,

      // Optimistic Mutations
      updateDetails,
      updateMeal,
      addMeal,
      removeMeal,
      addFood,
      updateFood,
      removeFood,
      updateDay,
      moveMeal,
      addWeek,
      removeWeek,
      cloneWeek,
      updateWeek,
      clearDraft,

      // Legacy mutations
      handleDelete,
      handleDuplicate,
    }),
    [
      formData,
      mealPlanId,
      isDirty,
      activeWeek,
      isDeletingMealPlan,
      isDuplicatingMealPlan,
      isLoadingInitialData,
      mealPlanData?.getMealPlanById?.createdAt,
      mealPlanData?.getMealPlanById?.updatedAt,
      mealPlanData?.getMealPlanById?.assignedCount,
      setActiveWeek,
      updateDetails,
      updateMeal,
      addMeal,
      removeMeal,
      addFood,
      updateFood,
      removeFood,
      updateDay,
      moveMeal,
      addWeek,
      removeWeek,
      cloneWeek,
      updateWeek,
      clearDraft,
      handleDelete,
      handleDuplicate,
    ],
  )

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  )
}

export function useMealPlan() {
  const context = useContext(MealPlanContext)
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider')
  }
  return context
}

// For backward compatibility and easier access
export { MealPlanContext }
