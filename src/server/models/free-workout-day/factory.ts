import { addDays, getISOWeek, isSameWeek, startOfToday } from 'date-fns'
import { revalidatePath } from 'next/cache'

import {
  GQLMutationAddFreeWorkoutDayArgs,
  GQLMutationRemoveFreeWorkoutDayArgs,
  GQLMutationStartFreeWorkoutDayArgs,
  GQLMutationUpdateFreeWorkoutDayArgs,
} from '@/generated/graphql-server'
import { requireAdminUser } from '@/lib/admin-auth'
import { ensureQuickWorkout } from '@/lib/auth/ensure-quick-workout'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import FreeWorkoutDay from './model'

function getUTCWeekStart(): Date {
  const now = new Date()
  const currentDay = now.getUTCDay()
  const diff = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

export async function getFreeWorkoutDays(context: GQLContext) {
  const freeWorkoutDays = await prisma.freeWorkoutDay.findMany({
    where: {
      isVisible: true,
    },
    include: {
      trainingDay: {
        include: {
          exercises: {
            include: {
              sets: true,
              base: {
                include: {
                  muscleGroups: true,
                  images: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
          week: {
            include: {
              plan: {
                include: {
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
      },
      plan: {
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
      createdAt: 'desc',
    },
  })

  return freeWorkoutDays.map((fwd) => new FreeWorkoutDay(fwd, context))
}

export async function getAdminFreeWorkoutDays(context: GQLContext) {
  await requireAdminUser()

  const freeWorkoutDays = await prisma.freeWorkoutDay.findMany({
    include: {
      trainingDay: {
        include: {
          week: {
            include: {
              plan: true,
            },
          },
        },
      },
      plan: {
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
      createdAt: 'desc',
    },
  })

  return freeWorkoutDays.map((fwd) => new FreeWorkoutDay(fwd, context))
}

export async function addFreeWorkoutDay(
  args: GQLMutationAddFreeWorkoutDayArgs,
  context: GQLContext,
) {
  await requireAdminUser()

  const { trainingDayId, planId, heroImageUrl } = args.input

  const existingFreeWorkoutDay = await prisma.freeWorkoutDay.findUnique({
    where: { trainingDayId },
  })

  if (existingFreeWorkoutDay) {
    throw new Error('This training day is already a free workout day')
  }

  const freeWorkoutDay = await prisma.freeWorkoutDay.create({
    data: {
      trainingDayId,
      planId,
      heroImageUrl: heroImageUrl ?? null,
      isVisible: true,
    },
    include: {
      trainingDay: {
        include: {
          week: {
            include: {
              plan: {
                include: {
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
      },
      plan: {
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

  return new FreeWorkoutDay(freeWorkoutDay, context)
}

export async function updateFreeWorkoutDay(
  args: GQLMutationUpdateFreeWorkoutDayArgs,
  context: GQLContext,
) {
  await requireAdminUser()

  const { id, isVisible, heroImageUrl } = args

  const updateData: {
    isVisible?: boolean
    heroImageUrl?: string | null
  } = {}

  if (isVisible !== undefined && isVisible !== null) {
    updateData.isVisible = isVisible
  }

  if (heroImageUrl !== undefined) {
    updateData.heroImageUrl = heroImageUrl
  }

  await prisma.freeWorkoutDay.update({
    where: { id },
    data: updateData,
  })

  return true
}

export async function removeFreeWorkoutDay(
  args: GQLMutationRemoveFreeWorkoutDayArgs,
  context: GQLContext,
) {
  await requireAdminUser()

  await prisma.freeWorkoutDay.delete({
    where: { id: args.id },
  })

  return true
}

export async function startFreeWorkoutDay(
  args: GQLMutationStartFreeWorkoutDayArgs,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { input } = args
  const { trainingDayId, dayId, replaceExisting = true } = input

  const freeWorkoutDay = await prisma.freeWorkoutDay.findFirst({
    where: {
      trainingDayId,
      isVisible: true,
    },
    include: {
      trainingDay: {
        include: {
          exercises: {
            include: {
              sets: true,
              base: true,
            },
            orderBy: { order: 'asc' },
          },
          week: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
  })

  if (!freeWorkoutDay) {
    throw new Error('Free workout day not found or not visible')
  }

  await ensureQuickWorkout(user.user.id)

  const quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      title: 'Quick Workout',
      createdById: user.user.id,
      assignedToId: user.user.id,
      active: false,
      isTemplate: false,
    },
    include: {
      weeks: {
        include: {
          days: true,
        },
      },
    },
  })

  if (!quickWorkoutPlan) {
    throw new Error('Quick Workout plan not found')
  }

  // Find target day - same logic as startWorkoutFromFavourite
  let targetDay:
    | { id: string; scheduledAt: Date | null; weekId: string }
    | null
    | undefined

  if (dayId) {
    // User specified a particular day - find it directly
    targetDay = await prisma.trainingDay.findFirst({
      where: {
        id: dayId,
        week: {
          planId: quickWorkoutPlan.id,
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        weekId: true,
      },
    })

    if (!targetDay) {
      throw new Error('Specified day not found or access denied')
    }
  } else {
    // No dayId provided - find today's workout day
    const today = new Date()
    const weekStart = getUTCWeekStart()

    // Check if current week exists
    const hasCurrentWeek = quickWorkoutPlan.weeks.some((week) => {
      if (!week.scheduledAt) return false
      return isSameWeek(week.scheduledAt, weekStart)
    })

    if (!hasCurrentWeek) {
      // Create a new week for the current period
      try {
        await prisma.trainingWeek.create({
          data: {
            planId: quickWorkoutPlan.id,
            weekNumber: getISOWeek(weekStart),
            name: `Week ${getISOWeek(weekStart)}`,
            scheduledAt: weekStart,
            isExtra: true,
            days: {
              createMany: {
                data: Array.from({ length: 7 }, (_, i) => ({
                  dayOfWeek: i,
                  isRestDay: false,
                  isExtra: true,
                  scheduledAt: addDays(weekStart, i),
                })),
              },
            },
          },
        })
      } catch (error) {
        // Ignore unique constraint errors - week was created by another request
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code !== 'P2002'
        ) {
          throw error
        }
      }
    }

    // Reload the plan with days after week handling
    const planWithDays = await prisma.trainingPlan.findFirst({
      where: {
        title: 'Quick Workout',
        createdById: user.user.id,
        assignedToId: user.user.id,
        active: false,
        isTemplate: false,
      },
      include: {
        weeks: {
          include: {
            days: true,
          },
        },
      },
    })

    if (!planWithDays) {
      throw new Error('Failed to reload quick workout plan')
    }

    // Find the current week
    const currentWeek = planWithDays.weeks.find((week) => {
      if (!week.scheduledAt) return false
      return isSameWeek(week.scheduledAt, weekStart)
    })

    if (!currentWeek) {
      throw new Error('Current week not found in quick workout plan')
    }

    // Convert JavaScript day (Sunday=0) to training day (Monday=0)
    const jsDay = today.getDay()
    const trainingDay = jsDay === 0 ? 6 : jsDay - 1

    // Find today's workout day
    const foundDay = currentWeek.days.find(
      (day) => day.dayOfWeek === trainingDay,
    )
    if (foundDay) {
      targetDay = {
        id: foundDay.id,
        scheduledAt: foundDay.scheduledAt,
        weekId: foundDay.weekId,
      }
    }
  }

  if (!targetDay) {
    throw new Error('No workout day found')
  }

  // Get the day's scheduledAt or use current date
  const dayScheduledAt = targetDay.scheduledAt || new Date()

  await prisma.$transaction(async (tx) => {
    // Update the target day
    await tx.trainingDay.update({
      where: { id: targetDay.id },
      data: {
        scheduledAt: dayScheduledAt,
        isRestDay: false,
        sourceTrainingDayId: trainingDayId,
        sourcePlanId: freeWorkoutDay.trainingDay.week?.plan?.id ?? null,
      },
    })

    // If replacing existing, delete current exercises
    if (replaceExisting) {
      await tx.trainingExercise.deleteMany({
        where: { dayId: targetDay.id },
      })
    }

    // Add exercises from free workout
    for (const exercise of freeWorkoutDay.trainingDay.exercises) {
      const newExercise = await tx.trainingExercise.create({
        data: {
          name: exercise.name,
          dayId: targetDay.id,
          order: exercise.order,
          baseId: exercise.baseId,
          restSeconds: exercise.restSeconds,
          tempo: exercise.tempo,
          description: exercise.description,
          additionalInstructions: exercise.additionalInstructions,
          type: exercise.type,
          warmupSets: exercise.warmupSets,
          difficulty: exercise.difficulty,
          instructions: exercise.instructions,
          tips: exercise.tips,
        },
      })

      for (const set of exercise.sets) {
        await tx.exerciseSet.create({
          data: {
            exerciseId: newExercise.id,
            order: set.order,
            reps: set.reps,
            minReps: set.minReps,
            maxReps: set.maxReps,
            weight: set.weight,
            rpe: set.rpe,
          },
        })
      }
    }
  })

  return {
    planId: quickWorkoutPlan.id,
    weekId: targetDay.weekId,
    dayId: targetDay.id,
  }
}
