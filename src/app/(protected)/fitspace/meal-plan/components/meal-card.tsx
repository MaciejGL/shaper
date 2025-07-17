import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckSquare2Icon,
  Edit3Icon,
  FlameIcon,
  PlusIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'

import { FoodItem } from './food-item'
import { useMealLogging } from './use-meal-logging'

// Animated wrapper for food items
function AnimatedFoodItem({
  children,
  id,
  isFirstRender,
}: {
  children: React.ReactNode
  id: string
  isFirstRender: boolean
}) {
  return (
    <motion.div
      key={id}
      initial={
        isFirstRender
          ? false
          : {
              opacity: 0,
              scale: 0.8,
              height: 0,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
        height: 'auto',
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        height: 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 25,
        duration: 0.25,
      }}
      className="overflow-hidden w-full"
    >
      {children}
    </motion.div>
  )
}

export interface MealCardProps {
  meal: {
    id: string
    name: string
    dateTime: string
    instructions?: string | null
    completedAt?: string | null
    foods: {
      id: string
      name: string
      quantity: number
      unit: string
      addedAt: string
      totalCalories: number
      totalProtein: number
      totalCarbs: number
      totalFat: number
      isCustomAddition: boolean
      addedBy?: {
        id: string
        firstName?: string | null
        lastName?: string | null
      } | null
      log?: {
        id: string
        quantity: number
        loggedQuantity: number
        unit: string
        loggedAt: string
        notes?: string | null
        calories?: number | null
        protein?: number | null
        carbs?: number | null
        fat?: number | null
        fiber?: number | null
        mealFood: {
          id: string
          name: string
        }
        user: {
          id: string
          firstName?: string | null
          lastName?: string | null
        }
      } | null
    }[]
    plannedCalories: number
    plannedProtein: number
    plannedCarbs: number
    plannedFat: number
  }
  onClick?: () => void
  onAddCustomFood?: () => void
  isDefaultPlan?: boolean
}

// Helper function to calculate logged totals from foods array
function calculateLoggedTotals(foods: MealCardProps['meal']['foods']) {
  let calories = 0
  let protein = 0
  let carbs = 0
  let fat = 0

  foods.forEach((food) => {
    const log = food.log

    calories += log?.calories || food.totalCalories
    protein += log?.protein || food.totalProtein
    carbs += log?.carbs || food.totalCarbs
    fat += log?.fat || food.totalFat
  })

  return {
    calories: Math.round(calories * 100) / 100,
    protein: Math.round(protein * 100) / 100,
    carbs: Math.round(carbs * 100) / 100,
    fat: Math.round(fat * 100) / 100,
  }
}

