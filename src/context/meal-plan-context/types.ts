import type {
  GQLAddFoodToMealInput,
  GQLAddMealToDayInput,
  GQLUpdateMealDayDataInput,
  GQLUpdateMealFoodInput,
  GQLUpdateMealInput,
  GQLUpdateMealPlanDetailsInput,
  GQLUpdateMealWeekDetailsInput,
} from '@/generated/graphql-server'

// Define meal plan form data structure
export interface MealPlanFormData {
  details: {
    title: string
    description?: string
    isDraft: boolean
    dailyCalories?: number
    dailyProtein?: number
    dailyCarbs?: number
    dailyFat?: number
  }
  weeks: {
    id: string
    weekNumber: number
    name: string
    description?: string
    days: {
      id: string
      dayOfWeek: number
      targetCalories?: number
      targetProtein?: number
      targetCarbs?: number
      targetFat?: number
      meals: {
        id: string
        name: string
        dateTime: string
        instructions?: string
        foods: {
          id: string
          name: string
          quantity: number
          unit: string
          caloriesPer100g?: number
          proteinPer100g?: number
          carbsPer100g?: number
          fatPer100g?: number
          fiberPer100g?: number
          openFoodFactsId?: string
        }[]
      }[]
    }[]
  }[]
}

export type PartialMealPlanFormDataWeek = Partial<
  MealPlanFormData['weeks'][number]
>
export type PartialMealPlanFormDataDay = Partial<
  MealPlanFormData['weeks'][number]['days'][number]
>
export type PartialMealPlanFormDataMeal = Partial<
  MealPlanFormData['weeks'][number]['days'][number]['meals'][number]
>
export type PartialMealPlanFormDataFood = Partial<
  MealPlanFormData['weeks'][number]['days'][number]['meals'][number]['foods'][number]
>
export type PartialMealPlanFormDataDetails = Partial<
  MealPlanFormData['details']
>

export interface MealPlanContextType {
  // Data from React Query cache (can be null while loading)
  formData: MealPlanFormData | null
  mealPlanId?: string
  isDirty: boolean
  activeWeek: number
  isDeletingMealPlan: boolean
  isDuplicatingMealPlan: boolean

  // Loading states
  isLoadingInitialData: boolean

  // Metadata
  createdAt?: string
  updatedAt?: string
  assignedCount?: number

  // UI Actions
  setActiveWeek: (weekIndex: number) => void

  // Unified Optimistic Mutations
  updateDetails: (
    detailsData: Partial<Omit<GQLUpdateMealPlanDetailsInput, 'id'>>,
  ) => void
  updateMeal: (
    weekIndex: number,
    dayIndex: number,
    mealIndex: number,
    mealData: Partial<Omit<GQLUpdateMealInput, 'id'>>,
  ) => void
  addMeal: (
    weekIndex: number,
    dayIndex: number,
    meal: Omit<GQLAddMealToDayInput, 'dayId'>,
    atIndex?: number,
  ) => void
  removeMeal: (weekIndex: number, dayIndex: number, mealIndex: number) => void
  addFood: (
    weekIndex: number,
    dayIndex: number,
    mealIndex: number,
    foodData: Omit<GQLAddFoodToMealInput, 'mealId' | 'dayId' | 'mealDateTime'>,
  ) => void
  updateFood: (
    weekIndex: number,
    dayIndex: number,
    mealIndex: number,
    foodIndex: number,
    foodData: Partial<Omit<GQLUpdateMealFoodInput, 'id'>>,
  ) => void
  removeFood: (
    weekIndex: number,
    dayIndex: number,
    mealIndex: number,
    foodIndex: number,
  ) => void
  updateDay: (
    weekIndex: number,
    dayIndex: number,
    dayData: Partial<Omit<GQLUpdateMealDayDataInput, 'dayId'>>,
  ) => void
  moveMeal: (
    sourceWeekIndex: number,
    sourceDayIndex: number,
    sourceMealIndex: number,
    targetWeekIndex: number,
    targetDayIndex: number,
    targetMealIndex: number,
  ) => void

  // Week operations
  addWeek: () => void
  removeWeek: (weekIndex: number) => void
  cloneWeek: (weekIndex: number) => void
  updateWeek: (
    weekIndex: number,
    weekData: Partial<Omit<GQLUpdateMealWeekDetailsInput, 'id'>>,
  ) => void

  // Utility functions
  clearDraft: () => void
  handleDelete: (mealPlanId: string) => Promise<void>
  handleDuplicate: (mealPlanId: string) => Promise<void>
}
