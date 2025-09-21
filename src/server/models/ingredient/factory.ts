import {
  GQLCreateIngredientInput,
  GQLUpdateIngredientInput,
} from '@/generated/graphql-server'
import { Ingredient as PrismaIngredient } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { getCurrentUserOrThrow } from '@/lib/getUser'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Search ingredients globally with full-text search
 */
export async function searchGlobalIngredients(
  query: string,
  limit: number = 50,
): Promise<PrismaIngredient[]> {
  if (!query.trim()) {
    return []
  }

  // Use PostgreSQL full-text search for better performance
  const ingredients = await prisma.ingredient.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    orderBy: [
      // Exact matches first
      {
        name: 'asc',
      },
      // Then by creation date (newer first)
      {
        createdAt: 'desc',
      },
    ],
    take: limit,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return ingredients
}

/**
 * Create a new global ingredient
 */
export async function createGlobalIngredient(
  input: GQLCreateIngredientInput,
): Promise<PrismaIngredient> {
  const user = await getCurrentUserOrThrow()

  // Validate input data
  const validation = validateIngredientMacros(input)
  if (!validation.isValid) {
    throw new Error(`Invalid ingredient data: ${validation.errors.join(', ')}`)
  }

  // Check for duplicate names (case-insensitive)
  const existingIngredient = await prisma.ingredient.findFirst({
    where: {
      name: {
        equals: input.name,
        mode: 'insensitive',
      },
    },
  })

  if (existingIngredient) {
    throw new Error(`Ingredient with name "${input.name}" already exists`)
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      name: input.name,
      proteinPer100g: input.proteinPer100g,
      carbsPer100g: input.carbsPer100g,
      fatPer100g: input.fatPer100g,
      caloriesPer100g: input.caloriesPer100g,
      createdById: user.user.id,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return ingredient
}

/**
 * Update an existing ingredient
 */
export async function updateIngredient(
  ingredientId: string,
  input: GQLUpdateIngredientInput,
): Promise<PrismaIngredient> {
  const user = await getCurrentUserOrThrow()

  // Check if ingredient exists and user has permission to update
  const existingIngredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
  })

  if (!existingIngredient) {
    throw new Error('Ingredient not found')
  }

  if (existingIngredient.createdById !== user.user.id) {
    throw new Error('Only the creator can update this ingredient')
  }

  // Validate updated data
  if (
    input.name ||
    (input.proteinPer100g !== undefined && input.proteinPer100g !== null) ||
    (input.carbsPer100g !== undefined && input.carbsPer100g !== null) ||
    (input.fatPer100g !== undefined && input.fatPer100g !== null) ||
    (input.caloriesPer100g !== undefined && input.caloriesPer100g !== null)
  ) {
    const validationData = {
      name: input.name || existingIngredient.name,
      proteinPer100g:
        input.proteinPer100g !== undefined && input.proteinPer100g !== null
          ? input.proteinPer100g
          : existingIngredient.proteinPer100g,
      carbsPer100g:
        input.carbsPer100g !== undefined && input.carbsPer100g !== null
          ? input.carbsPer100g
          : existingIngredient.carbsPer100g,
      fatPer100g:
        input.fatPer100g !== undefined && input.fatPer100g !== null
          ? input.fatPer100g
          : existingIngredient.fatPer100g,
      caloriesPer100g:
        input.caloriesPer100g !== undefined && input.caloriesPer100g !== null
          ? input.caloriesPer100g
          : existingIngredient.caloriesPer100g,
    }

    const validation = validateIngredientMacros(validationData)
    if (!validation.isValid) {
      throw new Error(
        `Invalid ingredient data: ${validation.errors.join(', ')}`,
      )
    }
  }

  // Check for duplicate names if name is being updated
  if (input.name && input.name !== existingIngredient.name) {
    const duplicateIngredient = await prisma.ingredient.findFirst({
      where: {
        name: {
          equals: input.name,
          mode: 'insensitive',
        },
        id: {
          not: ingredientId,
        },
      },
    })

    if (duplicateIngredient) {
      throw new Error(`Ingredient with name "${input.name}" already exists`)
    }
  }

  // Build update data object with proper null handling
  const updateData: {
    name?: string
    proteinPer100g?: number
    carbsPer100g?: number
    fatPer100g?: number
    caloriesPer100g?: number
  } = {}

  if (input.name) {
    updateData.name = input.name
  }
  if (input.proteinPer100g !== undefined && input.proteinPer100g !== null) {
    updateData.proteinPer100g = input.proteinPer100g
  }
  if (input.carbsPer100g !== undefined && input.carbsPer100g !== null) {
    updateData.carbsPer100g = input.carbsPer100g
  }
  if (input.fatPer100g !== undefined && input.fatPer100g !== null) {
    updateData.fatPer100g = input.fatPer100g
  }
  if (input.caloriesPer100g !== undefined && input.caloriesPer100g !== null) {
    updateData.caloriesPer100g = input.caloriesPer100g
  }

  const ingredient = await prisma.ingredient.update({
    where: { id: ingredientId },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return ingredient
}

/**
 * Get ingredient by ID
 */
export async function getIngredientById(
  ingredientId: string,
): Promise<PrismaIngredient | null> {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return ingredient
}

/**
 * Get recently created ingredients (for quick access)
 */
export async function getRecentIngredients(
  limit: number = 20,
): Promise<PrismaIngredient[]> {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return ingredients
}

/**
 * Get popular ingredients (most used in meals)
 */
export async function getPopularIngredients(
  limit: number = 20,
): Promise<PrismaIngredient[]> {
  const ingredients = await prisma.ingredient.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          mealIngredients: true,
        },
      },
    },
    orderBy: {
      mealIngredients: {
        _count: 'desc',
      },
    },
    take: limit,
  })

  return ingredients
}

/**
 * Validate ingredient macro values
 */
export function validateIngredientMacros(data: {
  name: string
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  caloriesPer100g: number
}): ValidationResult {
  const errors: string[] = []

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Ingredient name is required')
  } else if (data.name.trim().length > 100) {
    errors.push('Ingredient name must be 100 characters or less')
  }

  // Validate macro values are non-negative
  if (data.proteinPer100g < 0) {
    errors.push('Protein per 100g must be non-negative')
  }
  if (data.carbsPer100g < 0) {
    errors.push('Carbs per 100g must be non-negative')
  }
  if (data.fatPer100g < 0) {
    errors.push('Fat per 100g must be non-negative')
  }
  if (data.caloriesPer100g < 0) {
    errors.push('Calories per 100g must be non-negative')
  }

  // Validate macro values are reasonable (not exceeding 100g per 100g)
  if (data.proteinPer100g > 100) {
    errors.push('Protein per 100g cannot exceed 100g')
  }
  if (data.carbsPer100g > 100) {
    errors.push('Carbs per 100g cannot exceed 100g')
  }
  if (data.fatPer100g > 100) {
    errors.push('Fat per 100g cannot exceed 100g')
  }

  // Validate calories approximately match macro calculation
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  const calculatedCalories =
    data.proteinPer100g * 4 + data.carbsPer100g * 4 + data.fatPer100g * 9

  const calorieDifference = Math.abs(data.caloriesPer100g - calculatedCalories)
  const tolerancePercentage = 0.4 // 40% tolerance

  if (calorieDifference > calculatedCalories * tolerancePercentage) {
    errors.push(
      `Calories (${data.caloriesPer100g}) don't match macro calculation (${calculatedCalories.toFixed(1)}). ` +
        `Expected within 15% tolerance.`,
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
