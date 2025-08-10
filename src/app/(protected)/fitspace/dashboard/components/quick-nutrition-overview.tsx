'use client'

import { ChevronRight, FlameIcon, Plus, Utensils } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SectionIcon } from '@/components/ui/section-icon'
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
  nutritionData?: QuickNutritionData
  isLoading?: boolean
}

// Mock data - replace with real meal plan data
const mockNutritionData: QuickNutritionData = {
  calories: {
    current: 1847,
    target: 2200,
    unit: 'kcal',
    percentage: 84,
  },
  protein: {
    current: 120,
    target: 150,
    unit: 'g',
    percentage: 80,
  },
  carbs: {
    current: 180,
    target: 275,
    unit: 'g',
    percentage: 65,
  },
  fat: {
    current: 65,
    target: 85,
    unit: 'g',
    percentage: 76,
  },
  lastLoggedMeal: {
    name: 'Lunch - Chicken Bowl',
    time: '2 hours ago',
  },
}

function MacroBar({
  label,
  data,
  colorClass,
}: {
  label: string
  data: NutritionData
  colorClass: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 font-medium">{label}</span>
        <span className="text-muted-foreground">
          {data.current}
          {data.unit} / {data.target}
          {data.unit}
        </span>
      </div>
      <Progress value={data.percentage} className={cn('h-2', colorClass)} />
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
      <ButtonLink href="/fitspace/meal-plan" size="sm" variant="outline">
        <Plus className="h-4 w-4 mr-1" />
        Log First Meal
      </ButtonLink>
    </div>
  )
}

function NutritionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-muted rounded animate-pulse w-24" />
        <div className="h-4 bg-muted rounded animate-pulse w-20" />
      </div>
      <div className="h-2 bg-muted rounded animate-pulse" />

      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-muted rounded animate-pulse w-16" />
            <div className="h-4 bg-muted rounded animate-pulse w-20" />
          </div>
          <div className="h-2 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export function QuickNutritionOverview({
  nutritionData = mockNutritionData,
  isLoading,
}: QuickNutritionOverviewProps) {
  if (isLoading) {
    return (
      <Card variant="secondary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <SectionIcon icon={Utensils} variant="amber" />
            Today's Nutrition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NutritionSkeleton />
        </CardContent>
      </Card>
    )
  }

  // Show empty state if no nutrition data
  if (!nutritionData.calories.current) {
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

        {/* Macros */}
        <div className="space-y-3">
          <MacroBar
            label="Protein"
            data={nutritionData.protein}
            colorClass="text-blue-600"
          />
          <MacroBar
            label="Carbs"
            data={nutritionData.carbs}
            colorClass="text-orange-600"
          />
          <MacroBar
            label="Fat"
            data={nutritionData.fat}
            colorClass="text-green-600"
          />
        </div>

        {/* Last meal logged */}
        {nutritionData.lastLoggedMeal && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Last logged: {nutritionData.lastLoggedMeal.name} •{' '}
              {nutritionData.lastLoggedMeal.time}
            </p>
          </div>
        )}

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
