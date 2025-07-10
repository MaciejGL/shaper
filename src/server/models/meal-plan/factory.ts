import { Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

import {
  GQLMutationAssignMealPlanToClientArgs,
  GQLMutationCreateMealPlanArgs,
  GQLMutationDuplicateMealPlanArgs,
  GQLMutationRemoveMealPlanFromClientArgs,
  GQLMutationSaveMealArgs,
  GQLMutationUpdateMealPlanDetailsArgs,
  GQLNotificationType,
  GQLQueryGetClientActiveMealPlanArgs,
  GQLQueryGetClientMealPlansArgs,
  GQLQueryGetMealPlanByIdArgs,
  GQLQueryGetMealPlanTemplatesArgs,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import {
  CollaborationAction,
  checkMealPlanPermission,
} from '@/lib/permissions/collaboration-permissions'
import { GQLContext } from '@/types/gql-context'

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
                    logs: {
                      include: {
                        user: true,
                        items: true,
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
      startDate: null,
    },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  })

  return plans.map((plan) => new MealPlan(plan, context))
}

export async function getClientActiveMealPlan(
  args: GQLQueryGetClientActiveMealPlanArgs,
  context: GQLContext,
) {
  const { clientId } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const plan = await prisma.mealPlan.findFirst({
    where: {
      assignedToId: clientId,
      createdById: user.user.id,
      startDate: { not: null },
      active: true,
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
                    orderBy: {
                      createdAt: 'asc',
                    },
                  },
                  logs: {
                    include: {
                      user: true,
                      items: true,
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

  return plan ? new MealPlan(plan, context) : null
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
                include: {
                  foods: {
                    orderBy: {
                      createdAt: 'asc',
                    },
                  },
                  logs: {
                    include: {
                      items: true,
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
    throw new GraphQLError('Failed to update meal plan details')
  }
}
