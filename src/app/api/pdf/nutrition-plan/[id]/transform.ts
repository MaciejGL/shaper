import type { NutritionPlanPDFData } from '@/app/(protected)/fitspace/nutrition/components/pdf/types'
import type {
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  NutritionPlan as PrismaNutritionPlan,
  NutritionPlanDay as PrismaNutritionPlanDay,
  NutritionPlanMeal as PrismaNutritionPlanMeal,
  NutritionPlanMealIngredient as PrismaNutritionPlanMealIngredient,
  User as PrismaUser,
} from '@/generated/prisma/client'

type PrismaNutritionPlanFull = PrismaNutritionPlan & {
  trainer: PrismaUser
  client: PrismaUser
  days: (PrismaNutritionPlanDay & {
    meals: (PrismaNutritionPlanMeal & {
      meal: PrismaMeal & {
        ingredients: (PrismaMealIngredient & {
          ingredient: PrismaIngredient
        })[]
        createdBy: PrismaUser
      }
      ingredientOverrides?: (PrismaNutritionPlanMealIngredient & {
        mealIngredient: PrismaMealIngredient & {
          ingredient: PrismaIngredient
        }
      })[]
    })[]
  })[]
}

interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

function calculateMealMacrosWithOverrides(
  mealIngredients: (PrismaMealIngredient & { ingredient: PrismaIngredient })[],
  overrides: PrismaNutritionPlanMealIngredient[],
): MacroTotals {
  const overrideMap = new Map(
    overrides.map((override) => [override.mealIngredientId, override.grams]),
  )

  return mealIngredients.reduce(
    (totals, mealIngredient) => {
      const grams = overrideMap.get(mealIngredient.id) ?? mealIngredient.grams
      const multiplier = grams / 100

      return {
        protein:
          totals.protein +
          mealIngredient.ingredient.proteinPer100g * multiplier,
        carbs:
          totals.carbs + mealIngredient.ingredient.carbsPer100g * multiplier,
        fat: totals.fat + mealIngredient.ingredient.fatPer100g * multiplier,
        calories:
          totals.calories +
          mealIngredient.ingredient.caloriesPer100g * multiplier,
      }
    },
    { protein: 0, carbs: 0, fat: 0, calories: 0 },
  )
}

function calculateDailyMacros(
  meals: PrismaNutritionPlanFull['days'][number]['meals'],
): MacroTotals {
  return meals.reduce(
    (totals, planMeal) => {
      const adjustedMacros = calculateMealMacrosWithOverrides(
        planMeal.meal.ingredients,
        planMeal.ingredientOverrides || [],
      )

      return {
        protein: totals.protein + adjustedMacros.protein,
        carbs: totals.carbs + adjustedMacros.carbs,
        fat: totals.fat + adjustedMacros.fat,
        calories: totals.calories + adjustedMacros.calories,
      }
    },
    { protein: 0, carbs: 0, fat: 0, calories: 0 },
  )
}

export function transformPrismaToNutritionPlanPDFData(
  nutritionPlan: PrismaNutritionPlanFull,
): NutritionPlanPDFData {
  return {
    id: nutritionPlan.id,
    name: nutritionPlan.name,
    description: nutritionPlan.description,
    trainer: nutritionPlan.trainer
      ? {
          id: nutritionPlan.trainer.id,
          firstName: nutritionPlan.trainer.name?.split(' ')[0] || '',
          lastName:
            nutritionPlan.trainer.name?.split(' ').slice(1).join(' ') || '',
        }
      : null,
    days: nutritionPlan.days.map((day) => ({
      id: day.id,
      dayNumber: day.dayNumber,
      name: day.name,
      dailyMacros: calculateDailyMacros(day.meals),
      meals: day.meals.map((planMeal) => ({
        id: planMeal.id,
        orderIndex: planMeal.orderIndex,
        adjustedMacros: calculateMealMacrosWithOverrides(
          planMeal.meal.ingredients,
          planMeal.ingredientOverrides || [],
        ),
        ingredientOverrides: (planMeal.ingredientOverrides || []).map(
          (override) => ({
            id: override.id,
            grams: override.grams,
            createdAt: override.createdAt.toISOString(),
            mealIngredient: {
              id: override.mealIngredient.id,
              grams: override.mealIngredient.grams,
              order: override.mealIngredient.orderIndex,
              ingredient: {
                id: override.mealIngredient.ingredient.id,
                name: override.mealIngredient.ingredient.name,
                proteinPer100g:
                  override.mealIngredient.ingredient.proteinPer100g,
                carbsPer100g: override.mealIngredient.ingredient.carbsPer100g,
                fatPer100g: override.mealIngredient.ingredient.fatPer100g,
                caloriesPer100g:
                  override.mealIngredient.ingredient.caloriesPer100g,
              },
            },
          }),
        ),
        meal: {
          id: planMeal.meal.id,
          name: planMeal.meal.name,
          description: planMeal.meal.description,
          instructions: planMeal.meal.instructions,
          preparationTime: planMeal.meal.preparationTime,
          cookingTime: planMeal.meal.cookingTime,
          servings: planMeal.meal.servings,
          totalMacros: calculateMealMacrosWithOverrides(
            planMeal.meal.ingredients,
            [],
          ),
          ingredients: planMeal.meal.ingredients.map((ing) => ({
            id: ing.id,
            grams: ing.grams,
            order: ing.orderIndex,
            macros: {
              calories: ing.ingredient.caloriesPer100g * (ing.grams / 100),
              protein: ing.ingredient.proteinPer100g * (ing.grams / 100),
              carbs: ing.ingredient.carbsPer100g * (ing.grams / 100),
              fat: ing.ingredient.fatPer100g * (ing.grams / 100),
            },
            ingredient: {
              id: ing.ingredient.id,
              name: ing.ingredient.name,
              proteinPer100g: ing.ingredient.proteinPer100g,
              carbsPer100g: ing.ingredient.carbsPer100g,
              fatPer100g: ing.ingredient.fatPer100g,
              caloriesPer100g: ing.ingredient.caloriesPer100g,
            },
          })),
        },
      })),
    })),
  }
}
