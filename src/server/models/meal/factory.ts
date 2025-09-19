import {
  Prisma,
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  Team as PrismaTeam,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

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
      throw new Error('Meal name is required')
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
 * Get trainer's team ID
 */
export async function getTrainerTeamId(trainerId: string): Promise<string> {
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      userId: trainerId,
    },
  })

  if (!teamMember) {
    throw new Error('You must be part of a team to access team meals')
  }

  return teamMember.teamId
}

/**
 * Search team meals with optional query
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
  const whereClause: Prisma.MealWhereInput = {
    teamId,
  }

  // Add search functionality if query provided
  if (searchQuery && searchQuery.trim()) {
    whereClause.OR = [
      {
        name: {
          contains: searchQuery.trim(),
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: searchQuery.trim(),
          mode: 'insensitive',
        },
      },
    ]
  }

  return await prisma.meal.findMany({
    where: whereClause,
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
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        name: 'asc',
      },
    ],
  })
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
    throw new Error('Meal not found')
  }

  // Check if user can access this meal (must be in the same team)
  if (meal.teamId) {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: trainerId,
        teamId: meal.teamId,
      },
    })

    if (!teamMember) {
      throw new Error(
        'Access denied: You must be part of the same team to view this meal',
      )
    }
  }

  return meal
}

/**
 * Check if user can modify a meal
 */
export async function canModifyMeal(
  mealId: string,
  trainerId: string,
): Promise<boolean> {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    select: {
      createdById: true,
      teamId: true,
    },
  })

  if (!meal) {
    return false
  }

  // Creator can always modify
  if (meal.createdById === trainerId) {
    return true
  }

  // Team admin can modify any meal in their team
  if (meal.teamId) {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: trainerId,
        teamId: meal.teamId,
        role: 'ADMIN',
      },
    })
    return !!teamMember
  }

  return false
}

/**
 * Create meal with validation
 */
export async function createMealWithValidation(
  input: {
    name: string
    description?: string | null
    instructions?: string[] | null
    preparationTime?: number | null
    cookingTime?: number | null
    servings?: number | null
  },
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
  const teamId = await getTrainerTeamId(trainerId)

  // Check for duplicate meal name within team
  const existingMeal = await prisma.meal.findFirst({
    where: {
      name: input.name,
      teamId,
    },
  })

  if (existingMeal) {
    throw new Error('A meal with this name already exists in your team')
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
export async function updateMealWithValidation(
  mealId: string,
  input: {
    name?: string | null
    description?: string | null
    instructions?: string[] | null
    preparationTime?: number | null
    cookingTime?: number | null
    servings?: number | null
  },
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
    throw new Error('Meal not found')
  }

  const canModify = await canModifyMeal(mealId, trainerId)
  if (!canModify) {
    throw new Error(
      'Access denied: You can only modify meals you created or if you are a team admin',
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
      throw new Error('A meal with this name already exists in your team')
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
export async function deleteMealWithValidation(
  mealId: string,
  trainerId: string,
): Promise<boolean> {
  const canModify = await canModifyMeal(mealId, trainerId)
  if (!canModify) {
    throw new Error(
      'Access denied: You can only delete meals you created or if you are a team admin',
    )
  }

  await prisma.meal.delete({
    where: { id: mealId },
  })

  return true
}

/**
 * Add ingredient to meal with validation
 */
export async function addIngredientToMealWithValidation(
  input: {
    mealId: string
    ingredientId: string
    grams: number
  },
  trainerId: string,
): Promise<
  PrismaMealIngredient & {
    ingredient: PrismaIngredient & {
      createdBy: PrismaUser
    }
  }
> {
  const canModify = await canModifyMeal(input.mealId, trainerId)
  if (!canModify) {
    throw new Error(
      'Access denied: You can only modify meals you created or if you are a team admin',
    )
  }

  // Check if ingredient exists
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: input.ingredientId },
  })

  if (!ingredient) {
    throw new Error('Ingredient not found')
  }

  // Check if ingredient is already in the meal
  const existingMealIngredient = await prisma.mealIngredient.findUnique({
    where: {
      mealId_ingredientId: {
        mealId: input.mealId,
        ingredientId: input.ingredientId,
      },
    },
  })

  if (existingMealIngredient) {
    throw new Error('This ingredient is already in the meal')
  }

  return await MealFactory.createMealIngredient({
    mealId: input.mealId,
    ingredientId: input.ingredientId,
    grams: input.grams,
  })
}

/**
 * Update meal ingredient with validation
 */
export async function updateMealIngredientWithValidation(
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
    throw new Error('Meal ingredient not found')
  }

  const canModify = await canModifyMeal(mealIngredient.meal.id, trainerId)
  if (!canModify) {
    throw new Error(
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
export async function removeIngredientFromMealWithValidation(
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
    throw new Error('Meal ingredient not found')
  }

  const canModify = await canModifyMeal(mealIngredient.meal.id, trainerId)
  if (!canModify) {
    throw new Error(
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
export async function reorderMealIngredientsWithValidation(
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
    throw new Error(
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
