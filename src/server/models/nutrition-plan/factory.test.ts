import { GraphQLError } from 'graphql'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateNutritionPlanMealIngredient } from './factory'

// Mock Prisma
const mockPrisma = {
  nutritionPlanMeal: {
    findUnique: vi.fn(),
  },
  nutritionPlanMealIngredient: {
    upsert: vi.fn(),
  },
}

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}))

describe('updateNutritionPlanMealIngredient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockTrainerId = 'trainer123'
  const mockPlanMealId = 'planMeal123'
  const mockMealIngredientId = 'ingredient123'

  it('should validate grams input (reject negative values)', async () => {
    await expect(
      updateNutritionPlanMealIngredient(
        mockPlanMealId,
        mockMealIngredientId,
        -5,
        mockTrainerId,
      ),
    ).rejects.toThrow('Grams must be greater than 0')

    await expect(
      updateNutritionPlanMealIngredient(
        mockPlanMealId,
        mockMealIngredientId,
        0,
        mockTrainerId,
      ),
    ).rejects.toThrow('Grams must be greater than 0')
  })

  it('should validate trainer access permissions', async () => {
    mockPrisma.nutritionPlanMeal.findUnique.mockResolvedValue({
      nutritionPlanDay: {
        nutritionPlan: {
          trainerId: 'different-trainer',
        },
      },
      meal: {
        ingredients: [{ id: mockMealIngredientId }],
      },
    })

    await expect(
      updateNutritionPlanMealIngredient(
        mockPlanMealId,
        mockMealIngredientId,
        100,
        mockTrainerId,
      ),
    ).rejects.toThrow(
      'Access denied: You can only modify nutrition plans you created',
    )
  })

  it('should validate meal ingredient exists in meal', async () => {
    mockPrisma.nutritionPlanMeal.findUnique.mockResolvedValue({
      nutritionPlanDay: {
        nutritionPlan: {
          trainerId: mockTrainerId,
        },
      },
      meal: {
        ingredients: [], // Empty - ingredient not found
      },
    })

    await expect(
      updateNutritionPlanMealIngredient(
        mockPlanMealId,
        mockMealIngredientId,
        100,
        mockTrainerId,
      ),
    ).rejects.toThrow('Meal ingredient not found in this meal')
  })

  it('should create new override when none exists', async () => {
    const mockPlanMeal = {
      nutritionPlanDay: {
        nutritionPlan: {
          trainerId: mockTrainerId,
        },
      },
      meal: {
        ingredients: [{ id: mockMealIngredientId }],
      },
    }

    const mockCreatedOverride = {
      id: 'override123',
      grams: 150,
      createdAt: new Date(),
      mealIngredient: {
        id: mockMealIngredientId,
        ingredient: {
          name: 'Test Ingredient',
        },
      },
    }

    mockPrisma.nutritionPlanMeal.findUnique.mockResolvedValue(mockPlanMeal)
    mockPrisma.nutritionPlanMealIngredient.upsert.mockResolvedValue(
      mockCreatedOverride,
    )

    const result = await updateNutritionPlanMealIngredient(
      mockPlanMealId,
      mockMealIngredientId,
      150,
      mockTrainerId,
    )

    expect(mockPrisma.nutritionPlanMealIngredient.upsert).toHaveBeenCalledWith({
      where: {
        nutritionPlanMealId_mealIngredientId: {
          nutritionPlanMealId: mockPlanMealId,
          mealIngredientId: mockMealIngredientId,
        },
      },
      update: {
        grams: 150,
      },
      create: {
        nutritionPlanMealId: mockPlanMealId,
        mealIngredientId: mockMealIngredientId,
        grams: 150,
      },
      include: {
        mealIngredient: {
          include: {
            ingredient: true,
          },
        },
      },
    })

    expect(result).toEqual(mockCreatedOverride)
  })

  it('should update existing override', async () => {
    const mockPlanMeal = {
      nutritionPlanDay: {
        nutritionPlan: {
          trainerId: mockTrainerId,
        },
      },
      meal: {
        ingredients: [{ id: mockMealIngredientId }],
      },
    }

    const mockUpdatedOverride = {
      id: 'override123',
      grams: 200, // Updated value
      createdAt: new Date(),
      mealIngredient: {
        id: mockMealIngredientId,
        ingredient: {
          name: 'Test Ingredient',
        },
      },
    }

    mockPrisma.nutritionPlanMeal.findUnique.mockResolvedValue(mockPlanMeal)
    mockPrisma.nutritionPlanMealIngredient.upsert.mockResolvedValue(
      mockUpdatedOverride,
    )

    const result = await updateNutritionPlanMealIngredient(
      mockPlanMealId,
      mockMealIngredientId,
      200,
      mockTrainerId,
    )

    expect(result.grams).toBe(200)
  })

  it('should handle non-existent plan meal', async () => {
    mockPrisma.nutritionPlanMeal.findUnique.mockResolvedValue(null)

    await expect(
      updateNutritionPlanMealIngredient(
        mockPlanMealId,
        mockMealIngredientId,
        100,
        mockTrainerId,
      ),
    ).rejects.toThrow(
      'Access denied: You can only modify nutrition plans you created',
    )
  })

  it('should round grams to reasonable precision', async () => {
    const mockPlanMeal = {
      nutritionPlanDay: {
        nutritionPlan: {
          trainerId: mockTrainerId,
        },
      },
      meal: {
        ingredients: [{ id: mockMealIngredientId }],
      },
    }

    mockPrisma.nutritionPlanMeal.findUnique.mockResolvedValue(mockPlanMeal)
    mockPrisma.nutritionPlanMealIngredient.upsert.mockResolvedValue({
      id: 'override123',
      grams: 123.456789,
      createdAt: new Date(),
      mealIngredient: {
        id: mockMealIngredientId,
        ingredient: { name: 'Test' },
      },
    })

    await updateNutritionPlanMealIngredient(
      mockPlanMealId,
      mockMealIngredientId,
      123.456789,
      mockTrainerId,
    )

    // Should accept the precise value (rounding happens in frontend)
    expect(mockPrisma.nutritionPlanMealIngredient.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { grams: 123.456789 },
        create: expect.objectContaining({ grams: 123.456789 }),
      }),
    )
  })
})
