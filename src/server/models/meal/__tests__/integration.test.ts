import { beforeEach, describe, expect, it } from 'vitest'

import { GQLUserRole } from '@/generated/graphql-client'
import {
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  Team as PrismaTeam,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import Meal, { MealIngredient } from '../model'

describe('Meal Integration Tests', () => {
  let mockContext: GQLContext
  let mockUser: PrismaUser
  let mockTeam: PrismaTeam
  let mockIngredient1: PrismaIngredient & { createdBy: PrismaUser }
  let mockIngredient2: PrismaIngredient & { createdBy: PrismaUser }

  beforeEach(() => {
    mockUser = {
      id: 'user-1',
      email: 'trainer@example.com',
      name: 'Test Trainer',
      role: GQLUserRole.Trainer,
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
      trainerId: null,
      featured: false,
      capacity: null,
      stripeCustomerId: null,
      stripeConnectedAccountId: null,
      googleId: null,
      googleAccessToken: null,
      googleRefreshToken: null,
      locale: null,
      timezone: null,
      appleId: null,
    }

    mockTeam = {
      id: 'team-1',
      name: 'Test Team',
      stripeConnectedAccountId: null,
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      platformFeePercent: 0,
    }

    mockIngredient1 = {
      id: 'ingredient-1',
      name: 'Chicken Breast',
      proteinPer100g: 25.0,
      carbsPer100g: 0.0,
      fatPer100g: 3.0,
      caloriesPer100g: 130.0,
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: mockUser,
    }

    mockIngredient2 = {
      id: 'ingredient-2',
      name: 'Brown Rice',
      proteinPer100g: 2.5,
      carbsPer100g: 45.0,
      fatPer100g: 1.0,
      caloriesPer100g: 200.0,
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: mockUser,
    }

    mockContext = {
      user: {
        user: mockUser,
      },
    } as GQLContext
  })

  describe('Meal Model Integration', () => {
    it('should create meal with ingredients and calculate total macros', () => {
      const mockMealData: PrismaMeal & {
        createdBy: PrismaUser
        team: PrismaTeam | null
        ingredients: (PrismaMealIngredient & {
          ingredient: PrismaIngredient & {
            createdBy: PrismaUser
          }
        })[]
      } = {
        id: 'meal-1',
        name: 'Protein Bowl',
        description: 'High protein meal',
        instructions: ['Cook chicken', 'Cook rice', 'Mix together'],
        preparationTime: 15,
        cookingTime: 30,
        servings: 2,
        createdById: 'user-1',
        teamId: 'team-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
        createdBy: mockUser,
        team: mockTeam,
        ingredients: [
          {
            id: 'meal-ingredient-1',
            mealId: 'meal-1',
            ingredientId: 'ingredient-1',
            grams: 150, // 150g chicken
            orderIndex: 0,
            createdAt: new Date(),
            ingredient: mockIngredient1,
          },
          {
            id: 'meal-ingredient-2',
            mealId: 'meal-1',
            ingredientId: 'ingredient-2',
            grams: 100, // 100g rice
            orderIndex: 1,
            createdAt: new Date(),
            ingredient: mockIngredient2,
          },
        ],
      }

      const meal = new Meal(mockMealData, mockContext)

      // Test basic properties
      expect(meal.id).toBe('meal-1')
      expect(meal.name).toBe('Protein Bowl')
      expect(meal.description).toBe('High protein meal')
      expect(meal.instructions).toEqual([
        'Cook chicken',
        'Cook rice',
        'Mix together',
      ])
      expect(meal.preparationTime).toBe(15)
      expect(meal.cookingTime).toBe(30)
      expect(meal.servings).toBe(2)

      // Test relationships
      expect(meal.createdBy?.id).toBe('user-1')
      expect(meal.team?.id).toBe('team-1')
      expect(meal.ingredients).toHaveLength(2)

      // Test macro calculations
      const totalMacros = meal.totalMacros
      // Chicken (150g): protein=37.5, carbs=0, fat=4.5, calories=195
      // Rice (100g): protein=2.5, carbs=45, fat=1, calories=200
      // Total: protein=40, carbs=45, fat=5.5, calories=395

      expect(totalMacros.protein).toBe(40)
      expect(totalMacros.carbs).toBe(45)
      expect(totalMacros.fat).toBe(5.5)
      expect(totalMacros.calories).toBe(395)
    })

    it('should calculate macros with portion multiplier', () => {
      const mockMealData: PrismaMeal & {
        createdBy: PrismaUser
        team: PrismaTeam | null
        ingredients: (PrismaMealIngredient & {
          ingredient: PrismaIngredient & {
            createdBy: PrismaUser
          }
        })[]
      } = {
        id: 'meal-1',
        name: 'Simple Meal',
        description: null,
        instructions: [],
        preparationTime: null,
        cookingTime: null,
        servings: null,
        createdById: 'user-1',
        teamId: 'team-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
        createdBy: mockUser,
        team: mockTeam,
        ingredients: [
          {
            id: 'meal-ingredient-1',
            mealId: 'meal-1',
            ingredientId: 'ingredient-1',
            grams: 100, // 100g chicken
            orderIndex: 0,
            createdAt: new Date(),
            ingredient: mockIngredient1,
          },
        ],
      }

      const meal = new Meal(mockMealData, mockContext)

      // Test 1.5x portion
      const macrosWithPortion = meal.calculateMacrosWithPortion(1.5)

      // Base: protein=25, carbs=0, fat=3, calories=130
      // 1.5x: protein=37.5, carbs=0, fat=4.5, calories=195

      expect(macrosWithPortion.protein).toBe(37.5)
      expect(macrosWithPortion.carbs).toBe(0)
      expect(macrosWithPortion.fat).toBe(4.5)
      expect(macrosWithPortion.calories).toBe(195)
    })

    it('should handle empty ingredients list', () => {
      const mockMealData: PrismaMeal & {
        createdBy: PrismaUser
        team: PrismaTeam | null
        ingredients: (PrismaMealIngredient & {
          ingredient: PrismaIngredient & {
            createdBy: PrismaUser
          }
        })[]
      } = {
        id: 'meal-1',
        name: 'Empty Meal',
        description: null,
        instructions: [],
        preparationTime: null,
        cookingTime: null,
        servings: null,
        createdById: 'user-1',
        teamId: 'team-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
        createdBy: mockUser,
        team: mockTeam,
        ingredients: [],
      }

      const meal = new Meal(mockMealData, mockContext)
      const totalMacros = meal.totalMacros

      expect(totalMacros.protein).toBe(0)
      expect(totalMacros.carbs).toBe(0)
      expect(totalMacros.fat).toBe(0)
      expect(totalMacros.calories).toBe(0)
    })
  })

  describe('MealIngredient Model Integration', () => {
    it('should calculate macros correctly for different amounts', () => {
      const mockMealIngredientData: PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      } = {
        id: 'meal-ingredient-1',
        mealId: 'meal-1',
        ingredientId: 'ingredient-1',
        grams: 200, // 200g
        orderIndex: 0,
        createdAt: new Date(),
        ingredient: mockIngredient1,
      }

      const mealIngredient = new MealIngredient(
        mockMealIngredientData,
        mockContext,
      )

      // Test basic properties
      expect(mealIngredient.id).toBe('meal-ingredient-1')
      expect(mealIngredient.grams).toBe(200)
      expect(mealIngredient.order).toBe(0)
      expect(mealIngredient.ingredient.id).toBe('ingredient-1')

      // Test macro calculations for 200g
      const macros = mealIngredient.macros
      // Chicken: protein=25, carbs=0, fat=3, calories=130 per 100g
      // 200g: protein=50, carbs=0, fat=6, calories=260

      expect(macros.protein).toBe(50)
      expect(macros.carbs).toBe(0)
      expect(macros.fat).toBe(6)
      expect(macros.calories).toBe(260)
    })

    it('should handle fractional amounts', () => {
      const mockMealIngredientData: PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      } = {
        id: 'meal-ingredient-1',
        mealId: 'meal-1',
        ingredientId: 'ingredient-2',
        grams: 75, // 75g (0.75 of 100g)
        orderIndex: 0,
        createdAt: new Date(),
        ingredient: mockIngredient2,
      }

      const mealIngredient = new MealIngredient(
        mockMealIngredientData,
        mockContext,
      )

      const macros = mealIngredient.macros
      // Rice: protein=2.5, carbs=45, fat=1, calories=200 per 100g
      // 75g: protein=1.875, carbs=33.75, fat=0.75, calories=150

      expect(macros.protein).toBe(1.875)
      expect(macros.carbs).toBe(33.75)
      expect(macros.fat).toBe(0.75)
      expect(macros.calories).toBe(150)
    })
  })

  describe('Complex Meal Scenarios', () => {
    it('should handle meal with multiple ingredients and complex calculations', () => {
      const mockMealData: PrismaMeal & {
        createdBy: PrismaUser
        team: PrismaTeam | null
        ingredients: (PrismaMealIngredient & {
          ingredient: PrismaIngredient & {
            createdBy: PrismaUser
          }
        })[]
      } = {
        id: 'meal-1',
        name: 'Complex Meal',
        description: 'Multi-ingredient meal',
        instructions: ['Step 1', 'Step 2', 'Step 3'],
        preparationTime: 20,
        cookingTime: 45,
        servings: 4,
        createdById: 'user-1',
        teamId: 'team-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
        createdBy: mockUser,
        team: mockTeam,
        ingredients: [
          {
            id: 'meal-ingredient-1',
            mealId: 'meal-1',
            ingredientId: 'ingredient-1',
            grams: 250, // 250g chicken
            orderIndex: 0,
            createdAt: new Date(),
            ingredient: mockIngredient1,
          },
          {
            id: 'meal-ingredient-2',
            mealId: 'meal-1',
            ingredientId: 'ingredient-2',
            grams: 150, // 150g rice
            orderIndex: 1,
            createdAt: new Date(),
            ingredient: mockIngredient2,
          },
        ],
      }

      const meal = new Meal(mockMealData, mockContext)

      // Test ingredient order
      const ingredients = meal.ingredients
      expect(ingredients).toHaveLength(2)
      expect(ingredients[0].order).toBe(0)
      expect(ingredients[1].order).toBe(1)
      expect(ingredients[0].ingredient.name).toBe('Chicken Breast')
      expect(ingredients[1].ingredient.name).toBe('Brown Rice')

      // Test total macros
      const totalMacros = meal.totalMacros
      // Chicken (250g): protein=62.5, carbs=0, fat=7.5, calories=325
      // Rice (150g): protein=3.75, carbs=67.5, fat=1.5, calories=300
      // Total: protein=66.25, carbs=67.5, fat=9, calories=625

      expect(totalMacros.protein).toBe(66.25)
      expect(totalMacros.carbs).toBe(67.5)
      expect(totalMacros.fat).toBe(9)
      expect(totalMacros.calories).toBe(625)

      // Test portion calculations
      const halfPortion = meal.calculateMacrosWithPortion(0.5)
      expect(halfPortion.protein).toBe(33.125)
      expect(halfPortion.carbs).toBe(33.75)
      expect(halfPortion.fat).toBe(4.5)
      expect(halfPortion.calories).toBe(312.5)

      const doublePortion = meal.calculateMacrosWithPortion(2)
      expect(doublePortion.protein).toBe(132.5)
      expect(doublePortion.carbs).toBe(135)
      expect(doublePortion.fat).toBe(18)
      expect(doublePortion.calories).toBe(1250)
    })

    it('should handle meal with null optional fields', () => {
      const mockMealData: PrismaMeal & {
        createdBy: PrismaUser
        team: PrismaTeam | null
        ingredients: (PrismaMealIngredient & {
          ingredient: PrismaIngredient & {
            createdBy: PrismaUser
          }
        })[]
      } = {
        id: 'meal-1',
        name: 'Minimal Meal',
        description: null,
        instructions: [],
        preparationTime: null,
        cookingTime: null,
        servings: null,
        createdById: 'user-1',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false,
        createdBy: mockUser,
        team: null,
        ingredients: [],
      }

      const meal = new Meal(mockMealData, mockContext)

      expect(meal.name).toBe('Minimal Meal')
      expect(meal.description).toBeNull()
      expect(meal.instructions).toEqual([])
      expect(meal.preparationTime).toBeNull()
      expect(meal.cookingTime).toBeNull()
      expect(meal.servings).toBeNull()
      expect(meal.team).toBeNull()
      expect(meal.ingredients).toEqual([])
    })
  })
})
