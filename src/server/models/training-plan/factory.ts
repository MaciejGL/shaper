import { prisma } from '@lib/db'
import { Prisma } from '@prisma/client'
import { addDays, addWeeks, differenceInCalendarDays } from 'date-fns'
import { GraphQLError } from 'graphql'

import {
  GQLMutationActivatePlanArgs,
  GQLMutationClosePlanArgs,
  GQLMutationDeletePlanArgs,
  GQLMutationExtendPlanArgs,
  GQLMutationPausePlanArgs,
  GQLQueryGetClientActivePlanArgs,
  GQLQueryGetWorkoutArgs,
} from '@/generated/graphql-client'
import {
  GQLMutationAssignTrainingPlanToClientArgs,
  GQLMutationCreateTrainingPlanArgs,
  GQLMutationDeleteTrainingPlanArgs,
  GQLMutationDuplicateTrainingPlanArgs,
  GQLMutationRemoveTrainingPlanFromClientArgs,
  GQLMutationUpdateTrainingPlanArgs,
  GQLNotificationType,
  GQLQueryGetClientTrainingPlansArgs,
  GQLQueryGetTemplatesArgs,
  GQLQueryGetTrainingPlanByIdArgs,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import { createNotification } from '../notification/factory'
import { duplicatePlan, getFullPlanById } from '../training-utils.server'

import TrainingPlan from './model'

export async function getTrainingPlanById(
  args: GQLQueryGetTrainingPlanByIdArgs,
  context: GQLContext,
) {
  const { id } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  try {
    const trainingPlan = await prisma.trainingPlan.findUnique({
      where: {
        id,
        OR: [
          { createdById: user.user.id },
          { assignedToId: user.user.id },
          { isPublic: true },
        ],
      },
      include: {
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
                exercises: {
                  orderBy: {
                    order: 'asc',
                  },
                  include: {
                    base: {
                      select: {
                        videoUrl: true,
                        muscleGroups: true,
                      },
                    },
                    sets: {
                      orderBy: {
                        order: 'asc',
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

    if (!trainingPlan) {
      throw new Error('Training plan not found')
    }

    if (
      trainingPlan.isTemplate &&
      !trainingPlan.assignedToId &&
      trainingPlan.createdById !== user.user.id
    ) {
      const scopedTrainingPlan = {
        ...trainingPlan,
        weeks: trainingPlan.weeks.map((week, weekIndex) => ({
          ...week,
          days: weekIndex === 0 ? week.days.map((day) => day) : undefined,
        })),
      } as typeof trainingPlan
      return new TrainingPlan(scopedTrainingPlan, context)
    }

    return new TrainingPlan(trainingPlan, context)
  } catch (error) {
    console.error(error)
    throw new Error('Training plan not found')
  }
}

export async function getTemplates(
  args: GQLQueryGetTemplatesArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const where: Prisma.TrainingPlanWhereInput = {
    isTemplate: true,
    createdById: user.user.id,
  }

  if (typeof args.draft === 'boolean') {
    where.isDraft = args.draft
  }

  const templates = await prisma.trainingPlan.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  })
  return templates.map((template) => new TrainingPlan(template, context))
}

export async function getClientTrainingPlans(
  args: GQLQueryGetClientTrainingPlansArgs,
  context: GQLContext,
) {
  const { clientId } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  const plans = await prisma.trainingPlan.findMany({
    where: {
      assignedToId: clientId,
      createdById: user.user.id,
      startDate: null,
    },
  })

  return plans.map((plan) => new TrainingPlan(plan, context))
}

export async function getClientActivePlan(
  args: GQLQueryGetClientActivePlanArgs,
  context: GQLContext,
) {
  const { clientId } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  const plan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: clientId,
      createdById: user.user.id,
      startDate: { not: null },
      active: true,
    },
    include: {
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
              events: true,
              exercises: {
                orderBy: {
                  order: 'asc',
                },
                include: {
                  sets: {
                    include: {
                      log: true,
                    },
                    orderBy: {
                      order: 'asc',
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
  return plan ? new TrainingPlan(plan, context) : null
}

export async function getMyPlansOverview(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  const [plans, quickWorkoutPlan] = await Promise.all([
    prisma.trainingPlan.findMany({
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
        createdBy: {
          include: {
            profile: true,
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
                exercises: {
                  orderBy: {
                    order: 'asc',
                  },
                  include: {
                    base: {
                      include: {
                        muscleGroups: true,
                      },
                    },
                    sets: {
                      orderBy: {
                        order: 'asc',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.trainingPlan.findFirst({
      where: {
        assignedToId: user.user.id,
        createdById: user.user.id,
      },
      include: {
        createdBy: {
          include: {
            profile: true,
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
                exercises: {
                  orderBy: {
                    order: 'asc',
                  },
                  include: {
                    base: {
                      include: {
                        muscleGroups: true,
                      },
                    },
                    sets: {
                      orderBy: {
                        order: 'asc',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ])

  const activePlan = plans.find(
    (plan) => plan.assignedToId === user.user.id && plan.active,
  )

  const availablePlans = plans.filter(
    (plan) => plan.completedAt === null && plan.active === false,
  )
  const completedPlans = plans.filter((plan) => plan.completedAt !== null)

  return {
    activePlan: activePlan ? new TrainingPlan(activePlan, context) : null,
    availablePlans: availablePlans.map(
      (plan) => new TrainingPlan(plan, context),
    ),
    completedPlans: completedPlans.map(
      (plan) => new TrainingPlan(plan, context),
    ),
    quickWorkoutPlan: quickWorkoutPlan
      ? new TrainingPlan(quickWorkoutPlan, context)
      : null,
  }
}

export async function getWorkout(
  args: GQLQueryGetWorkoutArgs,
  context: GQLContext,
) {
  const { trainingId } = args
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  let id = trainingId
  if (!id) {
    const plan = await prisma.trainingPlan.findFirst({
      where: { assignedToId: user.user.id, active: true },
    })
    id = plan?.id
  }
  if (!id) {
    return null
  }

  const plan = await getFullPlanById(id)

  if (!plan || plan.assignedToId !== user.user.id) {
    return null
  }

  if (plan.assignedToId === user.user.id && plan.createdById === user.user.id) {
    return {
      plan: new TrainingPlan(plan, context),
    }
  }

  if (!plan.startDate) {
    return null
  }

  return {
    plan: new TrainingPlan(plan, context),
  }
}

export async function createTrainingPlan(
  args: GQLMutationCreateTrainingPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { title, isPublic, isDraft, description, weeks } = args.input

  const trainingPlan = await prisma.trainingPlan.create({
    data: {
      title,
      description,
      isPublic: isPublic ?? false,
      isTemplate: true,
      isDraft: isDraft ?? false,
      difficulty: args.input.difficulty ?? undefined,
      createdById: user.user.id,
      weeks: {
        create: weeks?.map((week) => ({
          weekNumber: week.weekNumber,
          name: week.name,
          description: week.description,
          days: {
            create: week.days?.map((day) => ({
              dayOfWeek: day.dayOfWeek,
              isRestDay: day.isRestDay,
              workoutType: day.workoutType,
              exercises: {
                create: day.exercises?.map((exercise) => ({
                  name: exercise.name,
                  restSeconds: exercise.restSeconds,
                  tempo: exercise.tempo,
                  instructions: exercise.instructions,
                  additionalInstructions: exercise.additionalInstructions,
                  type: exercise.type,
                  order: exercise.order,
                  warmupSets: exercise.warmupSets,
                  baseId: exercise.baseId ?? undefined,
                  sets: {
                    create: exercise.sets?.map((set) => ({
                      order: set.order,
                      minReps: set.minReps ?? null,
                      maxReps: set.maxReps ?? null,
                      weight: set.weight ?? null,
                      rpe: set.rpe ?? null,
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
    id: trainingPlan.id,
    success: true,
  }
}

export async function updateTrainingPlan(
  args: GQLMutationUpdateTrainingPlanArgs,
  context: GQLContext,
) {
  const { input } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const createdAt = await prisma.trainingPlan.findUnique({
    where: { id: input.id },
    select: { createdAt: true },
  })

  await prisma.$transaction(
    async (tx) => {
      // ## Smart week management: Update existing, create new, delete removed
      // This prevents week duplication during auto-save operations

      // First, update the training plan basic details
      await tx.trainingPlan.update({
        where: { id: input.id, createdById: user.user.id },
        data: {
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          isPublic: input.isPublic ?? false,
          isDraft: input.isDraft ?? false,
          difficulty: input.difficulty ?? undefined,
          createdAt: createdAt?.createdAt ?? new Date(),
        },
      })

      if (input.weeks) {
        // Get existing weeks to determine what to update/create/delete
        const existingWeeks = await tx.trainingWeek.findMany({
          where: { planId: input.id },
          include: {
            days: {
              include: {
                exercises: {
                  include: {
                    sets: true,
                  },
                },
              },
            },
          },
        })

        const existingWeekIds = existingWeeks.map((w) => w.id)
        const inputWeekIds = input.weeks
          .map((w) => w.id)
          .filter(Boolean) as string[]

        // Delete weeks that are no longer in the input
        const weeksToDelete = existingWeekIds.filter(
          (id) => !inputWeekIds.includes(id),
        )
        if (weeksToDelete.length > 0) {
          await tx.trainingWeek.deleteMany({
            where: { id: { in: weeksToDelete } },
          })
        }

        // Process each week in the input
        for (const weekInput of input.weeks) {
          if (weekInput.id && existingWeekIds.includes(weekInput.id)) {
            // ## Update existing week
            await tx.trainingWeek.update({
              where: { id: weekInput.id },
              data: {
                weekNumber: weekInput.weekNumber,
                name: weekInput.name ?? '',
                description: weekInput.description,
              },
            })

            // Handle days for existing week
            if (weekInput.days) {
              const existingDays = await tx.trainingDay.findMany({
                where: { weekId: weekInput.id },
                include: { exercises: { include: { sets: true } } },
              })

              const existingDayIds = existingDays.map((d) => d.id)
              const inputDayIds = weekInput.days
                .map((d) => d.id)
                .filter(Boolean) as string[]

              // Delete days no longer in input
              const daysToDelete = existingDayIds.filter(
                (id) => !inputDayIds.includes(id),
              )
              if (daysToDelete.length > 0) {
                await tx.trainingDay.deleteMany({
                  where: { id: { in: daysToDelete } },
                })
              }

              // Process each day
              for (const dayInput of weekInput.days) {
                if (dayInput.id && existingDayIds.includes(dayInput.id)) {
                  // Update existing day
                  await tx.trainingDay.update({
                    where: { id: dayInput.id },
                    data: {
                      dayOfWeek: dayInput.dayOfWeek,
                      isRestDay: dayInput.isRestDay ?? false,
                      workoutType: dayInput.workoutType,
                    },
                  })

                  // Handle exercises (simplified - delete and recreate for now)
                  await tx.trainingExercise.deleteMany({
                    where: { dayId: dayInput.id },
                  })

                  if (dayInput.exercises) {
                    for (const exerciseInput of dayInput.exercises) {
                      const newExercise = await tx.trainingExercise.create({
                        data: {
                          dayId: dayInput.id,
                          name: exerciseInput.name ?? '',
                          restSeconds: exerciseInput.restSeconds,
                          tempo: exerciseInput.tempo,
                          instructions: exerciseInput.instructions,
                          additionalInstructions:
                            exerciseInput.additionalInstructions,
                          type: exerciseInput.type,
                          order: exerciseInput.order,
                          warmupSets: exerciseInput.warmupSets,
                          baseId: exerciseInput.baseId,
                        },
                      })

                      if (exerciseInput.sets) {
                        for (const setInput of exerciseInput.sets) {
                          await tx.exerciseSet.create({
                            data: {
                              exerciseId: newExercise.id,
                              order: setInput.order,
                              reps: setInput.reps,
                              minReps: setInput.minReps,
                              maxReps: setInput.maxReps,
                              weight: setInput.weight,
                              rpe: setInput.rpe,
                            },
                          })
                        }
                      }
                    }
                  }
                } else {
                  // Create new day
                  const newDay = await tx.trainingDay.create({
                    data: {
                      weekId: weekInput.id,
                      dayOfWeek: dayInput.dayOfWeek,
                      isRestDay: dayInput.isRestDay ?? false,
                      workoutType: dayInput.workoutType,
                    },
                  })

                  if (dayInput.exercises) {
                    for (const exerciseInput of dayInput.exercises) {
                      const newExercise = await tx.trainingExercise.create({
                        data: {
                          dayId: newDay.id,
                          name: exerciseInput.name ?? '',
                          restSeconds: exerciseInput.restSeconds,
                          tempo: exerciseInput.tempo,
                          instructions: exerciseInput.instructions,
                          additionalInstructions:
                            exerciseInput.additionalInstructions,
                          type: exerciseInput.type,
                          order: exerciseInput.order,
                          warmupSets: exerciseInput.warmupSets,
                          baseId: exerciseInput.baseId,
                        },
                      })

                      if (exerciseInput.sets) {
                        for (const setInput of exerciseInput.sets) {
                          await tx.exerciseSet.create({
                            data: {
                              exerciseId: newExercise.id,
                              order: setInput.order,
                              reps: setInput.reps,
                              minReps: setInput.minReps,
                              maxReps: setInput.maxReps,
                              weight: setInput.weight,
                              rpe: setInput.rpe,
                            },
                          })
                        }
                      }
                    }
                  }
                }
              }
            }
          } else {
            // ## Create new week
            const newWeek = await tx.trainingWeek.create({
              data: {
                planId: input.id,
                weekNumber: weekInput.weekNumber,
                name: weekInput.name ?? '',
                description: weekInput.description,
              },
            })

            if (weekInput.days) {
              for (const dayInput of weekInput.days) {
                const newDay = await tx.trainingDay.create({
                  data: {
                    weekId: newWeek.id,
                    dayOfWeek: dayInput.dayOfWeek,
                    isRestDay: dayInput.isRestDay ?? false,
                    workoutType: dayInput.workoutType,
                  },
                })

                if (dayInput.exercises) {
                  for (const exerciseInput of dayInput.exercises) {
                    const newExercise = await tx.trainingExercise.create({
                      data: {
                        dayId: newDay.id,
                        name: exerciseInput.name ?? '',
                        restSeconds: exerciseInput.restSeconds,
                        tempo: exerciseInput.tempo,
                        instructions: exerciseInput.instructions,
                        additionalInstructions:
                          exerciseInput.additionalInstructions,
                        type: exerciseInput.type,
                        order: exerciseInput.order,
                        warmupSets: exerciseInput.warmupSets,
                        baseId: exerciseInput.baseId,
                      },
                    })

                    if (exerciseInput.sets) {
                      for (const setInput of exerciseInput.sets) {
                        await tx.exerciseSet.create({
                          data: {
                            exerciseId: newExercise.id,
                            order: setInput.order,
                            reps: setInput.reps,
                            minReps: setInput.minReps,
                            maxReps: setInput.maxReps,
                            weight: setInput.weight,
                            rpe: setInput.rpe,
                          },
                        })
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    { timeout: 30000, maxWait: 30000 },
  )

  return true
}

export async function duplicateTrainingPlan(
  args: GQLMutationDuplicateTrainingPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const plan = await getFullPlanById(args.id)

  if (!plan || plan.createdById !== user.user.id) {
    throw new Error('Training plan not found or unauthorized')
  }

  const duplicated = await duplicatePlan({ plan, asTemplate: true })
  if (!duplicated) {
    throw new Error('Failed to duplicate plan')
  }
  return duplicated?.id
}

export async function deleteTrainingPlan(
  args: GQLMutationDeleteTrainingPlanArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const { id } = args

  // First check if the training plan exists and user has permission
  const trainingPlan = await prisma.trainingPlan.findUnique({
    where: { id, createdById: user.user.id },
  })

  if (!trainingPlan) {
    throw new Error('Training plan not found')
  }

  // If we get here, we know the plan exists and user has permission
  await prisma.trainingPlan.delete({
    where: { id },
  })

  return true
}

export async function assignTrainingPlanToClient(
  args: GQLMutationAssignTrainingPlanToClientArgs,
  context: GQLContext,
) {
  const { clientId, planId, startDate } = args.input

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  const plan = await getFullPlanById(planId)

  if (!plan || plan.createdById !== user?.user.id) {
    throw new Error('Training plan not found or unauthorized')
  }

  const duplicated = await duplicatePlan({ plan, asTemplate: false })

  if (!duplicated) {
    throw new Error('Failed to assign plan')
  }

  await prisma.trainingPlan.update({
    where: { id: duplicated.id },
    data: {
      assignedToId: clientId,
      isTemplate: false,
      startDate,
    },
  })

  const senderName =
    user.user.profile?.firstName &&
    user.user.profile?.lastName &&
    `${user.user.profile.firstName} ${user.user.profile.lastName}`

  await createNotification(
    {
      createdBy: user.user.id,
      userId: clientId,
      relatedItemId: duplicated.id,
      message: `New training plan "${plan.title}" has been assigned to you${senderName ? ` by ${senderName}` : ''}.`,
      type: GQLNotificationType.NewTrainingPlanAssigned,
    },
    context,
  )

  return true
}

export async function removeTrainingPlanFromClient(
  args: GQLMutationRemoveTrainingPlanFromClientArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }
  const { planId, clientId } = args

  await prisma.trainingPlan.delete({
    where: {
      id: planId,
      assignedToId: clientId,
      isTemplate: false,
      createdById: user.user.id,
    },
  })

  return true
}

export async function activatePlan(
  args: GQLMutationActivatePlanArgs,
  context: GQLContext,
) {
  const { planId, startDate, resume } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const fullPlan = await getFullPlanById(planId)

  if (!fullPlan) {
    throw new Error('Training plan not found')
  }

  if (resume) {
    await prisma.trainingPlan.updateMany({
      where: { assignedToId: user.user.id, active: true, id: { not: planId } },
      data: { active: false },
    })

    await prisma.trainingPlan.update({
      where: { id: fullPlan.id, assignedToId: user.user.id },
      data: {
        active: true,
        startDate: new Date(startDate),
        weeks: {
          update: fullPlan?.weeks.map((week, weekIndex) => ({
            where: { id: week.id },
            data: {
              scheduledAt: addWeeks(new Date(startDate), weekIndex),
              days: {
                update: week.days.map((day) => ({
                  where: { id: day.id },
                  data: {
                    scheduledAt: addDays(
                      addWeeks(new Date(startDate), weekIndex),
                      day.dayOfWeek,
                    ),
                  },
                })),
              },
            },
          })),
        },
      },
    })

    return true
  }

  if (!fullPlan || fullPlan.assignedToId !== user.user.id) {
    throw new Error('Training plan not found or unauthorized')
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        // First deactivate all other plans for this user
        await tx.trainingPlan.updateMany({
          where: {
            assignedToId: user.user.id,
            active: true,
            id: { not: planId }, // Don't update the plan we want to activate
          },
          data: { active: false },
        })

        const duplicated = await duplicatePlan({
          plan: fullPlan,
          asTemplate: false,
        })

        if (!duplicated) {
          throw new Error('Failed to duplicate plan')
        }

        const duplicatedFullPlan = await getFullPlanById(duplicated.id)

        if (!duplicatedFullPlan) {
          throw new Error('Failed to get duplicated plan')
        }

        // Then activate the new plan
        await tx.trainingPlan.update({
          where: {
            id: duplicated.id,
            assignedToId: user.user.id, // Ensure the plan belongs to the user
          },
          data: {
            active: true,
            startDate: new Date(startDate),
            weeks: {
              update: duplicatedFullPlan.weeks.map((week, weekIndex) => ({
                where: { id: week.id },
                data: {
                  scheduledAt: addWeeks(new Date(startDate), weekIndex),
                  days: {
                    update: week.days.map((day) => ({
                      where: { id: day.id },
                      data: {
                        scheduledAt: addDays(
                          addWeeks(new Date(startDate), weekIndex),
                          day.dayOfWeek,
                        ),
                      },
                    })),
                  },
                },
              })),
            },
          },
        })
      },
      { timeout: 15000, maxWait: 15000 },
    )
  } catch (error) {
    console.error(error)
    throw 'Failed to activate plan.'
  }
  return true
}

export async function pausePlan(
  args: GQLMutationPausePlanArgs,
  context: GQLContext,
) {
  const { planId } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  await prisma.trainingPlan.update({
    where: { id: planId, assignedToId: user.user.id },
    data: { active: false },
  })

  return true
}

export async function closePlan(
  args: GQLMutationClosePlanArgs,
  context: GQLContext,
) {
  const { planId } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  await prisma.trainingPlan.update({
    where: { id: planId, assignedToId: user.user.id },
    data: { completedAt: new Date(), active: false },
  })

  return true
}

export async function deletePlan(
  args: GQLMutationDeletePlanArgs,
  context: GQLContext,
) {
  const { planId } = args

  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  await prisma.trainingPlan.delete({
    where: { id: planId, assignedToId: user.user.id, isTemplate: false },
  })

  return true
}

export async function extendPlan(args: GQLMutationExtendPlanArgs) {
  const { planId, weeks } = args

  const plan = await getFullPlanById(planId)
  if (!plan) throw new GraphQLError('Training plan not found')

  const toClone = plan.weeks
    .filter((w) => weeks.includes(w.id))
    .sort((a, b) => a.weekNumber - b.weekNumber)

  if (toClone.length === 0) throw new GraphQLError('No weeks to extend')

  const maxWeekNumber = Math.max(...plan.weeks.map((w) => w.weekNumber))
  let nextWeekNumber = maxWeekNumber + 1
  let nextWeekStart = plan.weeks
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .at(-1)?.scheduledAt

  for (const week of toClone) {
    nextWeekStart = nextWeekStart ? addWeeks(nextWeekStart, 1) : null

    const newWeek = await prisma.trainingWeek.create({
      data: {
        planId,
        name: week.name,
        description: week.description,
        weekNumber: nextWeekNumber++,
        scheduledAt: nextWeekStart,
        completedAt: null,
        isExtra: true,
      },
    })

    for (const day of week.days) {
      const offset =
        week.scheduledAt && day.scheduledAt
          ? differenceInCalendarDays(day.scheduledAt, week.scheduledAt)
          : null

      const scheduledAt =
        offset != null && nextWeekStart ? addDays(nextWeekStart, offset) : null

      const newDay = await prisma.trainingDay.create({
        data: {
          weekId: newWeek.id,
          dayOfWeek: day.dayOfWeek,
          workoutType: day.workoutType,
          isRestDay: day.isRestDay,
          scheduledAt,
          completedAt: null,
          isExtra: true,
        },
      })

      for (const ex of day.exercises) {
        const newExercise = await prisma.trainingExercise.create({
          data: {
            dayId: newDay.id,
            name: ex.name,
            baseId: ex.baseId,
            restSeconds: ex.restSeconds,
            order: ex.order,
            isExtra: true,
            additionalInstructions: ex.additionalInstructions,
            completedAt: null,
            instructions: ex.instructions,
            tempo: ex.tempo,
            type: ex.type,
            warmupSets: ex.warmupSets,
          },
        })

        for (const set of ex.sets) {
          await prisma.exerciseSet.create({
            data: {
              exerciseId: newExercise.id,
              reps: set.reps,
              weight: set.weight,
              rpe: set.rpe,
              order: set.order,
              isExtra: true,
              maxReps: set.maxReps,
              minReps: set.minReps,
              completedAt: null,
            },
          })
        }
      }
    }
  }

  return true
}

export async function removeWeek(
  args: { planId: string; weekId: string },
  context: GQLContext,
) {
  const { planId, weekId } = args

  // Verify the plan exists and get the week to remove
  const plan = await getFullPlanById(planId)
  const isOwner =
    plan?.createdById === context.user?.user.id ||
    plan?.assignedToId === context.user?.user.id
  if (!plan || !isOwner)
    throw new GraphQLError('Training plan not found or unauthorized')

  const weekToRemove = plan.weeks.find((w) => w.id === weekId)
  if (!weekToRemove) throw new GraphQLError('Week not found')

  // Only allow removal of weeks marked as isExtra for safety
  if (!weekToRemove.isExtra) {
    throw new GraphQLError('Only extra weeks can be removed')
  }

  // Remove the week (this will cascade delete all related entities)
  await prisma.trainingWeek.delete({
    where: { id: weekId },
  })

  return true
}

export async function createDraftTemplate(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new Error('User not found')
  }

  const trainingPlan = await prisma.trainingPlan.create({
    data: {
      title: 'Untitled Training Plan',
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
              dayOfWeek: dayIndex,
              isRestDay: false, // All days are not rest day initially
              workoutType: null,
              exercises: {
                create: [], // No exercises initially
              },
            })),
          },
        },
      },
    },
    include: {
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
              exercises: {
                orderBy: {
                  order: 'asc',
                },
                include: {
                  base: {
                    select: {
                      videoUrl: true,
                      muscleGroups: true,
                    },
                  },
                  sets: {
                    orderBy: {
                      order: 'asc',
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

  return new TrainingPlan(trainingPlan, context)
}
