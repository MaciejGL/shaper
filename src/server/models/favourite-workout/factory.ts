import { prisma } from '@lib/db'

import {
  GQLCreateFavouriteWorkoutInput,
  GQLMutationStartWorkoutFromFavouriteArgs,
  GQLUpdateFavouriteWorkoutInput,
} from '@/generated/graphql-server'
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
          instructions: exercise.instructions,
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
            instructions: exercise.instructions,
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

  // Get the user's quick workout plan
  const quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      createdById: userId,
      assignedToId: userId,
      isTemplate: false,
      isDraft: false,
    },
    include: {
      weeks: {
        include: {
          days: {
            where: {
              dayOfWeek: new Date().getDay(),
            },
            include: {
              exercises: true,
            },
          },
        },
      },
    },
  })

  if (!quickWorkoutPlan) {
    throw new Error('No quick workout plan found. Please create one first.')
  }

  // Get today's workout day
  const today = new Date()
  const currentWeek = quickWorkoutPlan.weeks[0]
  const todaysWorkout = currentWeek?.days.find(
    (day) => day.dayOfWeek === today.getDay(),
  )

  if (!todaysWorkout) {
    throw new Error('No workout day found for today')
  }

  // Copy exercises from favourite to today's workout
  await prisma.$transaction(async (tx) => {
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
          instructions: favExercise.instructions,
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

  return quickWorkoutPlan.id
}
