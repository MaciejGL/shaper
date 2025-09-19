import { describe, expect, it } from 'vitest'

import { GQLContext } from '@/types/gql-context'

import Ingredient from '../model'

// Mock context for testing
const mockContext = {} as GQLContext

describe('Ingredient Model', () => {
  describe('calculateMacrosForAmount', () => {
    it('should calculate macros correctly for 100g', () => {
      const ingredientData = {
        id: '1',
        name: 'Chicken Breast',
        proteinPer100g: 23,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        caloriesPer100g: 165,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const ingredient = new Ingredient(ingredientData, mockContext)
      const macros = ingredient.calculateMacrosForAmount(100)

      expect(macros.protein).toBe(23)
      expect(macros.carbs).toBe(0)
      expect(macros.fat).toBe(3.6)
      expect(macros.calories).toBe(165)
    })

    it('should calculate macros correctly for 200g', () => {
      const ingredientData = {
        id: '1',
        name: 'Chicken Breast',
        proteinPer100g: 23,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        caloriesPer100g: 165,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const ingredient = new Ingredient(ingredientData, mockContext)
      const macros = ingredient.calculateMacrosForAmount(200)

      expect(macros.protein).toBe(46)
      expect(macros.carbs).toBe(0)
      expect(macros.fat).toBe(7.2)
      expect(macros.calories).toBe(330)
    })

    it('should calculate macros correctly for 50g', () => {
      const ingredientData = {
        id: '1',
        name: 'Chicken Breast',
        proteinPer100g: 23,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        caloriesPer100g: 165,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const ingredient = new Ingredient(ingredientData, mockContext)
      const macros = ingredient.calculateMacrosForAmount(50)

      expect(macros.protein).toBe(11.5)
      expect(macros.carbs).toBe(0)
      expect(macros.fat).toBe(1.8)
      expect(macros.calories).toBe(82.5)
    })

    it('should handle zero amount', () => {
      const ingredientData = {
        id: '1',
        name: 'Chicken Breast',
        proteinPer100g: 23,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        caloriesPer100g: 165,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const ingredient = new Ingredient(ingredientData, mockContext)
      const macros = ingredient.calculateMacrosForAmount(0)

      expect(macros.protein).toBe(0)
      expect(macros.carbs).toBe(0)
      expect(macros.fat).toBe(0)
      expect(macros.calories).toBe(0)
    })

    it('should handle decimal amounts', () => {
      const ingredientData = {
        id: '1',
        name: 'Olive Oil',
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 100,
        caloriesPer100g: 900,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const ingredient = new Ingredient(ingredientData, mockContext)
      const macros = ingredient.calculateMacrosForAmount(15.5)

      expect(macros.protein).toBe(0)
      expect(macros.carbs).toBe(0)
      expect(macros.fat).toBe(15.5)
      expect(macros.calories).toBe(139.5)
    })

    it('should handle ingredients with all macros', () => {
      const ingredientData = {
        id: '1',
        name: 'Oats',
        proteinPer100g: 16.9,
        carbsPer100g: 66.3,
        fatPer100g: 6.9,
        caloriesPer100g: 389,
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const ingredient = new Ingredient(ingredientData, mockContext)
      const macros = ingredient.calculateMacrosForAmount(40)

      expect(macros.protein).toBeCloseTo(6.76)
      expect(macros.carbs).toBeCloseTo(26.52)
      expect(macros.fat).toBeCloseTo(2.76)
      expect(macros.calories).toBeCloseTo(155.6)
    })
  })

  describe('getters', () => {
    it('should return correct property values', () => {
      const now = new Date()
      const ingredientData = {
        id: 'test-id',
        name: 'Test Ingredient',
        proteinPer100g: 20,
        carbsPer100g: 30,
        fatPer100g: 10,
        caloriesPer100g: 280,
        createdById: 'user1',
        createdAt: now,
        updatedAt: now,
      }

      const ingredient = new Ingredient(ingredientData, mockContext)

      expect(ingredient.id).toBe('test-id')
      expect(ingredient.name).toBe('Test Ingredient')
      expect(ingredient.proteinPer100g).toBe(20)
      expect(ingredient.carbsPer100g).toBe(30)
      expect(ingredient.fatPer100g).toBe(10)
      expect(ingredient.caloriesPer100g).toBe(280)
      expect(ingredient.createdAt).toBe(now.toISOString())
      expect(ingredient.updatedAt).toBe(now.toISOString())
    })
  })
})
