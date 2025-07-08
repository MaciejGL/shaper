'use client'

import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MealPlanProvider,
  useMealPlanContext,
} from '@/context/meal-plan-context/meal-plan-context'
import { useAutoSyncedInput } from '@/hooks/use-auto-synced-input'
import { useMealPlanDetailsMutation } from '@/hooks/use-meal-plan-details-mutation'
import { formatNumberInput } from '@/lib/format-tempo'
import { cn } from '@/lib/utils'

import { getDayName } from '../../../trainings/creator/utils'

import { ChartPieDonutText } from './chart-pie-donut-text'
import { MealTimeSlots } from './meal-time-slots'
import {
  calculateFoodNutrition,
  calculateMacroPercentage,
  getMealNutrients,
} from './utils'

function MealPlanCreatorContent() {
  const [selectedDay, setSelectedDay] = useState(0)
  const { mealPlan, isLoading } = useMealPlanContext()

  // Initialize debounced mutation for updating meal plan details
  const { updateDetails } = useMealPlanDetailsMutation(mealPlan?.id || '')

  // Call hooks unconditionally
  const titleInput = useAutoSyncedInput(
    mealPlan?.title || '',
    (value) => updateDetails({ title: value }),
    500, // 500ms debounce for title
  )

  const dailyCaloriesInput = useAutoSyncedInput(
    mealPlan?.dailyCalories || '',
    (value) => updateDetails({ dailyCalories: Number(value) }),
    500, // 500ms debounce for dailyCalories
  )

  const dailyCarbsInput = useAutoSyncedInput(
    mealPlan?.dailyCarbs || '',
    (value) => updateDetails({ dailyCarbs: Number(value) }),
    500, // 500ms debounce for dailyCarbs
  )

  const dailyFatInput = useAutoSyncedInput(
    mealPlan?.dailyFat || '',
    (value) => updateDetails({ dailyFat: Number(value) }),
    500, // 500ms debounce for dailyFat
  )

  const dailyProteinInput = useAutoSyncedInput(
    mealPlan?.dailyProtein || '',
    (value) => updateDetails({ dailyProtein: Number(value) }),
    500, // 500ms debounce for dailyProtein
  )

  const selectedWeek = useMemo(() => mealPlan?.weeks.at(0), [mealPlan?.weeks])

  const totalNutrients: {
    kcal: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  } = useMemo(() => {
    if (!selectedWeek?.days[selectedDay]) {
      return {
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      }
    }

    const dayNutrition = selectedWeek.days[selectedDay].meals.reduce(
      (dayAcc, meal) => {
        const mealNutrition = getMealNutrients(meal.foods)

        return {
          kcal: dayAcc.kcal + mealNutrition.kcal,
          protein: dayAcc.protein + mealNutrition.protein,
          carbs: dayAcc.carbs + mealNutrition.carbs,
          fat: dayAcc.fat + mealNutrition.fat,
          fiber: dayAcc.fiber + mealNutrition.fiber,
        }
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )

    // Round final totals
    return {
      kcal: Math.round(dayNutrition.kcal * 100) / 100,
      protein: Math.round(dayNutrition.protein * 100) / 100,
      carbs: Math.round(dayNutrition.carbs * 100) / 100,
      fat: Math.round(dayNutrition.fat * 100) / 100,
      fiber: Math.round(dayNutrition.fiber * 100) / 100,
    }
  }, [selectedWeek, selectedDay])

  const macroPercentage = useMemo(() => {
    const proteinPercentage = calculateMacroPercentage(
      mealPlan?.dailyProtein || 0,
      mealPlan?.dailyCalories || 0,
      'protein',
    )
    const carbsPercentage = calculateMacroPercentage(
      mealPlan?.dailyCarbs || 0,
      mealPlan?.dailyCalories || 0,
      'carbs',
    )
    const fatPercentage = calculateMacroPercentage(
      mealPlan?.dailyFat || 0,
      mealPlan?.dailyCalories || 0,
      'fat',
    )

    const estimatedPercentageExceeded =
      Number(proteinPercentage) +
      Number(carbsPercentage) +
      Number(fatPercentage) -
      100

    const caloriesExceeded = mealPlan?.dailyCalories
      ? totalNutrients.kcal - mealPlan?.dailyCalories
      : 0
    const proteinExceeded = mealPlan?.dailyProtein
      ? totalNutrients.protein - mealPlan?.dailyProtein
      : 0
    const carbsExceeded = mealPlan?.dailyCarbs
      ? totalNutrients.carbs - mealPlan?.dailyCarbs
      : 0
    const fatExceeded = mealPlan?.dailyFat
      ? totalNutrients.fat - mealPlan?.dailyFat
      : 0

    return {
      protein: proteinPercentage,
      carbs: carbsPercentage,
      fat: fatPercentage,
      estimatedPercentageExceeded,
      hasExceededMacroLimits: estimatedPercentageExceeded > 0,
      isMacroLimitMet: estimatedPercentageExceeded === 0,
      caloriesExceeded,
      proteinExceeded,
      carbsExceeded,
      fatExceeded,
    }
  }, [
    mealPlan?.dailyCalories,
    mealPlan?.dailyProtein,
    mealPlan?.dailyCarbs,
    mealPlan?.dailyFat,
    totalNutrients.kcal,
    totalNutrients.protein,
    totalNutrients.carbs,
    totalNutrients.fat,
  ])

  const selectedDayMeals = useMemo(
    () => selectedWeek?.days[selectedDay],
    [selectedWeek?.days, selectedDay],
  )

  const eachDayNutrients = useMemo(() => {
    if (!selectedWeek) return []

    return selectedWeek.days.map((day) => {
      const dayCalories = day.meals.reduce((dayAcc, meal) => {
        const mealCalories = meal.foods.reduce((mealAcc, food) => {
          const foodNutrition = calculateFoodNutrition(food)
          return mealAcc + foodNutrition.calories
        }, 0)
        return dayAcc + mealCalories
      }, 0)

      return Math.round(dayCalories * 100) / 100
    })
  }, [selectedWeek])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium animate-pulse">
            Loading meal plan...
          </div>
          <div className="text-muted-foreground animate-pulse">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 rounded-lg sticky -top-4 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Meal Plan Creator
              </h1>
              {mealPlan?.title && (
                <p className="text-muted-foreground mt-1">{mealPlan.title}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                {mealPlan?.dailyCalories} cal
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {mealPlan?.dailyProtein}g protein
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_3fr] container max-w-[900px] gap-4 mx-auto pt-6">
        <Input
          label="Title"
          type="text"
          id="title"
          placeholder="Title"
          variant="secondary"
          value={titleInput.value}
          onChange={(e) => titleInput.onChange(e.target.value)}
          onFocus={titleInput.onFocus}
          onBlur={titleInput.onBlur}
        />

        <div className="flex gap-2">
          <Input
            label="Calories"
            type="text"
            id="targetCalories"
            variant="secondary"
            value={dailyCaloriesInput.value}
            onChange={(e) => {
              const formattedValue = Number(formatNumberInput(e))
              dailyCaloriesInput.onChange(formattedValue)
            }}
            onFocus={dailyCaloriesInput.onFocus}
            onBlur={dailyCaloriesInput.onBlur}
          />
          <Input
            label="Protein"
            type="text"
            id="dailyProtein"
            placeholder="Protein"
            variant="secondary"
            value={dailyProteinInput.value}
            onChange={(e) => {
              const formattedValue = Number(formatNumberInput(e))
              dailyProteinInput.onChange(formattedValue)
            }}
            onFocus={dailyProteinInput.onFocus}
            onBlur={dailyProteinInput.onBlur}
            iconEnd={
              <p
                className={cn(
                  'text-sm text-muted-foreground',
                  macroPercentage.hasExceededMacroLimits && 'text-destructive',
                  macroPercentage.isMacroLimitMet && 'text-green-500',
                )}
              >
                {macroPercentage.protein}%
              </p>
            }
          />
          <Input
            label="Carbs"
            type="text"
            id="dailyCarbs"
            placeholder="Carbs"
            variant="secondary"
            value={dailyCarbsInput.value}
            onChange={(e) => {
              const formattedValue = Number(formatNumberInput(e))
              dailyCarbsInput.onChange(formattedValue)
            }}
            onFocus={dailyCarbsInput.onFocus}
            onBlur={dailyCarbsInput.onBlur}
            iconEnd={
              <p
                className={cn(
                  'text-sm text-muted-foreground',
                  macroPercentage.hasExceededMacroLimits && 'text-destructive',
                  macroPercentage.isMacroLimitMet && 'text-green-500',
                )}
              >
                {macroPercentage.carbs}%
              </p>
            }
          />
          <Input
            label="Fat"
            type="text"
            id="dailyFat"
            placeholder="Fat"
            variant="secondary"
            value={dailyFatInput.value}
            onChange={(e) => {
              const formattedValue = Number(formatNumberInput(e))
              dailyFatInput.onChange(formattedValue)
            }}
            onFocus={dailyFatInput.onFocus}
            onBlur={dailyFatInput.onBlur}
            iconEnd={
              <p
                className={cn(
                  'text-sm text-muted-foreground',
                  macroPercentage.hasExceededMacroLimits && 'text-destructive',
                  macroPercentage.isMacroLimitMet && 'text-green-500',
                )}
              >
                {macroPercentage.fat}%
              </p>
            }
          />
        </div>
      </div>

      <div className="container max-w-[900px] mx-auto py-6">
        <div className="space-y-6">
          {/* Day Selector */}
          <div className="grid grid-cols-7 gap-2">
            {selectedWeek?.days.map((day, index) => (
              <Button
                key={index}
                variant={selectedDay === index ? 'default' : 'secondary'}
                className={`h-16 flex flex-col items-center justify-center transition-all duration-200 ${
                  selectedDay === index
                    ? 'shadow-md scale-102'
                    : 'hover:scale-102'
                }`}
                onClick={() => setSelectedDay(index)}
              >
                <span className="text-lg font-medium">
                  {getDayName(day.dayOfWeek, { short: true })}
                </span>
                <span
                  className={cn(
                    'text-md text-muted-foreground',
                    selectedDay === index && 'text-muted',
                    eachDayNutrients[index] > (mealPlan?.dailyCalories || 0) &&
                      'text-amber-500',
                  )}
                >
                  {eachDayNutrients[index].toFixed(0)} kcal
                </span>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-20 justify-center">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium">
                  {totalNutrients.kcal.toFixed(0)} kcal{' '}
                  {macroPercentage.caloriesExceeded > 0 && (
                    <span className="text-xs text-destructive/80">
                      ({macroPercentage.caloriesExceeded.toFixed(0)} kcal)
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-green-500 rounded-sm" />
                <p className="text-sm">
                  {totalNutrients.protein.toFixed(0)}g protein
                  {macroPercentage.proteinExceeded > 0 && (
                    <span className="text-xs text-destructive/80">
                      {' '}
                      ({macroPercentage.proteinExceeded}g)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-blue-500 rounded-sm" />
                <p className="text-sm">
                  {totalNutrients.carbs.toFixed(0)}g carbs
                  {macroPercentage.carbsExceeded > 0 && (
                    <span className="text-xs text-destructive/80">
                      {' '}
                      ({macroPercentage.carbsExceeded}g)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-yellow-500 rounded-sm" />
                <p className="text-sm">
                  {totalNutrients.fat.toFixed(0)}g fat
                  {macroPercentage.fatExceeded > 0 && (
                    <span className="text-xs text-destructive/80">
                      {' '}
                      ({macroPercentage.fatExceeded}g)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-violet-500 rounded-sm" />
                <p className="text-sm">
                  {totalNutrients.fiber.toFixed(0)}g fiber
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChartPieDonutText
                totalCalorie={totalNutrients.kcal ?? 0}
                totalProtein={totalNutrients.protein ?? 0}
                totalCarbs={totalNutrients.carbs ?? 0}
                totalFat={totalNutrients.fat ?? 0}
                totalFiber={totalNutrients.fiber ?? 0}
              />
            </div>
          </div>

          {/* Selected Day Meal Planning */}
          {selectedDayMeals && (
            <div className="space-y-4">
              <MealTimeSlots key={selectedDay} day={selectedDayMeals} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MealPlanCreator() {
  const { mealPlanId } = useParams<{ mealPlanId: string }>()

  return (
    <MealPlanProvider mealPlanId={mealPlanId}>
      <MealPlanCreatorContent />
    </MealPlanProvider>
  )
}
