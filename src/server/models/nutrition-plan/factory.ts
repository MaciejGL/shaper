import { differenceInHours } from 'date-fns'
import { GraphQLError } from 'graphql'

import {
  GQLCreateNutritionPlanInput,
  GQLUpdateNutritionPlanInput,
} from '@/generated/graphql-server'
import {
  Prisma,
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  NutritionPlan as PrismaNutritionPlan,
  NutritionPlanDay as PrismaNutritionPlanDay,
  NutritionPlanMeal as PrismaNutritionPlanMeal,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { ensureTrainerClientAccess } from '@/lib/access-control'
import { prisma } from '@/lib/db'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface CreateNutritionPlanFactoryOptions {
  name: string
  description?: string
  trainerId: string
  clientId: string
  days?: CreateNutritionPlanDayFactoryOptions[]
}

export interface CreateNutritionPlanDayFactoryOptions {
  dayNumber: number
  name: string
  meals?: CreateNutritionPlanMealFactoryOptions[]
}

export interface CreateNutritionPlanMealFactoryOptions {
  mealId: string
  orderIndex?: number
  portionMultiplier?: number
}

export interface CopyNutritionPlanFactoryOptions {
  sourceNutritionPlanId: string
  targetClientId: string
  trainerId: string
  name?: string
  description?: string
  portionAdjustments?: Record<string, number>
}

/**
 * Get nutrition plan by ID with full relations
 */
export async function getNutritionPlanById(id: string): Promise<
  PrismaNutritionPlan & {
    trainer: PrismaUser
    client: PrismaUser
    days: (PrismaNutritionPlanDay & {
      meals: (PrismaNutritionPlanMeal & {
        meal: PrismaMeal & {
          ingredients: (PrismaMealIngredient & {
            ingredient: PrismaIngredient
          })[]
          createdBy: PrismaUser
        }
      })[]
    })[]
  }
> {
  const nutritionPlan = await prisma.nutritionPlan.findUnique({
    where: { id },
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
      client: {
        include: {
          profile: true,
        },
      },
      days: {
        orderBy: {
          dayNumber: 'asc',
        },
        include: {
          meals: {
            orderBy: {
              orderIndex: 'asc',
            },
            include: {
              meal: {
                include: {
                  createdBy: {
                    include: {
                      profile: true,
                    },
                  },
                  ingredients: {
                    orderBy: {
                      orderIndex: 'asc',
                    },
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!nutritionPlan) {
    throw new GraphQLError('Nutrition plan not found')
  }

  return nutritionPlan
}

/**
 * Get trainer's nutrition plans with filtering
 */
export async function getTrainerNutritionPlans(
  trainerId: string,
  clientId?: string,
  sharedOnly?: boolean,
): Promise<
  (PrismaNutritionPlan & {
    client: PrismaUser
    days: PrismaNutritionPlanDay[]
  })[]
> {
  const where: Prisma.NutritionPlanWhereInput = {
    trainerId,
  }

  if (clientId) {
    where.clientId = clientId
  }

  if (sharedOnly) {
    where.isSharedWithClient = true
  }

  return await prisma.nutritionPlan.findMany({
    where,
    include: {
      client: {
        include: {
          profile: true,
        },
      },
      days: {
        orderBy: {
          dayNumber: 'asc',
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

/**
 * Get client's nutrition plans (only shared ones)
 */
export async function getClientNutritionPlans(clientId: string): Promise<
  (PrismaNutritionPlan & {
    trainer: PrismaUser
    days: (PrismaNutritionPlanDay & {
      meals: (PrismaNutritionPlanMeal & {
        meal: PrismaMeal & {
          ingredients: (PrismaMealIngredient & {
            ingredient: PrismaIngredient
          })[]
        }
      })[]
    })[]
  })[]
> {
  return await prisma.nutritionPlan.findMany({
    where: {
      clientId,
      isSharedWithClient: true,
    },
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
      days: {
        orderBy: {
          dayNumber: 'asc',
        },
        include: {
          meals: {
            orderBy: {
              orderIndex: 'asc',
            },
            include: {
              meal: {
                include: {
                  ingredients: {
                    orderBy: {
                      orderIndex: 'asc',
                    },
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

/**
 * Validate nutrition plan input
 */
export function validateNutritionPlan(
  input: GQLCreateNutritionPlanInput,
): ValidationResult {
  const errors: string[] = []

  // Validate name
  if (!input.name || input.name.trim().length === 0) {
    errors.push('Nutrition plan name is required')
  } else if (input.name.trim().length > 100) {
    errors.push('Nutrition plan name must be 100 characters or less')
  }

  // Validate description
  if (input.description && input.description.length > 500) {
    errors.push('Nutrition plan description must be 500 characters or less')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate nutrition plan day input
 */
export function validateNutritionPlanDay(
  dayNumber: number,
  name: string,
): ValidationResult {
  const errors: string[] = []

  if (dayNumber < 1 || dayNumber > 365) {
    errors.push('Day number must be between 1 and 365')
  }

  if (!name || name.trim().length === 0) {
    errors.push('Day name is required')
  } else if (name.trim().length > 50) {
    errors.push('Day name must be 50 characters or less')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate portion multiplier
 */
export function validatePortionMultiplier(
  multiplier: number,
): ValidationResult {
  const errors: string[] = []

  if (multiplier <= 0) {
    errors.push('Portion multiplier must be greater than 0')
  }

  if (multiplier > 10) {
    errors.push('Portion multiplier cannot exceed 10')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Create nutrition plan with validation
 */
export async function createNutritionPlan(
  input: GQLCreateNutritionPlanInput,
  trainerId: string,
): Promise<
  PrismaNutritionPlan & {
    trainer: PrismaUser
    client: PrismaUser
    days: PrismaNutritionPlanDay[]
  }
> {
  // Validate input
  const validation = validateNutritionPlan(input)
  if (!validation.isValid) {
    throw new GraphQLError(
      `Invalid nutrition plan data: ${validation.errors.join(', ')}`,
    )
  }

  // Verify trainer-client relationship
  await ensureTrainerClientAccess(trainerId, input.clientId)

  return await prisma.nutritionPlan.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim(),
      trainerId,
      clientId: input.clientId,
    },
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
      client: {
        include: {
          profile: true,
        },
      },
      days: {
        orderBy: {
          dayNumber: 'asc',
        },
      },
    },
  })
}

/**
 * Update nutrition plan with validation
 */
export async function updateNutritionPlan(
  id: string,
  input: GQLUpdateNutritionPlanInput,
  trainerId: string,
): Promise<
  PrismaNutritionPlan & {
    trainer: PrismaUser
    client: PrismaUser
    days: PrismaNutritionPlanDay[]
  }
> {
  // Check access
  const plan = await prisma.nutritionPlan.findUnique({
    where: { id },
    select: { trainerId: true, clientId: true },
  })

  if (!plan || plan.trainerId !== trainerId) {
    throw new GraphQLError(
      'Access denied: You can only modify nutrition plans you created',
    )
  }

  // Validate name if provided
  if (input.name) {
    const validationInput = {
      name: input.name,
      clientId: 'temp', // Temp clientId for validation purposes only
    }
    const validation = validateNutritionPlan(validationInput)
    if (!validation.isValid) {
      throw new GraphQLError(
        `Invalid nutrition plan data: ${validation.errors.join(', ')}`,
      )
    }
  }

  return await prisma.nutritionPlan.update({
    where: { id },
    data: {
      name: input.name?.trim(),
      description: input.description?.trim(),
    },
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
      client: {
        include: {
          profile: true,
        },
      },
      days: {
        orderBy: {
          dayNumber: 'asc',
        },
      },
    },
  })
}

/**
 * Delete nutrition plan with validation
 */
export async function deleteNutritionPlan(
  id: string,
  trainerId: string,
): Promise<boolean> {
  // Check access
  const plan = await prisma.nutritionPlan.findUnique({
    where: { id },
    select: { trainerId: true },
  })

  if (!plan || plan.trainerId !== trainerId) {
    throw new GraphQLError(
      'Access denied: You can only delete nutrition plans you created',
    )
  }

  await prisma.nutritionPlan.delete({
    where: { id },
  })

  return true
}

/**
 * Share nutrition plan with client (24-hour window enforced)
 */
export async function shareNutritionPlanWithClient(
  id: string,
  trainerId: string,
): Promise<
  PrismaNutritionPlan & {
    trainer: PrismaUser
    client: PrismaUser
    days: PrismaNutritionPlanDay[]
  }
> {
  // Check access
  const plan = await prisma.nutritionPlan.findUnique({
    where: { id },
    select: { trainerId: true, isSharedWithClient: true, sharedAt: true },
  })

  if (!plan || plan.trainerId !== trainerId) {
    throw new GraphQLError(
      'Access denied: You can only share nutrition plans you created',
    )
  }

  if (plan.isSharedWithClient && plan.sharedAt) {
    throw new GraphQLError('Nutrition plan is already shared with client')
  }

  return await prisma.nutritionPlan.update({
    where: { id },
    data: {
      isSharedWithClient: true,
      sharedAt: new Date(),
    },
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
      client: {
        include: {
          profile: true,
        },
      },
      days: {
        orderBy: {
          dayNumber: 'asc',
        },
      },
    },
  })
}

/**
 * Unshare nutrition plan from client (24-hour window validation)
 */
export async function unshareNutritionPlanFromClient(
  id: string,
  trainerId: string,
): Promise<
  PrismaNutritionPlan & {
    trainer: PrismaUser
    client: PrismaUser
    days: PrismaNutritionPlanDay[]
  }
> {
  // Check access and 24-hour window
  const plan = await prisma.nutritionPlan.findUnique({
    where: { id },
    select: {
      trainerId: true,
      isSharedWithClient: true,
      sharedAt: true,
    },
  })

  if (!plan || plan.trainerId !== trainerId) {
    throw new GraphQLError(
      'Access denied: You can only unshare nutrition plans you created',
    )
  }

  if (!plan.isSharedWithClient || !plan.sharedAt) {
    throw new GraphQLError('Nutrition plan is not currently shared with client')
  }

  // Check 24-hour window
  const hoursSinceShared = differenceInHours(new Date(), plan.sharedAt)
  if (hoursSinceShared >= 24) {
    throw new GraphQLError(
      'Cannot unshare nutrition plan after 24 hours have passed',
    )
  }

  return await prisma.nutritionPlan.update({
    where: { id },
    data: {
      isSharedWithClient: false,
      sharedAt: null,
    },
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
      client: {
        include: {
          profile: true,
        },
      },
      days: {
        orderBy: {
          dayNumber: 'asc',
        },
      },
    },
  })
}

/**
 * Copy nutrition plan to another client with portion adjustments
 */
export async function copyNutritionPlan(
  options: CopyNutritionPlanFactoryOptions,
): Promise<
  PrismaNutritionPlan & {
    trainer: PrismaUser
    client: PrismaUser
    days: (PrismaNutritionPlanDay & {
      meals: (PrismaNutritionPlanMeal & {
        meal: PrismaMeal
      })[]
    })[]
  }
> {
  const { sourceNutritionPlanId, targetClientId, trainerId } = options

  // Verify trainer-client access for target client
  await ensureTrainerClientAccess(trainerId, targetClientId)

  // Get source plan with all data
  const sourcePlan = await getNutritionPlanById(sourceNutritionPlanId)

  if (sourcePlan.trainerId !== trainerId) {
    throw new GraphQLError(
      'Access denied: You can only copy nutrition plans you created',
    )
  }

  // Create new plan with copied data
  return await prisma.nutritionPlan.create({
    data: {
      name: options.name || `${sourcePlan.name} (Copy)`,
      description: options.description || sourcePlan.description,
      trainerId,
      clientId: targetClientId,
      days: {
        create: sourcePlan.days.map((day) => ({
          dayNumber: day.dayNumber,
          name: day.name,
          meals: {
            create: day.meals.map((planMeal) => {
              const adjustedMultiplier =
                options.portionAdjustments?.[planMeal.mealId] ||
                planMeal.portionMultiplier

              return {
                mealId: planMeal.mealId,
                orderIndex: planMeal.orderIndex,
                portionMultiplier: adjustedMultiplier,
              }
            }),
          },
        })),
      },
    },
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
      client: {
        include: {
          profile: true,
        },
      },
      days: {
        orderBy: {
          dayNumber: 'asc',
        },
        include: {
          meals: {
            orderBy: {
              orderIndex: 'asc',
            },
            include: {
              meal: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Add day to nutrition plan
 */
export async function addDayToNutritionPlan(
  nutritionPlanId: string,
  dayNumber: number,
  name: string,
  trainerId: string,
): Promise<
  PrismaNutritionPlanDay & {
    meals: (PrismaNutritionPlanMeal & {
      meal: PrismaMeal
    })[]
  }
> {
  // Validate day data
  const validation = validateNutritionPlanDay(dayNumber, name)
  if (!validation.isValid) {
    throw new GraphQLError(`Invalid day data: ${validation.errors.join(', ')}`)
  }

  // Check plan access
  const plan = await prisma.nutritionPlan.findUnique({
    where: { id: nutritionPlanId },
    select: { trainerId: true },
  })

  if (!plan || plan.trainerId !== trainerId) {
    throw new GraphQLError(
      'Access denied: You can only modify nutrition plans you created',
    )
  }

  // Check for existing day with same number
  const existingDay = await prisma.nutritionPlanDay.findUnique({
    where: {
      nutritionPlanId_dayNumber: {
        nutritionPlanId,
        dayNumber,
      },
    },
  })

  if (existingDay) {
    throw new GraphQLError(
      `Day ${dayNumber} already exists in this nutrition plan`,
    )
  }

  return await prisma.nutritionPlanDay.create({
    data: {
      nutritionPlanId,
      dayNumber,
      name: name.trim(),
    },
    include: {
      meals: {
        orderBy: {
          orderIndex: 'asc',
        },
        include: {
          meal: {
            include: {
              ingredients: {
                orderBy: {
                  orderIndex: 'asc',
                },
                include: {
                  ingredient: true,
                },
              },
              createdBy: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

/**
 * Remove day from nutrition plan
 */
export async function removeDayFromNutritionPlan(
  dayId: string,
  trainerId: string,
): Promise<boolean> {
  // Check access through plan
  const day = await prisma.nutritionPlanDay.findUnique({
    where: { id: dayId },
    include: {
      nutritionPlan: {
        select: { trainerId: true },
      },
    },
  })

  if (!day || day.nutritionPlan.trainerId !== trainerId) {
    throw new GraphQLError(
      'Access denied: You can only modify nutrition plans you created',
    )
  }

  await prisma.nutritionPlanDay.delete({
    where: { id: dayId },
  })

  return true
}

/**
 * Add meal to nutrition plan day
 */
export async function addMealToNutritionPlanDay(
  dayId: string,
  mealId: string,
  portionMultiplier: number = 1.0,
  trainerId: string,
): Promise<
  PrismaNutritionPlanMeal & {
    meal: PrismaMeal & {
      ingredients: (PrismaMealIngredient & {
        ingredient: PrismaIngredient
      })[]
    }
  }
> {
  // Validate portion multiplier
  const validation = validatePortionMultiplier(portionMultiplier)
  if (!validation.isValid) {
    throw new GraphQLError(
      `Invalid portion multiplier: ${validation.errors.join(', ')}`,
    )
  }

  // Check access through plan
  const day = await prisma.nutritionPlanDay.findUnique({
    where: { id: dayId },
    include: {
      nutritionPlan: {
        select: { trainerId: true },
      },
    },
  })

  if (!day || day.nutritionPlan.trainerId !== trainerId) {
    throw new GraphQLError(
      'Access denied: You can only modify nutrition plans you created',
    )
  }

  // Verify meal exists
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
  })

  if (!meal) {
    throw new GraphQLError('Meal not found')
  }

  // Get next order index
  const nextOrderIndex = await prisma.nutritionPlanMeal.count({
    where: { nutritionPlanDayId: dayId },
  })

  return await prisma.nutritionPlanMeal.create({
    data: {
      nutritionPlanDayId: dayId,
      mealId,
      orderIndex: nextOrderIndex,
      portionMultiplier,
    },
    include: {
      meal: {
        include: {
          ingredients: {
            orderBy: {
              orderIndex: 'asc',
            },
            include: {
              ingredient: true,
            },
          },
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
 * Update nutrition plan meal portion
 */
export async function updateNutritionPlanMealPortion(
  planMealId: string,
  portionMultiplier: number,
  trainerId: string,
): Promise<
  PrismaNutritionPlanMeal & {
    meal: PrismaMeal
  }
> {
  // Validate portion multiplier
  const validation = validatePortionMultiplier(portionMultiplier)
  if (!validation.isValid) {
    throw new GraphQLError(
      `Invalid portion multiplier: ${validation.errors.join(', ')}`,
    )
  }

  // Check access through plan
  const planMeal = await prisma.nutritionPlanMeal.findUnique({
    where: { id: planMealId },
    include: {
      nutritionPlanDay: {
        include: {
          nutritionPlan: {
            select: { trainerId: true },
          },
        },
      },
    },
  })

  if (
    !planMeal ||
    planMeal.nutritionPlanDay.nutritionPlan.trainerId !== trainerId
  ) {
    throw new GraphQLError(
      'Access denied: You can only modify nutrition plans you created',
    )
  }

  return await prisma.nutritionPlanMeal.update({
    where: { id: planMealId },
    data: { portionMultiplier },
    include: {
      meal: {
        include: {
          ingredients: {
            orderBy: {
              orderIndex: 'asc',
            },
            include: {
              ingredient: true,
            },
          },
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
 * Remove meal from nutrition plan day
 */
export async function removeMealFromNutritionPlanDay(
  planMealId: string,
  trainerId: string,
): Promise<boolean> {
  // Check access through plan
  const planMeal = await prisma.nutritionPlanMeal.findUnique({
    where: { id: planMealId },
    include: {
      nutritionPlanDay: {
        include: {
          nutritionPlan: {
            select: { trainerId: true },
          },
        },
      },
    },
  })

  if (
    !planMeal ||
    planMeal.nutritionPlanDay.nutritionPlan.trainerId !== trainerId
  ) {
    throw new GraphQLError(
      'Access denied: You can only modify nutrition plans you created',
    )
  }

  await prisma.nutritionPlanMeal.delete({
    where: { id: planMealId },
  })

  return true
}

/**
 * Reorder meals in nutrition plan day
 */
export async function reorderNutritionPlanDayMeals(
  dayId: string,
  mealIds: string[],
  trainerId: string,
): Promise<
  (PrismaNutritionPlanMeal & {
    meal: PrismaMeal
  })[]
> {
  // Check access through plan
  const day = await prisma.nutritionPlanDay.findUnique({
    where: { id: dayId },
    include: {
      nutritionPlan: {
        select: { trainerId: true },
      },
      meals: {
        select: { id: true },
      },
    },
  })

  if (!day || day.nutritionPlan.trainerId !== trainerId) {
    throw new GraphQLError(
      'Access denied: You can only modify nutrition plans you created',
    )
  }

  // Verify all provided meal IDs exist in this day
  const existingMealIds = day.meals.map((m) => m.id)
  const invalidIds = mealIds.filter((id) => !existingMealIds.includes(id))

  if (invalidIds.length > 0) {
    throw new GraphQLError(
      `Invalid meal IDs for this day: ${invalidIds.join(', ')}`,
    )
  }

  // Update order indices
  await prisma.$transaction(
    mealIds.map((mealId, index) =>
      prisma.nutritionPlanMeal.update({
        where: { id: mealId },
        data: { orderIndex: index },
      }),
    ),
  )

  // Return updated meals
  return await prisma.nutritionPlanMeal.findMany({
    where: { nutritionPlanDayId: dayId },
    orderBy: { orderIndex: 'asc' },
    include: {
      meal: {
        include: {
          ingredients: {
            orderBy: {
              orderIndex: 'asc',
            },
            include: {
              ingredient: true,
            },
          },
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
