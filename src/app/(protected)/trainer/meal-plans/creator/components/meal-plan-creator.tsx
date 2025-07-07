'use client'

import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Label, Pie, PieChart } from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import {
  MealPlanProvider,
  useMealPlanContext,
} from '@/context/meal-plan-context/meal-plan-context'
import { useAutoSyncedInput } from '@/hooks/use-auto-synced-input'
import { useMealPlanDetailsMutation } from '@/hooks/use-meal-plan-details-mutation'
import { formatNumberInput } from '@/lib/format-tempo'
import { cn } from '@/lib/utils'

import { dayNames, getDayName } from '../../../trainings/creator/utils'

import MealTimeSlots from './meal-time-slots'

const macroCaloriesMultiplier = {
  protein: 4,
  carbs: 4,
  fat: 9,
}

const calculateMacroPercentage = (
  macro: number,
  calories: number,
  macroType: 'protein' | 'carbs' | 'fat',
) => {
  return (
    ((macro * macroCaloriesMultiplier[macroType]) / calories) *
    100
  ).toFixed(0)
}

const convertToGrams = (quantity: number, unit: string): number => {
  const unitLower = unit.toLowerCase()

  const conversions: Record<string, number> = {
    g: 1,
    grams: 1,
    gram: 1,
    kg: 1000,
    kilogram: 1000,
    kilograms: 1000,
    oz: 28.35,
    ounce: 28.35,
    ounces: 28.35,
    lb: 453.59,
    pound: 453.59,
    pounds: 453.59,
    cup: 240,
    cups: 240,
    tbsp: 15,
    tablespoon: 15,
    tablespoons: 15,
    tsp: 5,
    teaspoon: 5,
    teaspoons: 5,
    ml: 1,
    milliliter: 1,
    milliliters: 1,
    l: 1000,
    liter: 1000,
    liters: 1000,
    piece: 100,
    pieces: 100,
    slice: 30,
    slices: 30,
  }

  const conversionFactor = conversions[unitLower] || 1
  return quantity * conversionFactor
}

const calculateFoodNutrition = (food: {
  caloriesPer100g?: number | null
  proteinPer100g?: number | null
  carbsPer100g?: number | null
  fatPer100g?: number | null
  fiberPer100g?: number | null
  quantity: number
  unit: string
}) => {
  const grams = convertToGrams(food.quantity, food.unit)
  const factor = grams / 100 // Convert from per 100g to actual grams

  return {
    calories: Math.round((food.caloriesPer100g || 0) * factor * 100) / 100,
    protein: Math.round((food.proteinPer100g || 0) * factor * 100) / 100,
    carbs: Math.round((food.carbsPer100g || 0) * factor * 100) / 100,
    fat: Math.round((food.fatPer100g || 0) * factor * 100) / 100,
    fiber: Math.round((food.fiberPer100g || 0) * factor * 100) / 100,
  }
}

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

  const selectedWeek = mealPlan?.weeks.at(0)

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
        const mealNutrition = meal.foods.reduce(
          (mealAcc, food) => {
            const foodNutrition = calculateFoodNutrition(food)

            return {
              kcal: mealAcc.kcal + foodNutrition.calories,
              protein: mealAcc.protein + foodNutrition.protein,
              carbs: mealAcc.carbs + foodNutrition.carbs,
              fat: mealAcc.fat + foodNutrition.fat,
              fiber: mealAcc.fiber + foodNutrition.fiber,
            }
          },
          { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        )

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

    return {
      protein: proteinPercentage,
      carbs: carbsPercentage,
      fat: fatPercentage,
      estimatedPercentageExceeded,
      hasExceededMacroLimits: estimatedPercentageExceeded > 0,
      isMacroLimitMet: estimatedPercentageExceeded === 0,
    }
  }, [
    mealPlan?.dailyCalories,
    mealPlan?.dailyProtein,
    mealPlan?.dailyCarbs,
    mealPlan?.dailyFat,
  ])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading meal plan...</div>
          <div className="text-muted-foreground">Please wait</div>
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
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-24 justify-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-medium">
                {totalNutrients.kcal.toFixed(0)} kcal
              </h2>
              <p className="text-sm text-green-500">
                {totalNutrients.protein.toFixed(0)}g protein
              </p>
              <p className="text-sm text-blue-500">
                {totalNutrients.carbs.toFixed(0)}g carbs
              </p>
              <p className="text-sm text-yellow-500">
                {totalNutrients.fat.toFixed(0)}g fat
              </p>
              <p className="text-sm text-muted-foreground">
                {totalNutrients.fiber.toFixed(0)}g fiber
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChartPieDonutText
                totalCalorie={totalNutrients.kcal || 0}
                totalProtein={totalNutrients.protein || 0}
                totalCarbs={totalNutrients.carbs || 0}
                totalFat={totalNutrients.fat || 0}
                totalFiber={totalNutrients.fiber || 0}
              />
            </div>
          </div>

          {/* Selected Day Meal Planning */}
          {selectedWeek?.days[selectedDay] && (
            <div className="space-y-4">
              <MealTimeSlots
                key={dayNames[selectedDay]}
                day={selectedWeek?.days[selectedDay]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MealPlanCreator() {
  const { mealPlanId } = useParams<{ mealPlanId: string }>()

  return (
    <MealPlanProvider mealPlanId={mealPlanId}>
      <MealPlanCreatorContent />
    </MealPlanProvider>
  )
}

const chartConfig = {
  kcal: {
    label: 'kcal',
  },
  protein: {
    label: 'Protein',
    color: 'var(--chart-2)',
  },
  carbs: {
    label: 'Carbs',
    color: 'var(--chart-1)',
  },
  fat: {
    label: 'Fat',
    color: 'var(--chart-3)',
  },
  fiber: {
    label: 'Fiber',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

function ChartPieDonutText({
  totalCalorie,
  totalProtein,
  totalCarbs,
  totalFat,
  totalFiber,
}: {
  totalCalorie: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
}) {
  const chartData = [
    {
      macro: 'protein',
      value: Number(totalProtein?.toFixed(0)) || 1,
      fill: 'var(--color-chart-2)',
    },
    {
      macro: 'carbs',
      value: Number(totalCarbs?.toFixed(0)) || 1,
      fill: 'var(--color-chart-1)',
    },
    {
      macro: 'fat',
      value: Number(totalFat?.toFixed(0)) || 1,
      fill: 'var(--color-chart-3)',
    },
    {
      macro: 'fiber',
      value: Number(totalFiber?.toFixed(0)) || 1,
      fill: 'var(--color-chart-4)',
    },
  ]
  return (
    <CardContent className="flex-1 pb-0">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square min-w-[250px] max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="macro"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalCalorie?.toFixed(0)}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        kcal
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </CardContent>
  )
}
