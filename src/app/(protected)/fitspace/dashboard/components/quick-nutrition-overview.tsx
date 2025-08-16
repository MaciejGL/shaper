'use client'

import { ChevronRight, FlameIcon, Plus, Utensils } from 'lucide-react'
import { useMemo } from 'react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CircularProgress } from '@/components/ui/circular-progress'
import { Progress } from '@/components/ui/progress'
import { SectionIcon } from '@/components/ui/section-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  type GQLGetActiveMealPlanQuery,
  type GQLGetDefaultMealPlanQuery,
  useGetActiveMealPlanQuery,
  useGetDefaultMealPlanQuery,
} from '@/generated/graphql-client'
import { isMealPlanDayMatch } from '@/lib/date-utils'
import { getStartOfWeekUTC, toISOString } from '@/lib/utc-date-utils'
import { cn } from '@/lib/utils'

interface NutritionData {
  current: number
  target: number
  unit: string
  percentage: number
}

interface QuickNutritionData {
  calories: NutritionData
  protein: NutritionData
  carbs: NutritionData
  fat: NutritionData
  lastLoggedMeal?: {
    name: string
    time: string
  }
}

interface QuickNutritionOverviewProps {
  isLoading?: boolean
}

// Type for meals from either plan
type MealPlan =
  | NonNullable<GQLGetActiveMealPlanQuery['getActiveMealPlan']>
  | NonNullable<GQLGetDefaultMealPlanQuery['getDefaultMealPlan']>
type Meal = MealPlan['weeks'][0]['days'][0]['meals'][0]

// Helper function to calculate nutrition from combined meal plan data
function calculateNutritionFromMealPlans(
  activePlan: NonNullable<
    GQLGetActiveMealPlanQuery['getActiveMealPlan']
  > | null,
  defaultPlan: NonNullable<
    GQLGetDefaultMealPlanQuery['getDefaultMealPlan']
  > | null,
): QuickNutritionData | null {
  // Get today's date string for matching
  const today = new Date()
  const todayString = today.toISOString().split('T')[0] // YYYY-MM-DD format

  let combinedMeals: Meal[] = []

  // Add meals from active plan if available
  if (activePlan?.weeks?.length) {
    const activePlanDay = activePlan.weeks.at(0)?.days.find((planDay) => {
      return isMealPlanDayMatch(todayString, planDay.dayOfWeek)
    })
    if (activePlanDay?.meals) {
      combinedMeals = [...combinedMeals, ...activePlanDay.meals]
    }
  }

  // Add meals from default plan if available
  if (defaultPlan?.weeks?.length) {
    const defaultPlanDay = defaultPlan.weeks.at(0)?.days.find((planDay) => {
      return isMealPlanDayMatch(todayString, planDay.dayOfWeek)
    })
    if (defaultPlanDay?.meals) {
      combinedMeals = [...combinedMeals, ...defaultPlanDay.meals]
    }
  }

  if (!combinedMeals.length) return null

  // Calculate totals from logged foods across all combined meals
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let lastLoggedMeal: { name: string; time: string } | undefined

  for (const meal of combinedMeals) {
    if (meal.foods) {
      for (const food of meal.foods) {
        if (food.log) {
          // Use logged quantities
          totalCalories += food.log.calories || 0
          totalProtein += food.log.protein || 0
          totalCarbs += food.log.carbs || 0
          totalFat += food.log.fat || 0

          // Track most recent logged meal
          if (
            !lastLoggedMeal ||
            new Date(food.log.loggedAt) > new Date(lastLoggedMeal.time)
          ) {
            lastLoggedMeal = {
              name: `${meal.name} - ${food.name}`,
              time: new Date(food.log.loggedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          }
        }
      }
    }
  }

  // Get targets from plans (prefer active plan targets, fallback to default plan, then defaults)
  const targetCalories =
    activePlan?.dailyCalories || defaultPlan?.dailyCalories || 2200
  const targetProtein =
    activePlan?.dailyProtein || defaultPlan?.dailyProtein || 150
  const targetCarbs = activePlan?.dailyCarbs || defaultPlan?.dailyCarbs || 275
  const targetFat = activePlan?.dailyFat || defaultPlan?.dailyFat || 85

  return {
    calories: {
      current: Math.round(totalCalories),
      target: targetCalories,
      unit: 'kcal',
      percentage: Math.round((totalCalories / targetCalories) * 100),
    },
    protein: {
      current: Math.round(totalProtein),
      target: targetProtein,
      unit: 'g',
      percentage: Math.round((totalProtein / targetProtein) * 100),
    },
    carbs: {
      current: Math.round(totalCarbs),
      target: targetCarbs,
      unit: 'g',
      percentage: Math.round((totalCarbs / targetCarbs) * 100),
    },
    fat: {
      current: Math.round(totalFat),
      target: targetFat,
      unit: 'g',
      percentage: Math.round((totalFat / targetFat) * 100),
    },
    lastLoggedMeal,
  }
}

function MacroCircle({
  label,
  data,
  variant,
}: {
  label: string
  data: NutritionData
  variant: 'protein' | 'carbs' | 'fat'
}) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <CircularProgress
        value={data.percentage}
        variant={variant}
        size="lg"
        strokeWidth={4}
        label={`${data.current}${data.unit}`}
        sublabel={`${data.target}${data.unit}`}
      />
      <span className="text-xs font-medium text-center">{label}</span>
    </div>
  )
}

