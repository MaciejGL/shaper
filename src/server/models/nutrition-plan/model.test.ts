import { describe, expect, it } from 'vitest'

import { GQLContext } from '@/types/gql-context'

import { NutritionPlanMeal } from './model'

describe('NutritionPlanMeal.adjustedMacros', () => {
  const mockContext = {} as GQLContext

  const mockMeal = {
    ingredients: [
      {
        id: 'ingredient1',
        grams: 100,
        ingredient: {
          caloriesPer100g: 200,
          proteinPer100g: 20,
          carbsPer100g: 30,
          fatPer100g: 5,
        },
      },
      {
        id: 'ingredient2',
        grams: 50,
        ingredient: {
          caloriesPer100g: 400,
          proteinPer100g: 10,
          carbsPer100g: 60,
          fatPer100g: 15,
        },
      },
    ],
  }

  it('should calculate macros with no overrides (uses blueprint grams)', () => {
    const planMeal = new NutritionPlanMeal(
      {
        id: 'meal1',
        orderIndex: 0,
        createdAt: new Date(),
        meal: mockMeal,
        ingredientOverrides: [],
      },
      mockContext,
    )

    const macros = planMeal.adjustedMacros

    // ingredient1: 100g = 200cal, 20p, 30c, 5f
    // ingredient2: 50g = 200cal, 5p, 30c, 7.5f
    expect(macros).toEqual({
      calories: 400, // 200 + 200
      protein: 25, // 20 + 5
      carbs: 60, // 30 + 30
      fat: 12.5, // 5 + 7.5 (rounded to 13)
    })
  })

  it('should calculate macros with ingredient overrides', () => {
    const planMeal = new NutritionPlanMeal(
      {
        id: 'meal1',
        orderIndex: 0,
        createdAt: new Date(),
        meal: mockMeal,
        ingredientOverrides: [
          {
            id: 'override1',
            mealIngredientId: 'ingredient1',
            grams: 150, // Override: 150g instead of 100g
            createdAt: new Date(),
          },
        ],
      },
      mockContext,
    )

    const macros = planMeal.adjustedMacros

    // ingredient1: 150g = 300cal, 30p, 45c, 7.5f (overridden)
    // ingredient2: 50g = 200cal, 5p, 30c, 7.5f (blueprint)
    expect(macros).toEqual({
      calories: 500, // 300 + 200
      protein: 35, // 30 + 5
      carbs: 75, // 45 + 30
      fat: 15, // 7.5 + 7.5
    })
  })

  it('should handle partial overrides (some ingredients overridden, some not)', () => {
    const planMeal = new NutritionPlanMeal(
      {
        id: 'meal1',
        orderIndex: 0,
        createdAt: new Date(),
        meal: mockMeal,
        ingredientOverrides: [
          {
            id: 'override1',
            mealIngredientId: 'ingredient2',
            grams: 25, // Override ingredient2: 25g instead of 50g
            createdAt: new Date(),
          },
        ],
      },
      mockContext,
    )

    const macros = planMeal.adjustedMacros

    // ingredient1: 100g = 200cal, 20p, 30c, 5f (blueprint)
    // ingredient2: 25g = 100cal, 2.5p, 15c, 3.75f (overridden)
    expect(macros).toEqual({
      calories: 300, // 200 + 100
      protein: 22.5, // 20 + 2.5
      carbs: 45, // 30 + 15
      fat: 8.75, // 5 + 3.75 (rounded to 8.8)
    })
  })

  it('should handle empty ingredients array', () => {
    const planMeal = new NutritionPlanMeal(
      {
        id: 'meal1',
        orderIndex: 0,
        createdAt: new Date(),
        meal: { ingredients: [] },
        ingredientOverrides: [],
      },
      mockContext,
    )

    const macros = planMeal.adjustedMacros

    expect(macros).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    })
  })

  it('should ignore overrides for non-existent ingredients', () => {
    const planMeal = new NutritionPlanMeal(
      {
        id: 'meal1',
        orderIndex: 0,
        createdAt: new Date(),
        meal: mockMeal,
        ingredientOverrides: [
          {
            id: 'override1',
            mealIngredientId: 'non-existent',
            grams: 200,
            createdAt: new Date(),
          },
        ],
      },
      mockContext,
    )

    const macros = planMeal.adjustedMacros

    // Should use blueprint values since override doesn't match any ingredient
    expect(macros).toEqual({
      calories: 400,
      protein: 25,
      carbs: 60,
      fat: 12.5,
    })
  })
})