export function MealCard({
  meal,
  onClick,
  onAddCustomFood,
  isDefaultPlan,
}: MealCardProps) {
  const {
    handleRemoveLogItem,
    handleCompleteMeal,
    handleUncompleteMeal,
    isCompletingMeal,
    isUncompletingMeal,
  } = useMealLogging()
  const [removingFoodIds, setRemovingFoodIds] = useState<Set<string>>(new Set())
  const [optimisticCompletedState, setOptimisticCompletedState] = useState<
    boolean | null
  >(null)
  const isFirstRender = useRef(true)

  // Clear optimistic state when actual data matches our optimistic expectation
  useEffect(() => {
    if (
      optimisticCompletedState !== null &&
      Boolean(meal.completedAt) === optimisticCompletedState
    ) {
      setOptimisticCompletedState(null)
    }
  }, [meal.completedAt, optimisticCompletedState])

  // Set isFirstRender to false after the first render
  useEffect(() => {
    isFirstRender.current = false
  }, [])

  // Use optimistic state if available, otherwise use actual state
  const isCompleted =
    optimisticCompletedState !== null
      ? optimisticCompletedState
      : Boolean(meal.completedAt)
  const isCompletionLoading = isCompletingMeal || isUncompletingMeal

  const handleCompletionToggle = async () => {
    const newCompletedState = !isCompleted

    // Optimistically update the UI
    setOptimisticCompletedState(newCompletedState)

    try {
      if (newCompletedState) {
        await handleCompleteMeal(meal.id)
      } else {
        await handleUncompleteMeal(meal.id)
      }
      // Don't clear optimistic state here - let useEffect handle it when actual data arrives
    } catch (error) {
      // Error - revert optimistic state
      setOptimisticCompletedState(null)
      console.error('Error toggling meal completion:', error)
    }
  }

  const loggedTotals = calculateLoggedTotals(meal.foods)
  const hasFoods = meal.foods.length > 0

  return (
    <div className="grid grid-cols-[1fr_50px] gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 justify-between mb-1">
          <MealTotals
            plannedTotals={{
              calories: meal.plannedCalories,
              protein: meal.plannedProtein,
              carbs: meal.plannedCarbs,
              fat: meal.plannedFat,
            }}
            loggedTotals={loggedTotals}
            hasLogs={
              isDefaultPlan
                ? true
                : meal.foods.some((food) => food.log) ||
                  Boolean(meal.completedAt)
            }
          />
          <div className="flex gap-2">
            {hasFoods && (
              <Button
                variant="ghost"
                size="icon-xs"
                iconOnly={<Edit3Icon />}
                onClick={() => onClick?.()}
              />
            )}
            {!isDefaultPlan && (
              <Button
                variant="ghost"
                size="icon-xs"
                iconOnly={
                  isCompleted ? (
                    <CheckSquare2Icon className="text-green-600" />
                  ) : (
                    <SquareIcon />
                  )
                }
                onClick={handleCompletionToggle}
                disabled={isCompletionLoading}
                loading={isCompletionLoading}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <AnimatePresence>
            {meal.foods.map((food) => (
              <AnimatedFoodItem
                key={food.id}
                id={food.id}
                isFirstRender={isFirstRender.current}
              >
                <FoodItem food={food} onClick={() => onClick?.()} />
              </AnimatedFoodItem>
            ))}
          </AnimatePresence>

          {isDefaultPlan && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onAddCustomFood?.()
              }}
              iconOnly={<PlusIcon />}
              className="grow h-[56px] !bg-card"
            />
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <Badge variant="outline" className="rounded-full font-mono mb-2">
          {format(new Date(meal.dateTime), 'HH:mm')}
        </Badge>
        <AnimatePresence>
          {meal.foods.map((food) => (
            <AnimatedFoodItem
              key={food.id}
              id={food.id}
              isFirstRender={isFirstRender.current}
            >
              <div className="flex items-center justify-center h-[56px] mb-2">
                {food.isCustomAddition && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    iconOnly={<XIcon />}
                    loading={removingFoodIds.has(food.id)}
                    onClick={async () => {
                      try {
                        setRemovingFoodIds(
                          (prev) => new Set([...prev, food.id]),
                        )
                        await handleRemoveLogItem(food.id)
                      } catch (error) {
                        console.error(error)
                      } finally {
                        setRemovingFoodIds((prev) => {
                          const newSet = new Set(prev)
                          newSet.delete(food.id)
                          return newSet
                        })
                      }
                    }}
                  />
                )}
              </div>
            </AnimatedFoodItem>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function MealTotals({
  loggedTotals,
  plannedTotals,
  hasLogs,
}: {
  loggedTotals?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  plannedTotals?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  hasLogs?: boolean
}) {
  const totalsToShow = hasLogs ? loggedTotals : plannedTotals

  return (
    <div className="flex gap-2">
      <p className="text-sm font-medium flex items-center text-primary">
        {formatNumber(Math.round(totalsToShow?.calories ?? 0))}
        <FlameIcon className="size-3 text-orange-500" />
      </p>
      <p className="text-sm font-medium text-green-600">
        {formatNumber(Math.round(totalsToShow?.protein ?? 0))}P
      </p>
      <p className="text-sm font-medium text-blue-600">
        {formatNumber(Math.round(totalsToShow?.carbs ?? 0))}C
      </p>
      <p className="text-sm font-medium text-yellow-600">
        {formatNumber(Math.round(totalsToShow?.fat ?? 0))}F
      </p>
    </div>
  )
}
