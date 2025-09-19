import { describe, expect, it } from 'vitest'

import { GQLContext } from '@/types/gql-context'

import Ingredient from '../model'

// Mock GQLContext type for testing
type MockGQLContext = {
  user?: {
    user: {
      id: string
      email: string
    }
  }
}

// Mock context for testing
const mockContext = {
  user: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  },
} as MockGQLContext

describe('Ingredient Integration', () => {
  describe('GraphQL Schema Integration', () => {
    it('should create Ingredient model instances correctly', () => {
      const ingredientData = {
        id: 'test-id',
        name: 'Test Ingredient',
        proteinPer100g: 20,
        carbsPer100g: 30,
        fatPer100g: 10,
        caloriesPer100g: 280,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const ingredient = new Ingredient(
        ingredientData,
        mockContext as GQLContext,
      )

      expect(ingredient.id).toBe('test-id')
      expect(ingredient.name).toBe('Test Ingredient')
      expect(ingredient.proteinPer100g).toBe(20)
      expect(ingredient.carbsPer100g).toBe(30)
      expect(ingredient.fatPer100g).toBe(10)
      expect(ingredient.caloriesPer100g).toBe(280)
    })
  })

  describe('Macro Calculation Integration', () => {
    it('should calculate macros correctly for different amounts', () => {
      const ingredientData = {
        id: 'test-id',
        name: 'Oats',
        proteinPer100g: 16.9,
        carbsPer100g: 66.3,
        fatPer100g: 6.9,
        caloriesPer100g: 389,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const ingredient = new Ingredient(
        ingredientData,
        mockContext as GQLContext,
      )

      // Test 50g portion
      const macros50g = ingredient.calculateMacrosForAmount(50)
      expect(macros50g.protein).toBeCloseTo(8.45)
      expect(macros50g.carbs).toBeCloseTo(33.15)
      expect(macros50g.fat).toBeCloseTo(3.45)
      expect(macros50g.calories).toBeCloseTo(194.5)

      // Test 150g portion
      const macros150g = ingredient.calculateMacrosForAmount(150)
      expect(macros150g.protein).toBeCloseTo(25.35)
      expect(macros150g.carbs).toBeCloseTo(99.45)
      expect(macros150g.fat).toBeCloseTo(10.35)
      expect(macros150g.calories).toBeCloseTo(583.5)
    })
  })
})
