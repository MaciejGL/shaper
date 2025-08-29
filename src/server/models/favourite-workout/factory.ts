import { addDays, getISOWeek, isSameWeek } from 'date-fns'

import {
  GQLCreateFavouriteWorkoutInput,
  GQLMutationStartWorkoutFromFavouriteArgs,
  GQLUpdateFavouriteWorkoutInput,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { getUTCWeekStart } from '@/lib/server-date-utils'
import { GQLContext } from '@/types/gql-context'

import FavouriteWorkout from './model'

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
  const favouriteWorkout = await prisma.favouriteWorkout.create({
    data: {
      title: input.title,
      description: input.description,
      createdById: userId,
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

  // Handle updates with transaction for consistency
  const updatedWorkout = await prisma.$transaction(async (tx) => {
    // Update basic workout info
    await tx.favouriteWorkout.update({
      where: { id: input.id },
      data: {
        title: input.title ?? undefined,
        description: input.description ?? undefined,
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
  const { favouriteWorkoutId, replaceExisting } = input

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

  // Get today and find current week
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

    // Create a new week for the current period
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
  const todaysWorkout = currentWeek.days.find(
    (day) => day.dayOfWeek === trainingDay,
  )

  if (!todaysWorkout) {
    throw new Error('No workout day found for today')
  }

  await prisma.$transaction(async (tx) => {
    // Set today's workout as scheduled for today
    await tx.trainingDay.update({
      where: { id: todaysWorkout.id },
      data: {
        scheduledAt: today,
        isRestDay: false, // Ensure it's not marked as rest day
      },
    })

    // If replacing existing, delete current exercises
    if (replaceExisting) {
      await tx.trainingExercise.deleteMany({
        where: { dayId: todaysWorkout.id },
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
          dayId: todaysWorkout.id,
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

  // Return navigation info: planId|weekId|dayId
  return `${planWithDays.id}|${currentWeek.id}|${todaysWorkout.id}`
}