function EmptyNutrition() {
  return (
    <div className="text-center py-6 px-4">
      <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
        <Utensils className="h-6 w-6 text-muted-foreground/70" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        No meals logged today
      </p>
      <p className="text-xs text-muted-foreground/70 mb-4">
        Start tracking your nutrition to see your progress
      </p>
      <ButtonLink
        href="/fitspace/meal-plan"
        size="sm"
        variant="tertiary"
        iconStart={<Plus />}
      >
        Log First Meal
      </ButtonLink>
    </div>
  )
}

function NutritionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-2 w-full" />

      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  )
}

export function QuickNutritionOverview({
  isLoading,
}: QuickNutritionOverviewProps) {
  const { preferences } = useUserPreferences()

  // Calculate date parameter for the query
  const dateParam = useMemo(() => {
    const today = new Date()
    return toISOString(getStartOfWeekUTC(today, preferences.weekStartsOn))
  }, [preferences.weekStartsOn])

  // Fetch both active and default meal plans (like the main meal plan page)
  const {
    data: activePlanData,
    isLoading: isLoadingActive,
    error: activePlanError,
  } = useGetActiveMealPlanQuery(
    {
      date: dateParam,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  )

  const {
    data: defaultPlanData,
    isLoading: isLoadingDefault,
    error: defaultPlanError,
  } = useGetDefaultMealPlanQuery(
    {
      date: dateParam,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  )

  // Extract the plans
  const activePlan = activePlanData?.getActiveMealPlan
  const defaultPlan = defaultPlanData?.getDefaultMealPlan

  // Calculate nutrition data from both plans combined
  const nutritionData = useMemo(() => {
    return calculateNutritionFromMealPlans(
      activePlan ?? null,
      defaultPlan ?? null,
    )
  }, [activePlan, defaultPlan])

  const combinedLoading = isLoading || isLoadingActive || isLoadingDefault
  const hasError = activePlanError || defaultPlanError
  if (combinedLoading) {
    return (
      <Card variant="secondary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <SectionIcon icon={Utensils} variant="amber" />
            Nutrition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NutritionSkeleton />
        </CardContent>
      </Card>
    )
  }

  // Show empty state if no nutrition data or error
  if (hasError || !nutritionData || !nutritionData.calories.current) {
    return (
      <Card variant="secondary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <SectionIcon icon={Utensils} variant="amber" />
            Today's Nutrition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyNutrition />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="secondary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <SectionIcon icon={Utensils} variant="amber" />
          Today's Nutrition
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Calories */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center gap-1">
              <FlameIcon className="h-4 w-4 text-amber-600" /> Calories:{' '}
              {nutritionData.calories.current} / {nutritionData.calories.target}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                nutritionData.calories.percentage >= 90
                  ? 'text-green-600 dark:text-green-400'
                  : nutritionData.calories.percentage >= 70
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400',
              )}
            >
              {nutritionData.calories.percentage}%
            </span>
          </div>
          <Progress value={nutritionData.calories.percentage} className="h-3" />
        </div>

        {/* Macros - Circular Progress */}
        <div className="grid grid-cols-3 gap-4 py-2">
          <MacroCircle
            label="Protein"
            data={nutritionData.protein}
            variant="protein"
          />
          <MacroCircle
            label="Carbs"
            data={nutritionData.carbs}
            variant="carbs"
          />
          <MacroCircle label="Fat" data={nutritionData.fat} variant="fat" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <ButtonLink
            href="/fitspace/meal-plan"
            variant="tertiary"
            size="sm"
            iconStart={<Plus />}
          >
            Log Food
          </ButtonLink>
          <ButtonLink
            href="/fitspace/meal-plan"
            variant="tertiary"
            size="sm"
            className="flex-1"
            iconEnd={<ChevronRight />}
          >
            View Meal Plan
          </ButtonLink>
        </div>
      </CardContent>
    </Card>
  )
}
