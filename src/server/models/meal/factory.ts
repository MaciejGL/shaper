import { GraphQLError } from 'graphql'

import {
  GQLCreateMealInput,
  GQLUpdateMealInput,
} from '@/generated/graphql-server'
import {
  Prisma,
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  Team as PrismaTeam,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

import { TeamMealLibraryService } from './team-meal-library-service'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface MacroTotals {
  protein: number
  carbs: number
  fat: number
  calories: number
}

export interface CreateMealFactoryOptions {
  name?: string
  description?: string
  instructions?: string[]
  preparationTime?: number
  cookingTime?: number
  servings?: number
  createdById: string
  teamId: string
}

export interface CreateMealIngredientFactoryOptions {
  mealId: string
  ingredientId: string
  grams?: number
  orderIndex?: number
}

export class MealFactory {
  /**
   * Create a meal with default values
   */
  static async create(options: CreateMealFactoryOptions): Promise<
    PrismaMeal & {
      createdBy: PrismaUser
      team: PrismaTeam | null
      ingredients: (PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      })[]
    }
  > {
    if (!options.name) {
      throw new GraphQLError('Meal name is required')
    }

    const mealData = {
      name: options.name,
      description: options.description,
      instructions: options.instructions,
      preparationTime: options.preparationTime || 15,
      cookingTime: options.cookingTime || 30,
      servings: options.servings || 4,
      createdById: options.createdById,
      teamId: options.teamId,
    }

    return await prisma.meal.create({
      data: mealData,
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
        team: true,
        ingredients: {
          include: {
            ingredient: {
              include: {
                createdBy: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    })
  }

  /**
   * Create a meal ingredient
   */
  static async createMealIngredient(
    options: CreateMealIngredientFactoryOptions,
  ): Promise<
    PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    }
  > {
    const orderIndex =
      options.orderIndex ??
      (await prisma.mealIngredient.count({
        where: { mealId: options.mealId },
      }))

    return await prisma.mealIngredient.create({
      data: {
        mealId: options.mealId,
        ingredientId: options.ingredientId,
        grams: options.grams || 100,
        orderIndex,
      },
      include: {
        ingredient: {
          include: {
            createdBy: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Create a meal with ingredients
   */
  static async createWithIngredients(
    mealOptions: CreateMealFactoryOptions,
    ingredientIds: string[],
  ): Promise<
    PrismaMeal & {
      createdBy: PrismaUser
      team: PrismaTeam | null
      ingredients: (PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      })[]
    }
  > {
    const meal = await this.create(mealOptions)

    // Add ingredients to the meal
    for (let i = 0; i < ingredientIds.length; i++) {
      await this.createMealIngredient({
        mealId: meal.id,
        ingredientId: ingredientIds[i],
        orderIndex: i,
      })
    }

    // Return meal with ingredients
    return await prisma.meal.findUniqueOrThrow({
      where: { id: meal.id },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
        team: true,
        ingredients: {
          include: {
            ingredient: {
              include: {
                createdBy: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    })
  }

  /**
   * Create multiple meals for a team
   */
  static async createMultiple(
    count: number,
    baseOptions: Omit<CreateMealFactoryOptions, 'name'>,
  ): Promise<
    (PrismaMeal & {
      createdBy: PrismaUser
      team: PrismaTeam | null
      ingredients: (PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      })[]
    })[]
  > {
    const meals = []

    for (let i = 0; i < count; i++) {
      const meal = await this.create({
        ...baseOptions,
        name: `Test Meal ${i + 1}`,
      })
      meals.push(meal)
    }

    return meals
  }
}

/**
 * Calculate macro totals for a meal
 */
export function calculateMealMacros(
  meal: PrismaMeal & {
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient
    })[]
  },
): MacroTotals {
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let totalCalories = 0

  for (const mealIngredient of meal.ingredients) {
    const { ingredient, grams } = mealIngredient
    const multiplier = grams / 100 // Convert per 100g to actual grams

    totalProtein += ingredient.proteinPer100g * multiplier
    totalCarbs += ingredient.carbsPer100g * multiplier
    totalFat += ingredient.fatPer100g * multiplier
    totalCalories += ingredient.caloriesPer100g * multiplier
  }

  return {
    protein: Math.round(totalProtein * 10) / 10, // Round to 1 decimal
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    calories: Math.round(totalCalories),
  }
}

/**
 * Validate meal input data
 */
export function validateMeal(input: GQLCreateMealInput): ValidationResult {
  const errors: string[] = []

  // Validate name
  if (!input.name || input.name.trim().length === 0) {
    errors.push('Meal name is required')
  } else if (input.name.trim().length > 100) {
    errors.push('Meal name must be 100 characters or less')
  }

  // Validate optional fields
  if (input.description && input.description.length > 500) {
    errors.push('Meal description must be 500 characters or less')
  }

  if (
    input.preparationTime !== undefined &&
    input.preparationTime !== null &&
    input.preparationTime < 0
  ) {
    errors.push('Preparation time must be non-negative')
  }

  if (
    input.cookingTime !== undefined &&
    input.cookingTime !== null &&
    input.cookingTime < 0
  ) {
    errors.push('Cooking time must be non-negative')
  }

  if (
    input.servings !== undefined &&
    input.servings !== null &&
    input.servings <= 0
  ) {
    errors.push('Servings must be greater than 0')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate meal ingredient grams
 */
export function validateMealIngredient(grams: number): ValidationResult {
  const errors: string[] = []

  if (grams <= 0) {
    errors.push('Ingredient grams must be greater than 0')
  }

  if (grams > 10000) {
    // 10kg limit seems reasonable
    errors.push('Ingredient grams cannot exceed 10,000g (10kg)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get trainer's team ID
 */
export async function getTrainerTeamId(trainerId: string): Promise<string> {
  return await TeamMealLibraryService.validateTeamAccess(trainerId)
}

/**
 * Get trainer's team
 */
export async function getTrainerTeam(
  trainerId: string,
): Promise<PrismaTeam | null> {
  return await TeamMealLibraryService.getTrainerTeam(trainerId)
}

/**
 * Get team meals with optional search query
 */
export async function getTeamMeals(
  trainerId: string,
  searchQuery?: string,
  sortBy?: 'NAME' | 'USAGE_COUNT' | 'CREATED_AT',
  includeArchived?: boolean,
): Promise<
  (PrismaMeal & {
    createdBy: PrismaUser
    team: PrismaTeam | null
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    })[]
    _count: {
      planMeals: number
    }
  })[]
> {
  const teamId = await getTrainerTeamId(trainerId)
  return await TeamMealLibraryService.getTeamMeals(
    teamId,
    searchQuery,
    sortBy,
    includeArchived,
  )
}

/**
 * Search team meals with optional query (legacy function)
 */
export async function searchTeamMeals(
  teamId: string,
  searchQuery?: string,
): Promise<
  (PrismaMeal & {
    createdBy: PrismaUser
    team: PrismaTeam | null
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    })[]
  })[]
> {
  return await TeamMealLibraryService.getTeamMeals(teamId, searchQuery)
}

/**
 * Get meal by ID with team access validation
 */
export async function getMealById(
  mealId: string,
  trainerId: string,
): Promise<
  PrismaMeal & {
    createdBy: PrismaUser
    team: PrismaTeam | null
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    })[]
  }
> {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: {
      createdBy: {
        include: {
          profile: true,
        },
      },
      team: true,
      ingredients: {
        include: {
          ingredient: {
            include: {
              createdBy: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  })

  if (!meal) {
    throw new GraphQLError('Meal not found')
  }

  // Check if user can access this meal
  const hasAccess = await canAccessMeal(mealId, trainerId)
  if (!hasAccess) {
    throw new GraphQLError(
      'Access denied: You must be part of the same team to view this meal',
    )
  }

  return meal
}

/**
 * Check if user can access a meal
 */
export async function canAccessMeal(
  mealId: string,
  trainerId: string,
): Promise<boolean> {
  return await TeamMealLibraryService.canAccessMeal(mealId, trainerId)
}

/**
 * Check if user can modify a meal
 */
export async function canModifyMeal(
  mealId: string,
  trainerId: string,
): Promise<boolean> {
  return await TeamMealLibraryService.canModifyMeal(mealId, trainerId)
}

/**
 * Create meal with validation
 */
export async function createMeal(
  input: GQLCreateMealInput,
  trainerId: string,
): Promise<
  PrismaMeal & {
    createdBy: PrismaUser
    team: PrismaTeam | null
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    })[]
  }
> {
  // Validate input data
  const validation = validateMeal(input)
  if (!validation.isValid) {
    throw new GraphQLError(`Invalid meal data: ${validation.errors.join(', ')}`)
  }

  const teamId = await getTrainerTeamId(trainerId)

  // Check for duplicate meal name within team
  const existingMeal = await prisma.meal.findFirst({
    where: {
      name: input.name,
      teamId,
    },
  })

  if (existingMeal) {
    throw new GraphQLError('A meal with this name already exists in your team')
  }

  return await MealFactory.create({
    name: input.name,
    description: input.description || undefined,
    instructions: input.instructions || undefined,
    preparationTime: input.preparationTime || undefined,
    cookingTime: input.cookingTime || undefined,
    servings: input.servings || undefined,
    createdById: trainerId,
    teamId,
  })
}

/**
 * Update meal with validation
 */
export async function updateMeal(
  mealId: string,
  input: GQLUpdateMealInput,
  trainerId: string,
): Promise<
  PrismaMeal & {
    createdBy: PrismaUser
    team: PrismaTeam | null
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    })[]
  }
> {
  const existingMeal = await prisma.meal.findUnique({
    where: { id: mealId },
    select: {
      createdById: true,
      teamId: true,
      name: true,
    },
  })

  if (!existingMeal) {
    throw new GraphQLError('Meal not found')
  }

  const canModify = await canModifyMeal(mealId, trainerId)
  if (!canModify) {
    throw new GraphQLError(
      'Access denied: You can only modify meals you created or if you are a team admin',
    )
  }

  // Check if meal is used in any nutrition plans
  const usageCount = await prisma.nutritionPlanMeal.count({
    where: { mealId },
  })

  if (usageCount > 0) {
    throw new GraphQLError(
      'Cannot edit meal that is used in nutrition plans. Duplicate it to create an editable version.',
    )
  }

  // Check for duplicate name if name is being changed
  if (input.name && input.name !== existingMeal.name && existingMeal.teamId) {
    const duplicateMeal = await prisma.meal.findFirst({
      where: {
        name: input.name,
        teamId: existingMeal.teamId,
        id: { not: mealId },
      },
    })

    if (duplicateMeal) {
      throw new GraphQLError(
        'A meal with this name already exists in your team',
      )
    }
  }

  const updateData: Prisma.MealUpdateInput = {}

  if (input.name) {
    updateData.name = input.name
  }
  if (input.description !== undefined) {
    updateData.description = input.description
  }
  if (input.instructions !== undefined) {
    updateData.instructions = input.instructions || []
  }
  if (input.preparationTime !== undefined) {
    updateData.preparationTime = input.preparationTime
  }
  if (input.cookingTime !== undefined) {
    updateData.cookingTime = input.cookingTime
  }
  if (input.servings !== undefined) {
    updateData.servings = input.servings
  }

  return await prisma.meal.update({
    where: { id: mealId },
    data: updateData,
    include: {
      createdBy: {
        include: {
          profile: true,
        },
      },
      team: true,
      ingredients: {
        include: {
          ingredient: {
            include: {
              createdBy: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  })
}

/**
 * Delete meal with validation
 */
export async function deleteMeal(
  mealId: string,
  trainerId: string,
): Promise<boolean> {
  const canModify = await canModifyMeal(mealId, trainerId)
  if (!canModify) {
    throw new GraphQLError(
      'Access denied: You can only delete meals you created or if you are a team admin',
    )
  }

  // Check if meal is used in any nutrition plans
  const usageCount = await prisma.nutritionPlanMeal.count({
    where: { mealId },
  })

  if (usageCount > 0) {
    throw new GraphQLError(
      `Cannot delete meal that is used in ${usageCount} nutrition plan${usageCount > 1 ? 's' : ''}. Duplicate it to create an editable version.`,
    )
  }

  await prisma.meal.delete({
    where: { id: mealId },
  })

  return true
}

/**
 * Duplicate meal with all ingredients
 */
export async function duplicateMeal(
  mealId: string,
  trainerId: string,
  newName?: string,
): Promise<
  PrismaMeal & {
    createdBy: PrismaUser
    team: PrismaTeam | null
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    })[]
  }
> {
  // Verify access to the original meal
  const canAccess = await TeamMealLibraryService.canAccessMeal(
    mealId,
    trainerId,
  )
  if (!canAccess) {
    throw new GraphQLError(
      'Access denied: You can only duplicate meals you have access to',
    )
  }

  // Fetch original meal with all ingredients
  const originalMeal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: {
      ingredients: {
        include: {
          ingredient: {
            include: {
              createdBy: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  })

  if (!originalMeal) {
    throw new GraphQLError('Meal not found')
  }

  // Get trainer's team
  const teamId = await getTrainerTeamId(trainerId)

  // Generate new name
  const duplicateName = newName || `${originalMeal.name} (Copy)`

  // Check for duplicate name
  const existingMeal = await prisma.meal.findFirst({
    where: {
      name: duplicateName,
      teamId,
    },
  })

  if (existingMeal) {
    throw new GraphQLError('A meal with this name already exists in your team')
  }

  // Create new meal with ingredients
  const newMeal = await prisma.meal.create({
    data: {
      name: duplicateName,
      description: originalMeal.description,
      instructions: originalMeal.instructions,
      preparationTime: originalMeal.preparationTime,
      cookingTime: originalMeal.cookingTime,
      servings: originalMeal.servings,
      createdById: trainerId,
      teamId,
      ingredients: {
        create: originalMeal.ingredients.map((mi) => ({
          ingredientId: mi.ingredientId,
          grams: mi.grams,
          orderIndex: mi.orderIndex,
        })),
      },
    },
    include: {
      createdBy: {
        include: {
          profile: true,
        },
      },
      team: true,
      ingredients: {
        include: {
          ingredient: {
            include: {
              createdBy: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  })

  return newMeal
}

/**
 * Add ingredient to meal with validation
 */
export async function addIngredientToMeal(
  mealId: string,
  ingredientId: string,
  grams: number,
  trainerId: string,
): Promise<
  PrismaMealIngredient & {
    ingredient: PrismaIngredient & {
      createdBy: PrismaUser
    }
  }
> {
  // Validate grams
  const validation = validateMealIngredient(grams)
  if (!validation.isValid) {
    throw new GraphQLError(
      `Invalid ingredient data: ${validation.errors.join(', ')}`,
    )
  }

  const canModify = await canModifyMeal(mealId, trainerId)
  if (!canModify) {
    throw new GraphQLError(
      'Access denied: You can only modify meals you created or if you are a team admin',
    )
  }

  // Check if ingredient exists
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
  })

  if (!ingredient) {
    throw new GraphQLError('Ingredient not found')
  }

  // Check if ingredient is already in the meal
  const existingMealIngredient = await prisma.mealIngredient.findUnique({
    where: {
      mealId_ingredientId: {
        mealId,
        ingredientId,
      },
    },
  })

  if (existingMealIngredient) {
    throw new GraphQLError('This ingredient is already in the meal')
  }

  return await MealFactory.createMealIngredient({
    mealId,
    ingredientId,
    grams,
  })
}

/**
 * Update meal ingredient with validation
 */
export async function updateMealIngredient(
  ingredientId: string,
  grams: number,
  trainerId: string,
): Promise<
  PrismaMealIngredient & {
    ingredient: PrismaIngredient & {
      createdBy: PrismaUser
    }
  }
> {
  // Validate grams
  const validation = validateMealIngredient(grams)
  if (!validation.isValid) {
    throw new GraphQLError(
      `Invalid ingredient data: ${validation.errors.join(', ')}`,
    )
  }

  const mealIngredient = await prisma.mealIngredient.findUnique({
    where: { id: ingredientId },
    include: {
      meal: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!mealIngredient) {
    throw new GraphQLError('Meal ingredient not found')
  }

  const canModify = await canModifyMeal(mealIngredient.meal.id, trainerId)
  if (!canModify) {
    throw new GraphQLError(
      'Access denied: You can only modify meals you created or if you are a team admin',
    )
  }

  return await prisma.mealIngredient.update({
    where: { id: ingredientId },
    data: {
      grams,
    },
    include: {
      ingredient: {
        include: {
          createdBy: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Remove ingredient from meal with validation
 */
export async function removeIngredientFromMeal(
  ingredientId: string,
  trainerId: string,
): Promise<boolean> {
  const mealIngredient = await prisma.mealIngredient.findUnique({
    where: { id: ingredientId },
    include: {
      meal: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!mealIngredient) {
    throw new GraphQLError('Meal ingredient not found')
  }

  const canModify = await canModifyMeal(mealIngredient.meal.id, trainerId)
  if (!canModify) {
    throw new GraphQLError(
      'Access denied: You can only modify meals you created or if you are a team admin',
    )
  }

  await prisma.mealIngredient.delete({
    where: { id: ingredientId },
  })

  return true
}

/**
 * Reorder meal ingredients with validation
 */
export async function reorderMealIngredients(
  mealId: string,
  ingredientIds: string[],
  trainerId: string,
): Promise<
  (PrismaMealIngredient & {
    ingredient: PrismaIngredient & {
      createdBy: PrismaUser
    }
  })[]
> {
  const canModify = await canModifyMeal(mealId, trainerId)
  if (!canModify) {
    throw new GraphQLError(
      'Access denied: You can only modify meals you created or if you are a team admin',
    )
  }

  // Update order indices
  const updatePromises = ingredientIds.map((ingredientId, index) =>
    prisma.mealIngredient.update({
      where: {
        mealId_ingredientId: {
          mealId,
          ingredientId,
        },
      },
      data: {
        orderIndex: index,
      },
    }),
  )

  await Promise.all(updatePromises)

  // Return updated meal ingredients
  return await prisma.mealIngredient.findMany({
    where: { mealId },
    include: {
      ingredient: {
        include: {
          createdBy: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: {
      orderIndex: 'asc',
    },
  })
}

/**
 * Archive a meal
 */
export async function archiveMeal(
  mealId: string,
  trainerId: string,
): Promise<
  PrismaMeal & {
    createdBy: PrismaUser
    team: PrismaTeam | null
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    })[]
    _count: {
      planMeals: number
    }
  }
> {
  const canModify = await canModifyMeal(mealId, trainerId)
  if (!canModify) {
    throw new GraphQLError(
      'Access denied: You can only archive meals you created or if you are a team admin',
    )
  }

  return await prisma.meal.update({
    where: { id: mealId },
    data: { archived: true },
    include: {
      createdBy: {
        include: {
          profile: true,
        },
      },
      team: true,
      ingredients: {
        include: {
          ingredient: {
            include: {
              createdBy: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
      _count: {
        select: {
          planMeals: true,
        },
      },
    },
  })
}

/**
 * Unarchive a meal
 */
export async function unarchiveMeal(
  mealId: string,
  trainerId: string,
): Promise<
  PrismaMeal & {
    createdBy: PrismaUser
    team: PrismaTeam | null
    ingredients: (PrismaMealIngredient & {
      ingredient: PrismaIngredient & {
        createdBy: PrismaUser
      }
    })[]
    _count: {
      planMeals: number
    }
  }
> {
  const canModify = await canModifyMeal(mealId, trainerId)
  if (!canModify) {
    throw new GraphQLError(
      'Access denied: You can only unarchive meals you created or if you are a team admin',
    )
  }

  return await prisma.meal.update({
    where: { id: mealId },
    data: { archived: false },
    include: {
      createdBy: {
        include: {
          profile: true,
        },
      },
      team: true,
      ingredients: {
        include: {
          ingredient: {
            include: {
              createdBy: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
      _count: {
        select: {
          planMeals: true,
        },
      },
    },
  })
}
