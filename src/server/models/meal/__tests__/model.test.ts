import { beforeEach, describe, expect, it } from 'vitest'

import {
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  Team as PrismaTeam,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import Meal, { MealIngredient } from '../model'

import { createdByMock } from './macro-calculations.test'

describe('Meal Model', () => {
  let mockContext: GQLContext
  let mockMealData: PrismaMeal & {
    createdBy: PrismaUser
    team: PrismaTeam | null
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    })[]
  }

  beforeEach(() => {
    mockContext = {
      user: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          role: 'TRAINER',
        },
      },
    } as GQLContext

    mockMealData = {
      id: 'meal-1',
      name: 'Test Meal',
      description: 'A test meal',
      instructions: ['Step 1', 'Step 2'],
      preparationTime: 15,
      cookingTime: 30,
      servings: 4,
      createdById: 'user-1',
      teamId: 'team-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: createdByMock,
      team: {
        id: 'team-1',
        name: 'Test Team',
        stripeConnectedAccountId: null,
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ingredients: [
        {
          id: 'meal-ingredient-1',
          mealId: 'meal-1',
          ingredientId: 'ingredient-1',
          grams: 200,
          orderIndex: 0,
          createdAt: new Date(),
          ingredient: {
            id: 'ingredient-1',
            name: 'Chicken Breast',
            proteinPer100g: 25.0,
            carbsPer100g: 0.0,
            fatPer100g: 3.0,
            caloriesPer100g: 130.0,
            createdById: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: createdByMock,
          },
        },
        {
          id: 'meal-ingredient-2',
          mealId: 'meal-1',
          ingredientId: 'ingredient-2',
          grams: 100,
          orderIndex: 1,
          createdAt: new Date(),
          ingredient: {
            id: 'ingredient-2',
            name: 'Brown Rice',
            proteinPer100g: 2.5,
            carbsPer100g: 45.0,
            fatPer100g: 1.0,
            caloriesPer100g: 200.0,
            createdById: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: createdByMock,
          },
        },
      ],
    }
  })

  describe('Basic Properties', () => {
    it('should return correct basic properties', () => {
      const meal = new Meal(mockMealData, mockContext)

      expect(meal.id).toBe('meal-1')
      expect(meal.name).toBe('Test Meal')
      expect(meal.description).toBe('A test meal')
      expect(meal.instructions).toEqual(['Step 1', 'Step 2'])
      expect(meal.preparationTime).toBe(15)
      expect(meal.cookingTime).toBe(30)
      expect(meal.servings).toBe(4)
      expect(meal.createdAt).toBe('2024-01-01T00:00:00.000Z')
      expect(meal.updatedAt).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should handle null optional properties', () => {
      const mealWithNulls = {
        ...mockMealData,
        description: null,
        preparationTime: null,
        cookingTime: null,
        servings: null,
      }

      const meal = new Meal(mealWithNulls, mockContext)

      expect(meal.description).toBeNull()
      expect(meal.preparationTime).toBeNull()
      expect(meal.cookingTime).toBeNull()
      expect(meal.servings).toBeNull()
    })
  })

  describe('Relationships', () => {
    it('should return createdBy user', () => {
      const meal = new Meal(mockMealData, mockContext)
      const createdBy = meal.createdBy

      expect(createdBy).toBeDefined()
      expect(createdBy?.id).toBe('user-1')
    })

    it('should return team', () => {
      const meal = new Meal(mockMealData, mockContext)
      const team = meal.team

      expect(team).toBeDefined()
      expect(team?.id).toBe('team-1')
      expect(team?.name).toBe('Test Team')
    })

    it('should handle null team', () => {
      const mealWithoutTeam = {
        ...mockMealData,
        team: null,
      }

      const meal = new Meal(mealWithoutTeam, mockContext)
      expect(meal.team).toBeNull()
    })

    it('should return ingredients in correct order', () => {
      const meal = new Meal(mockMealData, mockContext)
      const ingredients = meal.ingredients

      expect(ingredients).toHaveLength(2)
      expect(ingredients[0].id).toBe('meal-ingredient-1')
      expect(ingredients[1].id).toBe('meal-ingredient-2')
    })
  })

  describe('Macro Calculations', () => {
    it('should calculate total macros correctly', () => {
      const meal = new Meal(mockMealData, mockContext)
      const totalMacros = meal.totalMacros

      // Chicken Breast (200g): protein=50, carbs=0, fat=6, calories=260
      // Brown Rice (100g): protein=2.5, carbs=45, fat=1, calories=200
      // Total: protein=52.5, carbs=45, fat=7, calories=460

      expect(totalMacros.protein).toBe(52.5)
      expect(totalMacros.carbs).toBe(45)
      expect(totalMacros.fat).toBe(7)
      expect(totalMacros.calories).toBe(460)
    })

    it('should calculate macros with portion multiplier', () => {
      const meal = new Meal(mockMealData, mockContext)
      const macrosWithPortion = meal.calculateMacrosWithPortion(2.0)

      // Double the base macros
      expect(macrosWithPortion.protein).toBe(105) // 52.5 * 2
      expect(macrosWithPortion.carbs).toBe(90) // 45 * 2
      expect(macrosWithPortion.fat).toBe(14) // 7 * 2
      expect(macrosWithPortion.calories).toBe(920) // 460 * 2
    })

    it('should handle empty ingredients list', () => {
      const mealWithoutIngredients = {
        ...mockMealData,
        ingredients: [],
      }

      const meal = new Meal(mealWithoutIngredients, mockContext)
      const totalMacros = meal.totalMacros

      expect(totalMacros.protein).toBe(0)
      expect(totalMacros.carbs).toBe(0)
      expect(totalMacros.fat).toBe(0)
      expect(totalMacros.calories).toBe(0)
    })
  })
})

