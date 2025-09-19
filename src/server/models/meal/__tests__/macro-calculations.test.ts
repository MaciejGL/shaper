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

describe('Macro Calculations', () => {
  let mockContext: GQLContext

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
  })

  describe('MealIngredient Macro Calculations', () => {
    it('should calculate macros correctly for 100g ingredient', () => {
      const mockIngredientData: PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      } = {
        id: 'meal-ingredient-1',
        mealId: 'meal-1',
        ingredientId: 'ingredient-1',
        grams: 100,
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
          createdBy: {
            id: 'user-1',
            email: 'creator@example.com',
            name: 'Creator User',
            role: 'TRAINER',
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
          },
        },
      }

      const mealIngredient = new MealIngredient(mockIngredientData, mockContext)
      const macros = mealIngredient.macros

      expect(macros.protein).toBe(25.0)
      expect(macros.carbs).toBe(0.0)
      expect(macros.fat).toBe(3.0)
      expect(macros.calories).toBe(130.0)
    })

    it('should calculate macros correctly for 200g ingredient', () => {
      const mockIngredientData: PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      } = {
        id: 'meal-ingredient-1',
        mealId: 'meal-1',
        ingredientId: 'ingredient-1',
        grams: 200,
        orderIndex: 0,
        createdAt: new Date(),
        ingredient: {
          id: 'ingredient-1',
          name: 'Brown Rice',
          proteinPer100g: 2.5,
          carbsPer100g: 45.0,
          fatPer100g: 1.0,
          caloriesPer100g: 200.0,
          createdById: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: 'user-1',
            email: 'creator@example.com',
            name: 'Creator User',
            role: 'TRAINER',
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
          },
        },
      }

      const mealIngredient = new MealIngredient(mockIngredientData, mockContext)
      const macros = mealIngredient.macros

      // 200g = 2x the base values
      expect(macros.protein).toBe(5.0) // 2.5 * 2
      expect(macros.carbs).toBe(90.0) // 45 * 2
      expect(macros.fat).toBe(2.0) // 1 * 2
      expect(macros.calories).toBe(400.0) // 200 * 2
    })

    it('should calculate macros correctly for fractional amounts', () => {
      const mockIngredientData: PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      } = {
        id: 'meal-ingredient-1',
        mealId: 'meal-1',
        ingredientId: 'ingredient-1',
        grams: 50,
        orderIndex: 0,
        createdAt: new Date(),
        ingredient: {
          id: 'ingredient-1',
          name: 'Almonds',
          proteinPer100g: 20.0,
          carbsPer100g: 10.0,
          fatPer100g: 50.0,
          caloriesPer100g: 600.0,
          createdById: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: 'user-1',
            email: 'creator@example.com',
            name: 'Creator User',
            role: 'TRAINER',
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
          },
        },
      }

      const mealIngredient = new MealIngredient(mockIngredientData, mockContext)
      const macros = mealIngredient.macros

      // 50g = 0.5x the base values
      expect(macros.protein).toBe(10.0) // 20 * 0.5
      expect(macros.carbs).toBe(5.0) // 10 * 0.5
      expect(macros.fat).toBe(25.0) // 50 * 0.5
      expect(macros.calories).toBe(300.0) // 600 * 0.5
    })
  })

  describe('Meal Total Macro Calculations', () => {
    it('should calculate total macros for meal with multiple ingredients', () => {
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
        instructions: ['Mix ingredients'],
        preparationTime: 10,
        cookingTime: 0,
        servings: 1,
        createdById: 'user-1',
        teamId: 'team-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user-1',
          email: 'creator@example.com',
          name: 'Creator User',
          role: 'TRAINER',
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
        },
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
            grams: 150, // 150g chicken
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
              createdBy: {
                id: 'user-1',
                email: 'creator@example.com',
                name: 'Creator User',
                role: 'TRAINER',
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
              },
            },
          },
          {
            id: 'meal-ingredient-2',
            mealId: 'meal-1',
            ingredientId: 'ingredient-2',
            grams: 80, // 80g rice
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
              createdBy: {
                id: 'user-1',
                email: 'creator@example.com',
                name: 'Creator User',
                role: 'TRAINER',
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
              },
            },
          },
        ],
      }

      const meal = new Meal(mockMealData, mockContext)
      const totalMacros = meal.totalMacros

      // Chicken (150g): protein=37.5, carbs=0, fat=4.5, calories=195
      // Rice (80g): protein=2, carbs=36, fat=0.8, calories=160
      // Total: protein=39.5, carbs=36, fat=5.3, calories=355

      expect(totalMacros.protein).toBe(39.5)
      expect(totalMacros.carbs).toBe(36)
      expect(totalMacros.fat).toBe(5.3)
      expect(totalMacros.calories).toBe(355)
    })

    it('should return zero macros for meal with no ingredients', () => {
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
        description: 'No ingredients',
        instructions: [],
        preparationTime: null,
        cookingTime: null,
        servings: null,
        createdById: 'user-1',
        teamId: 'team-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user-1',
          email: 'creator@example.com',
          name: 'Creator User',
          role: 'TRAINER',
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
        },
        team: {
          id: 'team-1',
          name: 'Test Team',
          stripeConnectedAccountId: null,
          stripeCustomerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
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

  describe('Meal Portion Multiplier Calculations', () => {
    it('should calculate macros with portion multiplier correctly', () => {
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
        name: 'Test Meal',
        description: 'Test meal',
        instructions: [],
        preparationTime: null,
        cookingTime: null,
        servings: null,
        createdById: 'user-1',
        teamId: 'team-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user-1',
          email: 'creator@example.com',
          name: 'Creator User',
          role: 'TRAINER',
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
        },
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
            grams: 100,
            orderIndex: 0,
            createdAt: new Date(),
            ingredient: {
              id: 'ingredient-1',
              name: 'Test Ingredient',
              proteinPer100g: 20.0,
              carbsPer100g: 30.0,
              fatPer100g: 10.0,
              caloriesPer100g: 280.0,
              createdById: 'user-1',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: {
                id: 'user-1',
                email: 'creator@example.com',
                name: 'Creator User',
                role: 'TRAINER',
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
              },
            },
          },
        ],
      }

      const meal = new Meal(mockMealData, mockContext)

      // Test with 1.5x portion
      const macrosWithPortion = meal.calculateMacrosWithPortion(1.5)

      expect(macrosWithPortion.protein).toBe(30.0) // 20 * 1.5
      expect(macrosWithPortion.carbs).toBe(45.0) // 30 * 1.5
      expect(macrosWithPortion.fat).toBe(15.0) // 10 * 1.5
      expect(macrosWithPortion.calories).toBe(420.0) // 280 * 1.5
    })

    it('should handle zero portion multiplier', () => {
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
        name: 'Test Meal',
        description: 'Test meal',
        instructions: [],
        preparationTime: null,
        cookingTime: null,
        servings: null,
        createdById: 'user-1',
        teamId: 'team-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user-1',
          email: 'creator@example.com',
          name: 'Creator User',
          role: 'TRAINER',
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
        },
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
            grams: 100,
            orderIndex: 0,
            createdAt: new Date(),
            ingredient: {
              id: 'ingredient-1',
              name: 'Test Ingredient',
              proteinPer100g: 20.0,
              carbsPer100g: 30.0,
              fatPer100g: 10.0,
              caloriesPer100g: 280.0,
              createdById: 'user-1',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: {
                id: 'user-1',
                email: 'creator@example.com',
                name: 'Creator User',
                role: 'TRAINER',
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
              },
            },
          },
        ],
      }

      const meal = new Meal(mockMealData, mockContext)

      // Test with 0x portion (should be all zeros)
      const macrosWithPortion = meal.calculateMacrosWithPortion(0)

      expect(macrosWithPortion.protein).toBe(0)
      expect(macrosWithPortion.carbs).toBe(0)
      expect(macrosWithPortion.fat).toBe(0)
      expect(macrosWithPortion.calories).toBe(0)
    })
  })
})
