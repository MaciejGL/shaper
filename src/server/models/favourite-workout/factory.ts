import { addDays, getISOWeek, isSameWeek } from 'date-fns'

import {
  GQLCreateFavouriteWorkoutFolderInput,
  GQLCreateFavouriteWorkoutInput,
  GQLMutationStartWorkoutFromFavouriteArgs,
  GQLUpdateFavouriteWorkoutFolderInput,
  GQLUpdateFavouriteWorkoutInput,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { getUTCWeekStart } from '@/lib/server-date-utils'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'

import FavouriteWorkout, { FavouriteWorkoutFolder } from './model'

// Get all favourite workouts for a user
export async function getFavouriteWorkouts(
  userId: string,
  context: GQLContext,
): Promise<FavouriteWorkout[]> {
  const favouriteWorkouts = await prisma.favouriteWorkout.findMany({
    where: {
      createdById: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      folder: true,
      exercises: {
        include: {
          base: {
            include: {
              muscleGroups: true,
              images: true,
            },
          },
          sets: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  return favouriteWorkouts.map(
    (favouriteWorkout) => new FavouriteWorkout(favouriteWorkout, context),
  )
}

// Get a specific favourite workout by ID
export async function getFavouriteWorkout(
  id: string,
  userId: string,
  context: GQLContext,
): Promise<FavouriteWorkout | null> {
  const favouriteWorkout = await prisma.favouriteWorkout.findFirst({
    where: {
      id,
      createdById: userId,
    },
    include: {
      folder: true,
      exercises: {
        include: {
          base: {
            include: {
              muscleGroups: true,
              images: true,
            },
          },
          sets: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  return favouriteWorkout
    ? new FavouriteWorkout(favouriteWorkout, context)
    : null
}

// Create a new favourite workout
export async function createFavouriteWorkout(
  input: GQLCreateFavouriteWorkoutInput,
  userId: string,
  context: GQLContext,
): Promise<FavouriteWorkout> {
  const MAX_EXERCISES = 12

  // Check subscription limits
  const subscriptionStatus =
    await subscriptionValidator.getUserSubscriptionStatus(userId)

  if (!subscriptionStatus.hasPremium) {
    const currentCount = await prisma.favouriteWorkout.count({
      where: { createdById: userId },
    })

    if (currentCount >= subscriptionStatus.favouriteWorkoutLimit) {
      throw new Error(
        `Free tier limit reached (${subscriptionStatus.favouriteWorkoutLimit} workouts). Upgrade to Premium for unlimited workouts.`,
      )
    }
  }

  // Validate exercise limit
  if (input.exercises.length > MAX_EXERCISES) {
    throw new Error(`Maximum ${MAX_EXERCISES} exercises allowed per workout`)
  }

  const favouriteWorkout = await prisma.favouriteWorkout.create({
    data: {
      title: input.title,
      description: input.description,
      createdById: userId,
      folderId: input.folderId,
      exercises: {
        create: input.exercises.map((exercise) => ({
          name: exercise.name,
          order: exercise.order,
          baseId: exercise.baseId,
          restSeconds: exercise.restSeconds,
          description: exercise.description,
          instructions: exercise.instructions ?? [],
          tips: exercise.tips ?? [],
          difficulty: exercise.difficulty,
          sets: {
            create: exercise.sets.map((set) => ({
              order: set.order,
              reps: set.reps,
              minReps: set.minReps,
              maxReps: set.maxReps,
              weight: set.weight,
              rpe: set.rpe,
            })),
          },
        })),
      },
    },
    include: {
      exercises: {
        include: {
          base: {
            include: {
              muscleGroups: true,
              images: true,
            },
          },
          sets: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  return new FavouriteWorkout(favouriteWorkout, context)
}

// Update an existing favourite workout
export async function updateFavouriteWorkout(
  input: GQLUpdateFavouriteWorkoutInput,
  userId: string,
  context: GQLContext,
): Promise<FavouriteWorkout> {
  const MAX_EXERCISES = 12

  // Verify ownership
  const existingWorkout = await prisma.favouriteWorkout.findFirst({
    where: {
      id: input.id,
      createdById: userId,
    },
  })

  if (!existingWorkout) {
    throw new Error('Favourite workout not found or access denied')
  }

  // Validate exercise limit
  if (input.exercises && input.exercises.length > MAX_EXERCISES) {
    throw new Error(`Maximum ${MAX_EXERCISES} exercises allowed per workout`)
  }

  // Validate folder existence if provided
  if (input.folderId) {
    const folder = await prisma.favouriteWorkoutFolder.findFirst({
      where: {
        id: input.folderId,
        createdById: userId,
      },
    })

    if (!folder) {
      throw new Error('Selected folder not found')
    }
  }

  // Handle updates with transaction for consistency
  const updatedWorkout = await prisma.$transaction(async (tx) => {
    // Update basic workout info
    await tx.favouriteWorkout.update({
      where: { id: input.id },
      data: {
        title: input.title ?? undefined,
        description: input.description ?? undefined,
        folderId:
          input.folderId === null ? null : (input.folderId ?? undefined),
      },
    })

    // If exercises are provided, replace all exercises
    if (input.exercises) {
      // Delete existing exercises (cascade will handle sets)
      await tx.favouriteWorkoutExercise.deleteMany({
        where: { favouriteWorkoutId: input.id },
      })

      // Create new exercises
      for (const exercise of input.exercises) {
        await tx.favouriteWorkoutExercise.create({
          data: {
            favouriteWorkoutId: input.id,
            name: exercise.name,
            order: exercise.order,
            baseId: exercise.baseId,
            restSeconds: exercise.restSeconds,
            description: exercise.description,
            instructions: exercise.instructions ?? [],
            tips: exercise.tips ?? [],
            difficulty: exercise.difficulty,
            sets: {
              create: exercise.sets.map((set) => ({
                order: set.order,
                reps: set.reps,
                minReps: set.minReps,
                maxReps: set.maxReps,
                weight: set.weight,
                rpe: set.rpe,
              })),
            },
          },
        })
      }
    }

    // Return updated workout with all relations
    return await tx.favouriteWorkout.findUnique({
      where: { id: input.id },
      include: {
        exercises: {
          include: {
            base: {
              include: {
                muscleGroups: true,
                images: true,
              },
            },
            sets: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })
  })

  if (!updatedWorkout) {
    throw new Error('Failed to update favourite workout')
  }

  return new FavouriteWorkout(updatedWorkout, context)
}

// Update set count for a specific exercise (fast, lightweight mutation)
export async function updateFavouriteExerciseSets(
  exerciseId: string,
  setCount: number,
  userId: string,
): Promise<boolean> {
  if (setCount < 1) {
    throw new Error('Set count must be at least 1')
  }

  // Verify ownership and get current sets
  const exercise = await prisma.favouriteWorkoutExercise.findFirst({
    where: {
      id: exerciseId,
      favouriteWorkout: {
        createdById: userId,
      },
    },
    include: {
      sets: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!exercise) {
    throw new Error('Exercise not found or access denied')
  }

  const currentSetCount = exercise.sets.length

  if (setCount === currentSetCount) {
    return true // No change needed
  }

  if (setCount > currentSetCount) {
    // Add new sets
    const setsToAdd = setCount - currentSetCount
    const lastSet = exercise.sets[exercise.sets.length - 1]

    await prisma.favouriteWorkoutSet.createMany({
      data: Array.from({ length: setsToAdd }, (_, i) => ({
        exerciseId,
        order: currentSetCount + i + 1,
        reps: lastSet?.reps || null,
        minReps: lastSet?.minReps || null,
        maxReps: lastSet?.maxReps || null,
        weight: lastSet?.weight || null,
        rpe: lastSet?.rpe || null,
      })),
    })
  } else {
    // Remove sets from the end
    const setsToRemove = currentSetCount - setCount
    const setIdsToRemove = exercise.sets
      .slice(-setsToRemove)
      .map((set) => set.id)

    await prisma.favouriteWorkoutSet.deleteMany({
      where: {
        id: { in: setIdsToRemove },
      },
    })
  }

  return true
}

// Update exercise order (fast, lightweight mutation - only updates order field)
export async function updateFavouriteExercisesOrder(
  favouriteId: string,
  exerciseOrders: { exerciseId: string; order: number }[],
  userId: string,
): Promise<boolean> {
  // Verify ownership
  const favourite = await prisma.favouriteWorkout.findFirst({
    where: {
      id: favouriteId,
      createdById: userId,
    },
    include: {
      exercises: true,
    },
  })

  if (!favourite) {
    throw new Error('Favourite workout not found or access denied')
  }

  // Verify all exercise IDs belong to this favourite
  const exerciseIds = new Set(favourite.exercises.map((ex) => ex.id))
  const invalidExercises = exerciseOrders.filter(
    (eo) => !exerciseIds.has(eo.exerciseId),
  )

  if (invalidExercises.length > 0) {
    throw new Error('Invalid exercise IDs provided')
  }

  // Update all exercise orders in a transaction
  await prisma.$transaction(
    exerciseOrders.map(({ exerciseId, order }) =>
      prisma.favouriteWorkoutExercise.update({
        where: { id: exerciseId },
        data: { order },
      }),
    ),
  )

  return true
}

// Remove a single exercise from favourite (fast, lightweight mutation)
export async function removeFavouriteExercise(
  exerciseId: string,
  userId: string,
): Promise<boolean> {
  // Verify ownership
  const exercise = await prisma.favouriteWorkoutExercise.findFirst({
    where: {
      id: exerciseId,
      favouriteWorkout: {
        createdById: userId,
      },
    },
  })

  if (!exercise) {
    throw new Error('Exercise not found or access denied')
  }

  // Delete the exercise (cascade will handle sets)
  await prisma.favouriteWorkoutExercise.delete({
    where: {
      id: exerciseId,
    },
  })

  return true
}

// Delete a favourite workout
export async function deleteFavouriteWorkout(
  id: string,
  userId: string,
): Promise<boolean> {
  const result = await prisma.favouriteWorkout.deleteMany({
    where: {
      id,
      createdById: userId,
    },
  })

  return result.count > 0
}

// Start a workout from a favourite (copy to quick workout plan)
export async function startWorkoutFromFavourite(
  args: GQLMutationStartWorkoutFromFavouriteArgs,
  userId: string,
): Promise<string> {
  const { input } = args
  const { favouriteWorkoutId, replaceExisting, dayId } = input

  // Get the favourite workout with all its exercises and sets
  const favouriteWorkout = await prisma.favouriteWorkout.findFirst({
    where: {
      id: favouriteWorkoutId,
      createdById: userId,
    },
    include: {
      exercises: {
        include: {
          sets: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!favouriteWorkout) {
    throw new Error('Favourite workout not found or access denied')
  }

  // Get or create the user's quick workout plan
  let quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      createdById: userId,
      assignedToId: userId,
      isTemplate: false,
      isDraft: false,
    },
    include: {
      weeks: true,
    },
  })

  // Create quick workout plan if it doesn't exist
  if (!quickWorkoutPlan) {
    console.info('[startWorkoutFromFavourite] Creating new quick workout plan')

    // Use UTC-based week start calculation
    const weekStart = getUTCWeekStart()

    // Create a new quick workout plan
    await prisma.trainingPlan.create({
      data: {
        title: 'Quick Workout',
        createdById: userId,
        assignedToId: userId,
        isPublic: false,
        isDraft: false,
        weeks: {
          create: {
            name: `Week ${getISOWeek(weekStart)}`,
            weekNumber: 1,
            isExtra: true,
            scheduledAt: weekStart,
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
        },
      },
    })

    // Reload the plan with weeks
    quickWorkoutPlan = await prisma.trainingPlan.findFirst({
      where: {
        createdById: userId,
        assignedToId: userId,
        isTemplate: false,
        isDraft: false,
      },
      include: {
        weeks: true,
      },
    })

    if (!quickWorkoutPlan) {
      throw new Error('Failed to create quick workout plan')
    }
  }

  // If dayId is provided, use that specific day; otherwise use today
  let targetDay

  if (dayId) {
    // User specified a particular day - find it directly
    targetDay = await prisma.trainingDay.findFirst({
      where: {
        id: dayId,
        week: {
          planId: quickWorkoutPlan.id,
        },
      },
      include: {
        week: true,
      },
    })

    if (!targetDay) {
      throw new Error('Specified day not found or access denied')
    }
  } else {
    // No dayId provided - find today's workout day (legacy behavior)
    const today = new Date()
    const weekStart = getUTCWeekStart(today)

    // Check if current week exists, create if not
    const hasCurrentWeek = quickWorkoutPlan.weeks.some((week) => {
      if (!week.scheduledAt) {
        return false
      }
      return isSameWeek(week.scheduledAt, weekStart)
    })

    if (!hasCurrentWeek) {
      console.info(
        '[startWorkoutFromFavourite] Creating new week for current period',
      )

      // Create a new week for the current period - wrap in try-catch to handle race condition
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

    // Always reload the plan with days after week handling
    const planWithDays = await prisma.trainingPlan.findFirst({
      where: {
        createdById: userId,
        assignedToId: userId,
        isTemplate: false,
        isDraft: false,
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

    // Find the current week based on scheduledAt
    const currentWeek = planWithDays.weeks.find((week) => {
      if (!week.scheduledAt) {
        return false
      }
      return isSameWeek(week.scheduledAt, weekStart)
    })

    if (!currentWeek) {
      throw new Error(
        'Current week not found in quick workout plan after creation',
      )
    }

    // Convert JavaScript day (Sunday=0) to training day (Monday=0)
    const jsDay = today.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
    const trainingDay = jsDay === 0 ? 6 : jsDay - 1 // 0=Monday, 1=Tuesday, ..., 6=Sunday

    // Find today's workout day
    targetDay = currentWeek.days.find((day) => day.dayOfWeek === trainingDay)
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
        isRestDay: false, // Ensure it's not marked as rest day
      },
    })

    // If replacing existing, delete current exercises
    if (replaceExisting) {
      await tx.trainingExercise.deleteMany({
        where: { dayId: targetDay.id },
      })
    }

    // Add exercises from favourite
    for (const favExercise of favouriteWorkout.exercises) {
      await tx.trainingExercise.create({
        data: {
          name: favExercise.name,
          order: favExercise.order,
          baseId: favExercise.baseId,
          restSeconds: favExercise.restSeconds,
          description: favExercise.description,
          instructions: favExercise.instructions,
          tips: favExercise.tips,
          difficulty: favExercise.difficulty,
          dayId: targetDay.id,
          sets: {
            create: favExercise.sets.map((set) => ({
              order: set.order,
              reps: set.reps,
              minReps: set.minReps,
              maxReps: set.maxReps,
              weight: set.weight,
              rpe: set.rpe,
            })),
          },
        },
      })
    }
  })

  // Get the week for the return value
  const weekId = targetDay.weekId

  if (!weekId) {
    // If we still don't have weekId, fetch it
    const dayWithWeek = await prisma.trainingDay.findUnique({
      where: { id: targetDay.id },
      include: { week: true },
    })
    if (!dayWithWeek?.week) {
      throw new Error('Week not found for target day')
    }
    return `${quickWorkoutPlan.id}|${dayWithWeek.week.id}|${targetDay.id}`
  }

  // Return navigation info: planId|weekId|dayId
  return `${quickWorkoutPlan.id}|${weekId}|${targetDay.id}`
}

export async function getFavouriteWorkoutFolders(
  userId: string,
  context: GQLContext,
): Promise<FavouriteWorkoutFolder[]> {
  const folders = await prisma.favouriteWorkoutFolder.findMany({
    where: {
      createdById: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      favouriteWorkouts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  return folders.map((folder) => new FavouriteWorkoutFolder(folder, context))
}

export async function createFavouriteWorkoutFolder(
  input: GQLCreateFavouriteWorkoutFolderInput,
  userId: string,
  context: GQLContext,
): Promise<FavouriteWorkoutFolder> {
  // Check subscription limits
  const subscriptionStatus =
    await subscriptionValidator.getUserSubscriptionStatus(userId)

  if (!subscriptionStatus.hasPremium) {
    const currentCount = await prisma.favouriteWorkoutFolder.count({
      where: { createdById: userId },
    })

    if (currentCount >= subscriptionStatus.favouriteFolderLimit) {
      throw new Error(
        `Free tier limit reached (${subscriptionStatus.favouriteFolderLimit} folders). Upgrade to Premium for unlimited folders.`,
      )
    }
  }

  const folder = await prisma.favouriteWorkoutFolder.create({
    data: {
      name: input.name,
      createdById: userId,
    },
    include: {
      favouriteWorkouts: true,
    },
  })

  return new FavouriteWorkoutFolder(folder, context)
}

export async function updateFavouriteWorkoutFolder(
  input: GQLUpdateFavouriteWorkoutFolderInput,
  userId: string,
  context: GQLContext,
): Promise<FavouriteWorkoutFolder> {
  const existingFolder = await prisma.favouriteWorkoutFolder.findFirst({
    where: {
      id: input.id,
      createdById: userId,
    },
  })

  if (!existingFolder) {
    throw new Error('Folder not found or access denied')
  }

  const folder = await prisma.favouriteWorkoutFolder.update({
    where: { id: input.id },
    data: {
      name: input.name ?? existingFolder.name,
    },
    include: {
      favouriteWorkouts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  return new FavouriteWorkoutFolder(folder, context)
}

export async function deleteFavouriteWorkoutFolder(
  id: string,
  userId: string,
): Promise<boolean> {
  const result = await prisma.favouriteWorkoutFolder.deleteMany({
    where: {
      id,
      createdById: userId,
    },
  })

  return result.count > 0
}