describe('MealIngredient Model', () => {
  let mockContext: GQLContext
  let mockMealIngredientData: PrismaMealIngredient & {
    ingredient: PrismaIngredient & {
      createdBy: PrismaUser
    }
  }

  beforeEach(() => {
    mockContext = {
      user: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          role: 'TRAINER',
        },
      },
    } as GQLContext

    mockMealIngredientData = {
      id: 'meal-ingredient-1',
      mealId: 'meal-1',
      ingredientId: 'ingredient-1',
      grams: 150,
      orderIndex: 0,
      createdAt: new Date('2024-01-01'),
      ingredient: {
        id: 'ingredient-1',
        name: 'Salmon Fillet',
        proteinPer100g: 20.0,
        carbsPer100g: 0.0,
        fatPer100g: 8.0,
        caloriesPer100g: 150.0,
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: createdByMock,
      },
    }
  })

  describe('Basic Properties', () => {
    it('should return correct basic properties', () => {
      const mealIngredient = new MealIngredient(
        mockMealIngredientData,
        mockContext,
      )

      expect(mealIngredient.id).toBe('meal-ingredient-1')
      expect(mealIngredient.grams).toBe(150)
      expect(mealIngredient.order).toBe(0)
      expect(mealIngredient.createdAt).toBe('2024-01-01T00:00:00.000Z')
    })
  })

  describe('Macro Calculations', () => {
    it('should calculate macros for ingredient amount correctly', () => {
      const mealIngredient = new MealIngredient(
        mockMealIngredientData,
        mockContext,
      )
      const macros = mealIngredient.macros

      // Salmon Fillet (150g):
      // protein = 20 * 1.5 = 30
      // carbs = 0 * 1.5 = 0
      // fat = 8 * 1.5 = 12
      // calories = 150 * 1.5 = 225

      expect(macros.protein).toBe(30)
      expect(macros.carbs).toBe(0)
      expect(macros.fat).toBe(12)
      expect(macros.calories).toBe(225)
    })

    it('should handle fractional amounts correctly', () => {
      const fractionalData = {
        ...mockMealIngredientData,
        grams: 75, // 0.75 of 100g
      }

      const mealIngredient = new MealIngredient(fractionalData, mockContext)
      const macros = mealIngredient.macros

      expect(macros.protein).toBe(15) // 20 * 0.75
      expect(macros.carbs).toBe(0)
      expect(macros.fat).toBe(6) // 8 * 0.75
      expect(macros.calories).toBe(112.5) // 150 * 0.75
    })
  })

  describe('Relationships', () => {
    it('should return ingredient', () => {
      const mealIngredient = new MealIngredient(
        mockMealIngredientData,
        mockContext,
      )
      const ingredient = mealIngredient.ingredient

      expect(ingredient).toBeDefined()
      expect(ingredient.id).toBe('ingredient-1')
      expect(ingredient.name).toBe('Salmon Fillet')
    })
  })
})
