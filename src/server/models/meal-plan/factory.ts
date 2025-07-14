import { Prisma } from '@prisma/client'
import { endOfWeek, startOfWeek } from 'date-fns'
import { GraphQLError } from 'graphql'

import {
  GQLMutationAddCustomFoodToMealArgs,
  GQLMutationAddFoodToPersonalLogArgs,
  GQLMutationAssignMealPlanToClientArgs,
  GQLMutationBatchLogMealFoodArgs,
  GQLMutationCompleteMealArgs,
  GQLMutationCreateMealPlanArgs,
  GQLMutationDuplicateMealPlanArgs,
  GQLMutationFitspaceActivateMealPlanArgs,
  GQLMutationFitspaceDeactivateMealPlanArgs,
  GQLMutationFitspaceDeleteMealPlanArgs,
  GQLMutationRemoveMealLogArgs,
  GQLMutationRemoveMealPlanFromClientArgs,
  GQLMutationSaveMealArgs,
  GQLMutationUncompleteMealArgs,
  GQLMutationUpdateMealPlanDetailsArgs,
  GQLNotificationType,
  GQLQueryGetClientMealPlansArgs,
  GQLQueryGetMealPlanByIdArgs,
  GQLQueryGetMealPlanTemplatesArgs,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import {
  CollaborationAction,
  checkMealPlanPermission,
} from '@/lib/permissions/collaboration-permissions'
import {
  compareWeeksUTC,
  getStartOfWeekUTC,
  getWeekBoundariesUTC,
} from '@/lib/utc-date-utils'
import { GQLContext } from '@/types/gql-context'

import MealFoodLog from '../meal-food-log/model'
import { createNotification } from '../notification/factory'

import MealPlan from './model'

export async function getMealPlanTemplates(
  args: GQLQueryGetMealPlanTemplatesArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      createdById: user.user.id,
      isTemplate: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: args.limit ?? undefined,
    include: {
      createdBy: true,
      weeks: {
        orderBy: {
          weekNumber: 'asc',
        },
        include: {
          days: {
            orderBy: {
              dayOfWeek: 'asc',
            },
            include: {
              meals: {
                orderBy: {
                  dateTime: 'asc',
                },
                include: {
                  foods: {
                    orderBy: {
                      createdAt: 'asc',
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

  return mealPlans.map((plan) => new MealPlan(plan, context))
}

export async function getCollaborationMealPlanTemplates(
  args: GQLQueryGetMealPlanTemplatesArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const where: Prisma.MealPlanWhereInput = {
    isTemplate: true,
    createdById: { not: user.user.id }, // Not created by current user
    collaborators: {
      some: {
        collaboratorId: user.user.id, // Current user is a collaborator
      },
    },
  }

  if (typeof args.draft === 'boolean') {
    where.isDraft = args.draft
  }

  const mealPlans = await prisma.mealPlan.findMany({
    where,
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      createdBy: {
        include: {
          profile: true,
        },
      },
      collaborators: {
        include: {
          collaborator: {
            include: {
              profile: true,
            },
          },
        },
      },
      weeks: {
        orderBy: {
          weekNumber: 'asc',
        },
        include: {
          days: {
            orderBy: {
              dayOfWeek: 'asc',
            },
            include: {
              meals: {
                orderBy: {
                  dateTime: 'asc',
                },
                include: {
                  foods: {
                    orderBy: {
                      createdAt: 'asc',
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

  return mealPlans.map((plan) => new MealPlan(plan, context))
}

export async function getMealPlanById(
  args: GQLQueryGetMealPlanByIdArgs,
  context: GQLContext,
) {
  const { id } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Check collaboration permissions
  await checkMealPlanPermission(
    context,
    user.user.id,
    id,
    CollaborationAction.VIEW,
    'view meal plan',
  )

  try {
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
        weeks: {
          orderBy: {
            weekNumber: 'asc',
          },
          include: {
            days: {
              orderBy: {
                dayOfWeek: 'asc',
              },
              include: {
                meals: {
                  orderBy: {
                    dateTime: 'asc',
                  },
                  include: {
                    foods: {
                      orderBy: {
                        createdAt: 'asc',
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

    if (!mealPlan) {
      throw new Error('Meal plan not found')
    }

    return new MealPlan(mealPlan, context)
  } catch (error) {
    console.error(error)
    throw new Error('Meal plan not found')
  }
}

export async function getClientMealPlans(
  args: GQLQueryGetClientMealPlansArgs,
  context: GQLContext,
) {
  const { clientId } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const plans = await prisma.mealPlan.findMany({
    where: {
      assignedToId: clientId,
      createdById: user.user.id,
    },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  })

  return plans.map((plan) => new MealPlan(plan, context))
}

export async function getMyMealPlansOverview(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const plans = await prisma.mealPlan.findMany({
    where: {
      assignedToId: user.user.id,
      createdById: {
        not: user.user.id,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      createdBy: true,
      weeks: {
        orderBy: {
          weekNumber: 'asc',
        },
        include: {
          days: {
            orderBy: {
              dayOfWeek: 'asc',
            },
            include: {
              meals: {
                orderBy: {
                  dateTime: 'asc',
                },
              },
            },
          },
        },
      },
    },
  })

  const activePlan = plans.find(
    (plan) => plan.assignedToId === user.user.id && plan.active,
  )

  const availablePlans = plans.filter(
    (plan) => plan.completedAt === null && plan.active === false,
  )
  const completedPlans = plans.filter((plan) => plan.completedAt !== null)

  return {
    activePlan: activePlan ? new MealPlan(activePlan, context) : null,
    availablePlans: availablePlans.map((plan) => new MealPlan(plan, context)),
    completedPlans: completedPlans.map((plan) => new MealPlan(plan, context)),
  }
}

/**
 * Get active meal plan - returns only the active assigned plan if it exists and date is valid
 * Returns null if no active plan or date is before plan start
 */
export async function getActiveMealPlan(
  args: { date?: string | null },
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Handle date parameter - client now sends exact week start in UTC
  let weekStart: Date, weekEnd: Date

  if (args.date) {
    // Client sends exact week start in UTC, use it directly
    weekStart = new Date(args.date)
    // Calculate week end from the start
    weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000) // Add 6 days
  } else {
    // No date provided, use current week boundaries
    const { gte, lte } = getWeekBoundariesUTC(new Date())
    weekStart = gte
    weekEnd = lte
  }

  // Get active assigned plan OR completed plans within the requested date range
  const activePlan = await prisma.mealPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      startDate: { not: null },
      OR: [
        {
          // Active plans that have started by the requested date
          active: true,
          startDate: { lte: weekEnd },
        },
        {
          // Completed plans where requested date is within range
          active: false,
          endDate: { not: null, gte: weekStart },
          startDate: { lte: weekEnd },
        },
      ],
    },
    include: {
      createdBy: true,
      assignedTo: true,
      weeks: {
        orderBy: { weekNumber: 'asc' },
        include: {
          days: {
            orderBy: { dayOfWeek: 'asc' },
            include: {
              meals: {
                orderBy: { dateTime: 'asc' },
                include: {
                  foods: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                      addedBy: true, // Include the user who added the food
                      logs: {
                        orderBy: { loggedAt: 'desc' },
                        include: {
                          user: true,
                          mealFood: true, // Include the mealFood relationship
                        },
                      },
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

  // If no active plan, return null
  if (!activePlan) {
    return null
  }

  // Check if requested date is before plan start date (using UTC)
  if (args.date && activePlan.startDate) {
    if (compareWeeksUTC(args.date, activePlan.startDate) < 0) {
      return null // Use default plan instead
    }
  }

  return new MealPlan(activePlan, context)
}

/**
 * Always returns user's Personal Food Log (default plan)
 */
export async function getDefaultMealPlan(
  args: { date?: string | null },
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const defaultPlan = await getOrCreateDefaultMealPlan(
    context,
    args.date || undefined,
  )
  return defaultPlan
}

export async function createMealPlan(
  args: GQLMutationCreateMealPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { title, description, isPublic, isDraft, weeks, ...nutrition } =
    args.input

  try {
    const mealPlan = await prisma.mealPlan.create({
      data: {
        title,
        description,
        isPublic: isPublic ?? false,
        isTemplate: true,
        isDraft: isDraft ?? false,
        ...nutrition,
        createdById: user.user.id,
        weeks: {
          create: weeks?.map((week) => ({
            weekNumber: week.weekNumber,
            name: week.name,
            description: week.description,
            days: {
              create: week.days?.map((day) => ({
                dayOfWeek: day.dayOfWeek,
                targetCalories: day.targetCalories,
                targetProtein: day.targetProtein,
                targetCarbs: day.targetCarbs,
                targetFat: day.targetFat,
                meals: {
                  create: day.meals?.map((meal) => ({
                    name: meal.name,
                    dateTime: new Date(meal.dateTime),
                    instructions: meal.instructions,
                    foods: {
                      create: meal.foods?.map((food) => ({
                        name: food.name,
                        quantity: food.quantity,
                        unit: food.unit,
                        addedAt: new Date(), // Always set addedAt for new foods
                        caloriesPer100g: food.caloriesPer100g,
                        proteinPer100g: food.proteinPer100g,
                        carbsPer100g: food.carbsPer100g,
                        fatPer100g: food.fatPer100g,
                        fiberPer100g: food.fiberPer100g,
                        openFoodFactsId: food.openFoodFactsId,
                        productData: food.productData
                          ? JSON.parse(food.productData)
                          : null,
                      })),
                    },
                  })),
                },
              })),
            },
          })),
        },
      },
    })

    return {
      id: mealPlan.id,
      success: true,
    }
  } catch (error) {
    console.error('Error creating meal plan:', error)
    throw new GraphQLError('Failed to create meal plan')
  }
}

export async function assignMealPlanToClient(
  args: GQLMutationAssignMealPlanToClientArgs,
  context: GQLContext,
) {
  const { clientId, planId, startDate } = args.input
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Check collaboration permissions
  await checkMealPlanPermission(
    context,
    user.user.id,
    planId,
    CollaborationAction.SHARE,
    'assign meal plan to client',
  )

  try {
    // Get the template plan
    const templatePlan = await getMealPlanById({ id: planId }, context)

    // Duplicate the plan for the client
    const duplicatedPlan = await duplicateMealPlan({ id: planId }, context)

    // Assign to client
    await prisma.mealPlan.update({
      where: { id: duplicatedPlan },
      data: {
        assignedToId: clientId,
        isTemplate: false,
        isDraft: false,
        startDate: startDate ? new Date(startDate) : null,
      },
    })

    // Create notification
    const senderName =
      user.user.profile?.firstName &&
      user.user.profile?.lastName &&
      `${user.user.profile.firstName} ${user.user.profile.lastName}`

    await createNotification(
      {
        createdBy: user.user.id,
        userId: clientId,
        relatedItemId: duplicatedPlan,
        message: `New meal plan "${templatePlan.title}" has been assigned to you${senderName ? ` by ${senderName}` : ''}.`,
        type: GQLNotificationType.NewMealPlanAssigned,
      },
      context,
    )

    return true
  } catch (error) {
    console.error('Error assigning meal plan:', error)
    throw new GraphQLError('Failed to assign meal plan')
  }
}

export async function removeMealPlanFromClient(
  args: GQLMutationRemoveMealPlanFromClientArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  const { planId, clientId } = args

  // Check collaboration permissions
  await checkMealPlanPermission(
    context,
    user.user.id,
    planId,
    CollaborationAction.DELETE,
    'remove meal plan from client',
  )

  try {
    // Get the meal plan with weeks to check the constraint
    const mealPlan = await prisma.mealPlan.findUnique({
      where: {
        id: planId,
        assignedToId: clientId,
        isTemplate: false,
      },
      include: {
        weeks: {
          select: {
            id: true,
            weekNumber: true,
          },
        },
      },
    })

    if (!mealPlan) {
      throw new Error('Meal plan not found or unauthorized')
    }

    // Check if the plan has only 1 week (business rule)
    if (mealPlan.weeks.length > 1) {
      throw new Error('Cannot remove meal plan with more than 1 week')
    }

    // Delete the meal plan
    await prisma.mealPlan.delete({
      where: {
        id: planId,
        assignedToId: clientId,
        isTemplate: false,
      },
    })

    return true
  } catch (error) {
    console.error('Error removing meal plan:', error)
    throw new GraphQLError('Failed to remove meal plan')
  }
}

export async function duplicateMealPlan(
  args: GQLMutationDuplicateMealPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  // Check collaboration permissions - only ADMIN level users can duplicate plans
  await checkMealPlanPermission(
    context,
    user.user.id,
    args.id,
    CollaborationAction.MANAGE_COLLABORATORS,
    'duplicate meal plan',
  )

  try {
    // Get the original plan with all nested data (raw Prisma data)
    const originalPlanData = await prisma.mealPlan.findUnique({
      where: { id: args.id },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                meals: {
                  include: {
                    foods: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!originalPlanData) {
      throw new Error('Meal plan not found')
    }

    // Create duplicate
    const duplicatedPlan = await prisma.mealPlan.create({
      data: {
        title: originalPlanData.title,
        description: originalPlanData.description,
        isPublic: false,
        isTemplate: true,
        isDraft: true,
        dailyCalories: originalPlanData.dailyCalories,
        dailyProtein: originalPlanData.dailyProtein,
        dailyCarbs: originalPlanData.dailyCarbs,
        dailyFat: originalPlanData.dailyFat,
        createdById: user.user.id,
        weeks: {
          create: originalPlanData.weeks.map((week) => ({
            weekNumber: week.weekNumber,
            name: week.name,
            description: week.description,
            days: {
              create:
                week.days?.map((day) => ({
                  dayOfWeek: day.dayOfWeek,
                  targetCalories: day.targetCalories,
                  targetProtein: day.targetProtein,
                  targetCarbs: day.targetCarbs,
                  targetFat: day.targetFat,
                  meals: {
                    create: day.meals.map((meal) => ({
                      name: meal.name,
                      dateTime: meal.dateTime,
                      instructions: meal.instructions,
                      foods: {
                        create: meal.foods.map((food) => ({
                          name: food.name,
                          quantity: food.quantity,
                          unit: food.unit,
                          addedAt: new Date(), // Always set addedAt for new foods
                          caloriesPer100g: food.caloriesPer100g,
                          proteinPer100g: food.proteinPer100g,
                          carbsPer100g: food.carbsPer100g,
                          fatPer100g: food.fatPer100g,
                          fiberPer100g: food.fiberPer100g,
                          openFoodFactsId: food.openFoodFactsId,
                          productData: food.productData
                            ? JSON.parse(food.productData as string)
                            : undefined,
                        })),
                      },
                    })),
                  },
                })) || [],
            },
          })),
        },
      },
    })

    return duplicatedPlan.id
  } catch (error) {
    console.error('Error duplicating meal plan:', error)
    throw new GraphQLError('Failed to duplicate meal plan')
  }
}

export async function createDraftMealTemplate(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  try {
    const mealPlan = await prisma.mealPlan.create({
      data: {
        title: 'Untitled Meal Plan',
        description: '',
        isPublic: false,
        isTemplate: true,
        isDraft: true,
        createdById: user.user.id,
        weeks: {
          create: {
            weekNumber: 1,
            name: 'Week 1',
            description: '',
            days: {
              create: Array.from({ length: 7 }, (_, dayIndex) => ({
                dayOfWeek: dayIndex, // 0 = Monday, 6 = Sunday
                meals: {
                  create: [
                    {
                      name: 'Breakfast',
                      dateTime: new Date(`2024-01-01T08:00:00.000Z`),
                      foods: { create: [] },
                    },
                    {
                      name: 'Lunch',
                      dateTime: new Date(`2024-01-01T12:00:00.000Z`),
                      foods: { create: [] },
                    },
                    {
                      name: 'Dinner',
                      dateTime: new Date(`2024-01-01T18:00:00.000Z`),
                      foods: { create: [] },
                    },
                  ],
                },
              })),
            },
          },
        },
      },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                meals: {
                  include: {
                    foods: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return new MealPlan(mealPlan, context)
  } catch (error) {
    console.error('Error creating draft meal template:', error)
    throw new GraphQLError('Failed to create draft meal template')
  }
}

/**
 * Creates the default meal plan structure data for Personal Food Log
 * This utility function can be reused when creating or recreating default meal plans
 */
function createDefaultMealPlanData(userId: string) {
  return {
    title: 'Personal Food Log',
    description: 'Your personal food logging space',
    isPublic: false,
    isTemplate: false,
    isDraft: false,
    active: false, // Not active by default
    createdById: userId,
    assignedToId: userId,
    weeks: {
      create: {
        weekNumber: 1,
        name: 'Default Week',
        description: 'Default meal structure for daily logging',
        days: {
          create: Array.from({ length: 7 }, (_, dayIndex) => ({
            dayOfWeek: dayIndex, // 0 = Monday, 6 = Sunday
            meals: {
              create: [
                {
                  name: 'Breakfast',
                  dateTime: new Date(`2024-01-01T08:00:00.000Z`),
                  foods: { create: [] },
                },
                {
                  name: 'Lunch',
                  dateTime: new Date(`2024-01-01T12:00:00.000Z`),
                  foods: { create: [] },
                },
                {
                  name: 'Dinner',
                  dateTime: new Date(`2024-01-01T18:00:00.000Z`),
                  foods: { create: [] },
                },
                {
                  name: 'Snack',
                  dateTime: new Date(`2024-01-01T15:00:00.000Z`),
                  foods: { create: [] },
                },
                {
                  name: 'Supper',
                  dateTime: new Date(`2024-01-01T20:00:00.000Z`),
                  foods: { create: [] },
                },
              ],
            },
          })),
        },
      },
    },
  }
}

/**
 * Creates a new default meal plan with the standard meal structure
 * This function can be called when we need to create or recreate a default meal plan
 */
async function createDefaultMealPlan(
  context: GQLContext,
  userId: string,
  dateFilter?: string,
) {
  const weekStart = startOfWeek(new Date(dateFilter ?? ''), {
    weekStartsOn: 1,
  })
  const weekEnd = endOfWeek(new Date(dateFilter ?? ''), {
    weekStartsOn: 1,
  })

  const defaultMealPlan = await prisma.mealPlan.create({
    data: createDefaultMealPlanData(userId),
    include: {
      createdBy: true,
      assignedTo: true,
      weeks: {
        orderBy: {
          weekNumber: 'asc',
        },
        include: {
          days: {
            orderBy: {
              dayOfWeek: 'asc',
            },
            include: {
              meals: {
                orderBy: {
                  dateTime: 'asc',
                },
                include: {
                  foods: {
                    include: {
                      addedBy: true, // Include the user who added the food
                      logs: {
                        where: {
                          loggedAt: dateFilter
                            ? {
                                gte: weekStart,
                                lte: weekEnd,
                              }
                            : undefined,
                        },
                        orderBy: { loggedAt: 'desc' },
                        include: {
                          user: true,
                        },
                      },
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

  return defaultMealPlan
}

/**
 * Get or create a default meal plan for users without active meal plans
 * This allows users to log meals even when they don't have a structured meal plan
 */
export async function getOrCreateDefaultMealPlan(
  context: GQLContext,
  dateFilter?: string,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const weekStart = startOfWeek(new Date(dateFilter ?? ''), {
    weekStartsOn: 1,
  })
  const weekEnd = endOfWeek(new Date(dateFilter ?? ''), {
    weekStartsOn: 1,
  })

  try {
    // Check if user already has a default meal plan with more robust criteria
    let defaultMealPlan = await prisma.mealPlan.findFirst({
      where: {
        createdById: user.user.id,
        assignedToId: user.user.id,
        isTemplate: false,
        isDraft: false,
        active: false,
        title: 'Personal Food Log', // Unique identifier for default plans
      },
      include: {
        createdBy: true,
        assignedTo: true,
        weeks: {
          orderBy: {
            weekNumber: 'asc',
          },
          include: {
            days: {
              orderBy: {
                dayOfWeek: 'asc',
              },
              include: {
                meals: {
                  orderBy: {
                    dateTime: 'asc',
                  },
                  include: {
                    foods: {
                      where: dateFilter
                        ? {
                            addedAt: {
                              gte: weekStart,
                              lte: weekEnd,
                            },
                          }
                        : undefined,
                      orderBy: {
                        addedAt: 'asc',
                      },
                      include: {
                        addedBy: true, // Include the user who added the food
                        logs: {
                          where: {
                            loggedAt: dateFilter
                              ? {
                                  gte: weekStart,
                                  lte: weekEnd,
                                }
                              : undefined,
                          },
                          orderBy: { loggedAt: 'desc' },
                          include: {
                            user: true,
                            mealFood: true, // Include the mealFood relationship
                          },
                        },
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

    if (!defaultMealPlan) {
      // Create new default meal plan with error handling
      try {
        defaultMealPlan = await createDefaultMealPlan(
          context,
          user.user.id,
          dateFilter,
        )
      } catch (createError) {
        // If creation fails (e.g., due to race condition), try to fetch existing plan
        const existingPlan = await prisma.mealPlan.findFirst({
          where: {
            createdById: user.user.id,
            assignedToId: user.user.id,
            isTemplate: false,
            isDraft: false,
            active: false,
            title: 'Personal Food Log',
          },
          include: {
            createdBy: true,
            assignedTo: true,
            weeks: {
              orderBy: { weekNumber: 'asc' },
              include: {
                days: {
                  orderBy: { dayOfWeek: 'asc' },
                  include: {
                    meals: {
                      orderBy: { dateTime: 'asc' },
                      include: {
                        foods: {
                          where: dateFilter
                            ? {
                                addedAt: {
                                  gte: weekStart,
                                  lte: weekEnd,
                                },
                              }
                            : undefined,
                          orderBy: {
                            addedAt: 'asc',
                          },
                          include: {
                            addedBy: true, // Include the user who added the food
                            logs: {
                              where: {
                                loggedAt: dateFilter
                                  ? {
                                      gte: weekStart,
                                      lte: weekEnd,
                                    }
                                  : undefined,
                              },
                              orderBy: { loggedAt: 'desc' },
                              include: {
                                user: true,
                                mealFood: true, // Include the mealFood relationship
                              },
                            },
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

        if (existingPlan) {
          defaultMealPlan = existingPlan
        } else {
          throw createError // Re-throw if we still can't find/create the plan
        }
      }
    }

    // Check if default meal plan has empty meals for every day and recreate if necessary
    const hasEmptyMeals = defaultMealPlan.weeks.every((week) =>
      week.days.every((day) => day.meals.length === 0),
    )

    if (hasEmptyMeals) {
      // Delete the current empty meal plan and create a new one
      await prisma.mealPlan.delete({
        where: { id: defaultMealPlan.id },
      })

      // Create a new default meal plan with proper structure
      defaultMealPlan = await createDefaultMealPlan(
        context,
        user.user.id,
        dateFilter,
      )
    }

    return new MealPlan(defaultMealPlan, context)
  } catch (error) {
    console.error('Error getting or creating default meal plan:', error)
    throw new GraphQLError('Failed to get or create default meal plan')
  }
}

// New batch meal operation - replaces individual food mutations
export async function saveMeal(
  args: GQLMutationSaveMealArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  try {
    const { input } = args
    const { dayId, hour, foods } = input

    // Verify that the day exists and get plan ID for permission check
    const day = await prisma.mealDay.findUnique({
      where: { id: dayId },
      include: {
        week: {
          include: {
            plan: { select: { id: true } },
          },
        },
        meals: {
          include: {
            foods: true,
          },
        },
      },
    })

    if (!day) {
      throw new Error('Day not found')
    }

    // Check collaboration permissions
    await checkMealPlanPermission(
      context,
      user.user.id,
      day.week.plan.id,
      CollaborationAction.EDIT,
      'save meal',
    )

    // Create the target datetime for this hour
    const mealDateTime = new Date(new Date().setHours(hour, 0, 0, 0))

    // Find or create meal for this hour
    let meal = day.meals.find((m) => new Date(m.dateTime).getHours() === hour)

    if (!meal) {
      // Create new meal with smart naming
      const mealName =
        hour >= 6 && hour < 11
          ? 'Breakfast'
          : hour >= 11 && hour < 16
            ? 'Lunch'
            : hour >= 16 && hour < 21
              ? 'Dinner'
              : 'Snack'

      meal = await prisma.meal.create({
        data: {
          dayId: dayId,
          name: mealName,
          dateTime: mealDateTime,
        },
        include: {
          foods: true,
        },
      })
    }

    // Get current food IDs
    const existingFoodIds = meal.foods.map((f) => f.id)
    const providedFoodIds = foods.filter((f) => f.id).map((f) => f.id!)

    // Remove foods that are no longer in the list
    for (const foodId of existingFoodIds) {
      if (!providedFoodIds.includes(foodId)) {
        await prisma.mealFood.delete({
          where: { id: foodId },
        })
      }
    }

    // Add or update foods
    for (const food of foods) {
      if (food.id) {
        // Update existing food
        await prisma.mealFood.update({
          where: { id: food.id },
          data: {
            name: food.name,
            quantity: food.quantity,
            unit: food.unit,
            caloriesPer100g: food.caloriesPer100g,
            proteinPer100g: food.proteinPer100g,
            carbsPer100g: food.carbsPer100g,
            fatPer100g: food.fatPer100g,
            fiberPer100g: food.fiberPer100g,
            openFoodFactsId: food.openFoodFactsId,
            productData: food.productData ? JSON.parse(food.productData) : null,
          },
        })
      } else {
        // Add new food
        await prisma.mealFood.create({
          data: {
            mealId: meal.id,
            name: food.name,
            quantity: food.quantity,
            unit: food.unit,
            addedAt: new Date(), // Always set addedAt for new foods
            caloriesPer100g: food.caloriesPer100g,
            proteinPer100g: food.proteinPer100g,
            carbsPer100g: food.carbsPer100g,
            fatPer100g: food.fatPer100g,
            fiberPer100g: food.fiberPer100g,
            openFoodFactsId: food.openFoodFactsId,
            productData: food.productData ? JSON.parse(food.productData) : null,
          },
        })
      }
    }
    // Remove all meals that are empty now
    await prisma.meal.deleteMany({
      where: {
        foods: {
          none: {},
        },
      },
    })

    return true
  } catch (error) {
    console.error('Error saving meal:', error)
    throw new GraphQLError('Failed to save meal')
  }
}

export async function updateMealPlanDetails(
  args: GQLMutationUpdateMealPlanDetailsArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { id, ...updateData } = args.input

  // Check collaboration permissions
  await checkMealPlanPermission(
    context,
    user.user.id,
    id,
    CollaborationAction.EDIT,
    'update meal plan details',
  )

  try {
    // Verify the meal plan exists
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id },
    })

    if (!mealPlan) {
      throw new Error('Meal plan not found')
    }

    // Filter out null values and create update data
    const filteredUpdateData: Prisma.MealPlanUpdateInput = {
      title: updateData.title ?? undefined,
      description: updateData.description ?? undefined,
      isPublic: updateData.isPublic ?? undefined,
      isDraft: updateData.isDraft ?? undefined,
      dailyCalories: updateData.dailyCalories,
      dailyProtein: updateData.dailyProtein,
      dailyCarbs: updateData.dailyCarbs,
      dailyFat: updateData.dailyFat,
    }

    // Update the meal plan details
    await prisma.mealPlan.update({
      where: { id },
      data: filteredUpdateData,
    })

    return true
  } catch (error) {
    console.error('Error updating meal plan details:', error)
    throw new Error('Failed to update meal plan details')
  }
}

/**
 * Activate a meal plan for a client
 */
export async function fitspaceActivateMealPlan(
  args: GQLMutationFitspaceActivateMealPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { planId } = args

  // Verify the meal plan exists and belongs to the user
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: planId },
  })

  if (!mealPlan) {
    throw new Error('Meal plan not found')
  }

  if (mealPlan.assignedToId !== user.user.id) {
    throw new Error('You can only activate your own meal plans')
  }

  // Deactivate all other meal plans for this user
  await prisma.mealPlan.updateMany({
    where: {
      assignedToId: user.user.id,
      active: true,
    },
    data: {
      active: false,
    },
  })

  // Activate the selected meal plan
  await prisma.mealPlan.update({
    where: { id: planId },
    data: {
      active: true,
      startDate: getStartOfWeekUTC(new Date()),
    },
  })

  return true
}

/**
 * Deactivate a meal plan for a client
 */
export async function fitspaceDeactivateMealPlan(
  args: GQLMutationFitspaceDeactivateMealPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { planId } = args

  // Verify the meal plan exists and belongs to the user
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: planId },
  })

  if (!mealPlan) {
    throw new Error('Meal plan not found')
  }

  if (mealPlan.assignedToId !== user.user.id) {
    throw new Error('You can only deactivate your own meal plans')
  }

  // Deactivate the meal plan
  await prisma.mealPlan.update({
    where: { id: planId },
    data: {
      active: false,
    },
  })

  return true
}

/**
 * Delete a meal plan for a client
 */
export async function fitspaceDeleteMealPlan(
  args: GQLMutationFitspaceDeleteMealPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { planId } = args

  // Verify the meal plan exists and belongs to the user
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: planId },
  })

  if (!mealPlan) {
    throw new Error('Meal plan not found')
  }

  if (mealPlan.assignedToId !== user.user.id) {
    throw new Error('You can only delete your own meal plans')
  }

  // Delete the meal plan (cascade will handle related records)
  await prisma.mealPlan.delete({
    where: { id: planId },
  })

  return true
}

/**
 * Batch log multiple meal foods in a single transaction
 * Updates existing log items or creates new ones (upsert behavior)
 */
export async function batchLogMealFood(
  args: GQLMutationBatchLogMealFoodArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { input } = args

  try {
    // Check if meal exists and belongs to user's meal plan
    const meal = await prisma.meal.findUnique({
      where: { id: input.mealId },
      include: {
        foods: true, // Include planned foods for matching
        day: {
          include: {
            week: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    })

    if (!meal) {
      throw new Error('Meal not found')
    }

    if (meal.day.week.plan.assignedToId !== user.user.id) {
      throw new Error('You can only log your own meals')
    }

    const isDefaultPlan =
      meal.day.week.plan.assignedToId === user.user.id &&
      meal.day.week.plan.createdById === user.user.id

    // Use a transaction to ensure all foods are logged atomically
    await prisma.$transaction(async (tx) => {
      // Process each food in the batch
      for (const food of input.foods) {
        // Find existing planned food to link to (optional)
        let mealFood = meal.foods.find(
          (mf) => mf.name.toLowerCase() === food.name.toLowerCase(),
        )

        // If no planned food exists, create one (for custom additions)
        if (!mealFood) {
          mealFood = await tx.mealFood.create({
            data: {
              mealId: meal.id,
              name: food.name,
              quantity: food.quantity,
              unit: food.unit,
              // Use the date from loggedAt (which contains the week context date) but at a consistent time
              addedAt: input.loggedAt
                ? new Date(new Date(input.loggedAt).toDateString())
                : new Date(),
              addedById: user.user.id,
              // Calculate per100g values from absolute values if possible
              caloriesPer100g:
                food.calories && food.quantity > 0
                  ? (food.calories * 100) / food.quantity
                  : null,
              proteinPer100g:
                food.protein && food.quantity > 0
                  ? (food.protein * 100) / food.quantity
                  : null,
              carbsPer100g:
                food.carbs && food.quantity > 0
                  ? (food.carbs * 100) / food.quantity
                  : null,
              fatPer100g:
                food.fat && food.quantity > 0
                  ? (food.fat * 100) / food.quantity
                  : null,
              fiberPer100g:
                food.fiber && food.quantity > 0
                  ? (food.fiber * 100) / food.quantity
                  : null,
              openFoodFactsId: food.openFoodFactsId ?? undefined,
              productData: food.productData
                ? JSON.parse(food.productData)
                : null,
            },
          })
        }

        // Create food log entry
        await tx.mealFoodLog.create({
          data: {
            mealFoodId: mealFood.id,
            userId: user.user.id,
            quantity: food.quantity,
            unit: food.unit,
            loggedAt: input.loggedAt ? new Date(input.loggedAt) : new Date(),
            notes: food.notes ?? undefined,
            calories: food.calories ?? undefined,
            protein: food.protein ?? undefined,
            carbs: food.carbs ?? undefined,
            fat: food.fat ?? undefined,
            fiber: food.fiber ?? undefined,
          },
        })
      }

      if (!isDefaultPlan) {
        await tx.meal.update({
          where: { id: meal.id },
          data: { completedAt: new Date() },
        })
      }
    })

    return true
  } catch (error) {
    console.error('Error batch logging meal foods:', error)
    throw new GraphQLError('Failed to batch log meal foods')
  }
}

/**
 * Mark a meal as completed
 */
export async function completeMeal(
  args: GQLMutationCompleteMealArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { mealId } = args

  try {
    // Check if meal exists and belongs to user's meal plan
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        day: {
          include: {
            week: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    })

    if (!meal) {
      throw new Error('Meal not found')
    }

    if (meal.day.week.plan.assignedToId !== user.user.id) {
      throw new Error('You can only complete your own meals')
    }

    await prisma.meal.update({
      where: { id: mealId },
      data: { completedAt: new Date() },
    })

    return true
  } catch (error) {
    console.error('Error completing meal:', error)
    throw new GraphQLError('Failed to complete meal')
  }
}

/**
 * Mark a meal as uncompleted
 */
export async function uncompleteMeal(
  args: GQLMutationUncompleteMealArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { mealId } = args

  try {
    // Check if meal exists and belongs to user's meal plan
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        day: {
          include: {
            week: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    })

    if (!meal) {
      throw new Error('Meal not found')
    }

    if (meal.day.week.plan.assignedToId !== user.user.id) {
      throw new Error('You can only uncomplete your own meals')
    }

    await prisma.meal.update({
      where: { id: mealId },
      data: { completedAt: null },
    })

    return true
  } catch (error) {
    console.error('Error uncompleting meal:', error)
    throw new GraphQLError('Failed to uncomplete meal')
  }
}

/**
 * Add a custom food to a meal (creates a MealLogItem with isCustomAddition = true)
 * Restricted to default plans only - users cannot modify assigned meal plans
 */
export async function addCustomFoodToMeal(
  args: GQLMutationAddCustomFoodToMealArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { input } = args

  try {
    // Check if meal exists and belongs to user's meal plan
    const meal = await prisma.meal.findUnique({
      where: { id: input.mealId },
      include: {
        day: {
          include: {
            week: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    })

    if (!meal) {
      throw new Error('Meal not found')
    }

    if (meal.day.week.plan.assignedToId !== user.user.id) {
      throw new Error('You can only add foods to your own meals')
    }

    // Restrict to default plans only - users cannot modify assigned meal plans
    if (meal.day.week.plan.title !== 'Personal Food Log') {
      throw new Error(
        'Cannot add custom foods to assigned meal plans. Use addFoodToPersonalLog instead.',
      )
    }

    // Create meal food record for custom food
    const mealFood = await prisma.mealFood.create({
      data: {
        mealId: meal.id,
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        // Use the date from loggedAt (which contains the week context date) but at a consistent time
        addedAt: input.loggedAt
          ? new Date(new Date(input.loggedAt).toDateString())
          : new Date(),
        addedById: user.user.id,
        caloriesPer100g: input.caloriesPer100g,
        proteinPer100g: input.proteinPer100g,
        carbsPer100g: input.carbsPer100g,
        fatPer100g: input.fatPer100g,
        fiberPer100g: input.fiberPer100g,
        openFoodFactsId: input.openFoodFactsId,
        productData: input.productData ? JSON.parse(input.productData) : null,
      },
    })

    // Calculate nutritional data from per100g values
    const factor = input.quantity / 100
    const calories = input.caloriesPer100g
      ? input.caloriesPer100g * factor
      : null
    const protein = input.proteinPer100g ? input.proteinPer100g * factor : null
    const carbs = input.carbsPer100g ? input.carbsPer100g * factor : null
    const fat = input.fatPer100g ? input.fatPer100g * factor : null
    const fiber = input.fiberPer100g ? input.fiberPer100g * factor : null

    // Create meal food log entry
    const mealFoodLog = await prisma.mealFoodLog.create({
      data: {
        mealFoodId: mealFood.id,
        userId: user.user.id,
        quantity: input.quantity,
        unit: input.unit,
        loggedAt: input.loggedAt ? new Date(input.loggedAt) : new Date(),
        notes: input.notes,
        calories,
        protein,
        carbs,
        fat,
        fiber,
      },
      include: {
        mealFood: true, // Include the mealFood relationship
        user: true, // Include the user relationship
      },
    })

    return new MealFoodLog(mealFoodLog, context)
  } catch (error) {
    console.error('Error adding custom food to meal:', error)
    throw new GraphQLError('Failed to add custom food to meal')
  }
}

/**
 * Add a food directly to user's Personal Food Log
 * This is used when users want to track additional foods beyond their assigned meal plan
 */
export async function addFoodToPersonalLog(
  args: GQLMutationAddFoodToPersonalLogArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { input } = args

  try {
    // Get or create user's default "Personal Food Log" plan
    const defaultPlan = await getOrCreateDefaultMealPlan(context)

    // Find the specific meal in the default plan
    const meal = await prisma.meal.findFirst({
      where: {
        name: input.mealName,
        day: {
          dayOfWeek: input.dayOfWeek,
          week: {
            plan: {
              id: defaultPlan.id,
            },
          },
        },
      },
    })

    if (!meal) {
      throw new Error(
        `Meal "${input.mealName}" not found for day ${input.dayOfWeek} in your Personal Food Log`,
      )
    }

    // Create meal food record for custom food
    const mealFood = await prisma.mealFood.create({
      data: {
        mealId: meal.id,
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        // Use the date from loggedAt (which contains the week context date) but at a consistent time
        addedAt: input.loggedAt
          ? new Date(new Date(input.loggedAt).toDateString())
          : new Date(),
        addedById: user.user.id,
        caloriesPer100g: input.caloriesPer100g,
        proteinPer100g: input.proteinPer100g,
        carbsPer100g: input.carbsPer100g,
        fatPer100g: input.fatPer100g,
        fiberPer100g: input.fiberPer100g,
        openFoodFactsId: input.openFoodFactsId,
        productData: input.productData ? JSON.parse(input.productData) : null,
      },
    })

    // Calculate nutritional data from per100g values
    const factor = input.quantity / 100
    const calories = input.caloriesPer100g
      ? input.caloriesPer100g * factor
      : null
    const protein = input.proteinPer100g ? input.proteinPer100g * factor : null
    const carbs = input.carbsPer100g ? input.carbsPer100g * factor : null
    const fat = input.fatPer100g ? input.fatPer100g * factor : null
    const fiber = input.fiberPer100g ? input.fiberPer100g * factor : null

    // Create meal food log entry
    const mealFoodLog = await prisma.mealFoodLog.create({
      data: {
        mealFoodId: mealFood.id,
        userId: user.user.id,
        quantity: input.quantity,
        unit: input.unit,
        loggedAt: input.loggedAt ? new Date(input.loggedAt) : new Date(),
        notes: input.notes,
        calories,
        protein,
        carbs,
        fat,
        fiber,
      },
      include: {
        mealFood: true, // Include the mealFood relationship
        user: true, // Include the user relationship
      },
    })

    return new MealFoodLog(mealFoodLog, context)
  } catch (error) {
    console.error('Error adding food to personal log:', error)
    throw new GraphQLError('Failed to add food to personal log')
  }
}

export async function removeMealLog(
  args: GQLMutationRemoveMealLogArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { foodId } = args

  try {
    // First, get the meal food to understand its type and verify ownership
    const mealFood = await prisma.mealFood.findUnique({
      where: { id: foodId },
      include: {
        meal: {
          include: {
            day: {
              include: {
                week: {
                  include: {
                    plan: true,
                  },
                },
              },
            },
          },
        },
        logs: {
          where: {
            userId: user.user.id, // Only logs by the current user
          },
        },
      },
    })

    if (!mealFood) {
      throw new Error('Food not found')
    }

    // Verify the user has access to this meal plan
    if (mealFood.meal.day.week.plan.assignedToId !== user.user.id) {
      throw new Error('You can only remove foods from your own meals')
    }

    // If it's a custom addition (added by the user), delete the entire MealFood
    // This will cascade delete all associated MealFoodLog entries
    if (mealFood.addedById === user.user.id) {
      await prisma.mealFood.delete({
        where: { id: foodId },
      })
    } else {
      // If it's a planned food, just delete the user's log entries
      await prisma.mealFoodLog.deleteMany({
        where: {
          mealFoodId: foodId,
          userId: user.user.id,
        },
      })
    }

    return true
  } catch (error) {
    console.error('Error removing meal log:', error)
    throw new GraphQLError('Failed to remove meal log')
  }
}
