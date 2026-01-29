import { formatISO, startOfDay, startOfISOWeek } from 'date-fns'
import { GraphQLError } from 'graphql'
import { groupBy } from 'lodash'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { ImageHandler } from '@/lib/aws/image-handler'
import {
  getPublicExerciseById,
  getPublicExercises,
} from '@/lib/cache/base-exercise-cache'
import { prisma } from '@/lib/db'
import { getExerciseVersionWhereClause } from '@/lib/exercise-version-filter'
import {
  deleteExerciseImageVariants,
  processExerciseImageToOptimized,
} from '@/lib/image-optimization'
import { GQLContext } from '@/types/gql-context'
import {
  aggregateEstimated1RM,
  calculateEstimated1RM,
} from '@/utils/one-rm-calculator'

import BaseExercise from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  userExercises: async (_, { where }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const whereClause: Prisma.BaseExerciseWhereInput = {
      createdBy: {
        id: user.user.id,
      },
    }

    if (where?.equipment) {
      whereClause.equipment = where.equipment
    }

    if (where?.muscleGroups) {
      whereClause.muscleGroups = {
        some: {
          id: { in: where.muscleGroups },
        },
      }
    }

    const exercises = await prisma.baseExercise.findMany({
      relationLoadStrategy: 'query',
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
      include: {
        images: true,
        muscleGroups: true,
        secondaryMuscleGroups: true,
      },
    })

    if (!exercises.length) {
      return []
    }

    return exercises.map((exercise) => new BaseExercise(exercise, context))
  },
  publicExercises: async (_, { where }, context) => {
    // Use cached public exercises - cache service handles filtering and environment version filter
    const exercises = await getPublicExercises(where)

    return exercises.map((exercise) => new BaseExercise(exercise, context))
  },
  getExercises: async (_, __, context) => {
    const user = context.user
    const trainerId = user?.user.trainerId
    if (!user) {
      throw new Error('User not found')
    }

    const [publicExercises, trainerExercises, userExercises] =
      await Promise.all([
        // Use cached public exercises (no filtering needed here)
        getPublicExercises(),

        // Keep trainer exercises as direct DB query (not cached)
        trainerId &&
          prisma.baseExercise.findMany({
            relationLoadStrategy: 'query',
            where: {
              createdBy: {
                id: trainerId,
              },
            },
            include: {
              images: true,
              muscleGroups: true,
              secondaryMuscleGroups: true,
            },
          }),

        // User's own exercises (private library)
        prisma.baseExercise.findMany({
          relationLoadStrategy: 'query',
          where: {
            createdBy: {
              id: user.user.id,
            },
          },
          orderBy: {
            name: 'asc',
          },
          include: {
            images: true,
            muscleGroups: true,
            secondaryMuscleGroups: true,
          },
        }),
      ])

    return {
      publicExercises: publicExercises.map(
        (exercise) => new BaseExercise(exercise, context),
      ),
      trainerExercises: trainerExercises
        ? trainerExercises.map(
            (exercise) => new BaseExercise(exercise, context),
          )
        : [],
      userExercises: userExercises.map(
        (exercise) => new BaseExercise(exercise, context),
      ),
    }
  },
  exercise: async (_, { id }, context) => {
    // Try to get from public exercise cache first
    let exercise = await getPublicExerciseById(id)

    // If not found in cache (not a public exercise), query database directly
    if (!exercise) {
      exercise = await prisma.baseExercise.findUnique({
        relationLoadStrategy: 'query',
        where: { id },
        include: {
          images: true,
          muscleGroups: true,
          secondaryMuscleGroups: true,
        },
      })
    }

    return exercise ? new BaseExercise(exercise, context) : null
  },
  exercisesProgressByUser: async (_, { userId, exerciseId }, context) => {
    const targetUserId = userId
    if (!targetUserId) throw new Error('User not found')

    // 1️⃣ Fetch all logs at once
    const logs = await prisma.exerciseSetLog.findMany({
      where: {
        ExerciseSet: {
          exercise: {
            baseId: exerciseId || { not: null },
            day: { week: { plan: { assignedToId: targetUserId } } },
          },
        },
        weight: { not: null },
        reps: { not: null },
      },
      include: { ExerciseSet: { include: { exercise: true } } },
      orderBy: {
        ExerciseSet: {
          exercise: {
            name: 'asc',
          },
        },
      },
    })

    if (!logs.length) return []

    // 2️⃣ Group logs by baseExerciseId
    const logsByExercise = logs.reduce(
      (acc, log) => {
        const baseExerciseId = log.ExerciseSet?.exercise.baseId
        if (!baseExerciseId) return acc
        if (!acc[baseExerciseId]) acc[baseExerciseId] = []
        acc[baseExerciseId].push(log)
        return acc
      },
      {} as Record<string, typeof logs>,
    )

    const baseExerciseIds = Object.keys(logsByExercise)

    // 3️⃣ Fetch all BaseExercises at once
    const baseExercises = await prisma.baseExercise.findMany({
      relationLoadStrategy: 'query',
      where: { id: { in: baseExerciseIds } },
      include: {
        muscleGroups: true,
      },
    })

    // Build a quick map for fast access
    const baseExerciseMap = new Map(
      baseExercises.map((ex) => [ex.id, new BaseExercise(ex, context)]),
    )

    // 5️⃣ Process each group into ExerciseProgress
    const results = baseExerciseIds.map((baseExerciseId) => {
      const logs = logsByExercise[baseExerciseId]

      const entries = logs.map((log) => {
        const reps = log.reps ?? 0
        const weight = log.weight ?? 0

        // Calculate 1RM for each individual set using shared utility
        const estimated1RM = calculateEstimated1RM(weight, reps)

        return {
          date: log.createdAt,
          estimated1RM,
          totalVolume: reps * weight,
          rpe: log.rpe ?? 0,
          weight: log.weight ?? 0,
          reps: log.reps ?? 0,
        }
      })

      const logsByDay = groupBy(entries, (e) =>
        formatISO(startOfDay(e.date), { representation: 'date' }),
      )

      const estimated1RMProgress = Object.entries(logsByDay).map(
        ([day, dayLogs]) => ({
          date: day, // ISO string (yyyy-MM-dd)
          average1RM: aggregateEstimated1RM(
            dayLogs.map((l) => l.estimated1RM),
            'best',
          ),
          detailedLogs: dayLogs.map((l) => ({
            estimated1RM: l.estimated1RM,
            weight: l.weight,
            reps: l.reps,
          })),
        }),
      )
      // Weekly aggregation (total volume & total sets)
      const totalVolumeByWeek = new Map<
        string,
        { totalVolume: number; totalSets: number }
      >()

      for (const e of entries) {
        const week = formatISO(startOfISOWeek(e.date), {
          representation: 'date',
        })
        const existing = totalVolumeByWeek.get(week) ?? {
          totalVolume: 0,
          totalSets: 0,
        }
        totalVolumeByWeek.set(week, {
          totalVolume: existing.totalVolume + e.totalVolume,
          totalSets: existing.totalSets + 1,
        })
      }

      const totalVolumeProgress = [...totalVolumeByWeek.entries()].map(
        ([week, { totalVolume, totalSets }]) => ({
          week,
          totalVolume,
          totalSets,
        }),
      )

      const averageRpe =
        entries.reduce((sum, e) => sum + e.rpe, 0) / entries.length
      const totalSets = entries.length
      const lastPerformed = entries[entries.length - 1].date.toISOString()

      return {
        baseExercise: baseExerciseMap.get(baseExerciseId),
        estimated1RMProgress,
        totalVolumeProgress, // <-- now includes totalSets per week!
        averageRpe,
        totalSets,
        lastPerformed,
      }
    })

    return results
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createExercise: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const muscleGroups = await prisma.muscleGroup.findMany({
      where: {
        id: { in: input.muscleGroups },
      },
    })

    // Get secondary muscle groups if provided
    let secondaryMuscleGroups: { id: string }[] = []
    if (input.secondaryMuscleGroups?.length) {
      const secondaryMuscleGroupsData = await prisma.muscleGroup.findMany({
        where: {
          id: { in: input.secondaryMuscleGroups },
        },
      })
      secondaryMuscleGroups = secondaryMuscleGroupsData.map((mg) => ({
        id: mg.id,
      }))
    }

    // Create the exercise first
    const exercise = await prisma.baseExercise.create({
      data: {
        name: input.name,
        description: input.description,
        instructions: input.instructions ?? [],
        tips: input.tips ?? [],
        videoUrl: input.videoUrl,
        equipment: input.equipment,
        muscleGroups: {
          connect: muscleGroups.map((mg) => ({ id: mg.id })),
        },
        secondaryMuscleGroups: {
          connect: secondaryMuscleGroups,
        },
        createdBy: {
          connect: {
            id: user.user.id,
          },
        },
      },
    })

    // Add substitute exercises if provided
    if (input.substituteIds && input.substituteIds.length > 0) {
      // Validate that substitute exercises exist and are accessible
      const substitutes = await prisma.baseExercise.findMany({
        relationLoadStrategy: 'query',
        where: {
          id: { in: input.substituteIds },
          OR: [
            { createdById: user.user.id }, // User's own exercises
            {
              isPublic: true,
              ...getExerciseVersionWhereClause(), // Apply environment version filter to public exercises
            },
          ],
        },
      })

      if (substitutes.length !== input.substituteIds.length) {
        throw new Error(
          'Some substitute exercises were not found or are not accessible',
        )
      }

      await prisma.baseExerciseSubstitute.createMany({
        data: substitutes.map((substitute) => ({
          originalId: exercise.id,
          substituteId: substitute.id,
        })),
      })
    }

    // Add images if provided
    if (input.imageUrls && input.imageUrls.length > 0) {
      // Step 1: Move images from temp to final location
      const moveResult = await ImageHandler.move({
        fromUrls: input.imageUrls,
        toId: exercise.id,
        imageType: 'exercise',
      })

      if (!moveResult.success || !moveResult.data) {
        throw new Error('Failed to move images to final location')
      }

      // Step 2: Process each moved image to create optimized versions
      const processedImages = await Promise.all(
        moveResult.data.movedUrls.map(async (url, index) => {
          const optimized = await processExerciseImageToOptimized(url)
          return {
            url,
            thumbnail: optimized.thumbnail,
            medium: optimized.medium,
            large: optimized.large,
            order: index,
            entityType: 'exercise',
            entityId: exercise.id,
          }
        }),
      )

      await prisma.image.createMany({
        data: processedImages,
      })
    }

    return true
  },
  updateExercise: async (_, { id, input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify exercise ownership
    const exercise = await prisma.baseExercise.findFirst({
      where: {
        id,
        createdById: user.user.id,
      },
    })

    if (!exercise) {
      throw new Error('Exercise not found or access denied')
    }

    const muscleGroups = await prisma.muscleGroup.findMany({
      where: {
        id: { in: input.muscleGroups ?? [] },
      },
    })

    // Get secondary muscle groups if provided
    let secondaryMuscleGroups: { id: string }[] = []
    if (input.secondaryMuscleGroups !== undefined) {
      if (input.secondaryMuscleGroups?.length) {
        const secondaryMuscleGroupsData = await prisma.muscleGroup.findMany({
          where: {
            id: { in: input.secondaryMuscleGroups },
          },
        })
        secondaryMuscleGroups = secondaryMuscleGroupsData.map((mg) => ({
          id: mg.id,
        }))
      }
    }

    // Update the exercise
    await prisma.baseExercise.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined,
        instructions: input.instructions ?? undefined,
        tips: input.tips ?? undefined,
        videoUrl: input.videoUrl,
        equipment: input.equipment,
        muscleGroups: {
          set: muscleGroups.map((mg) => ({ id: mg.id })),
        },
        ...(input.secondaryMuscleGroups !== undefined && {
          secondaryMuscleGroups: {
            set: secondaryMuscleGroups,
          },
        }),
      },
    })

    // Update substitute exercises if provided
    if (input.substituteIds !== undefined) {
      // Remove existing substitutes
      await prisma.baseExerciseSubstitute.deleteMany({
        where: { originalId: id },
      })

      // Add new substitutes
      if (input.substituteIds && input.substituteIds.length > 0) {
        // Validate that substitute exercises exist and are accessible
        const substitutes = await prisma.baseExercise.findMany({
          relationLoadStrategy: 'query',
          where: {
            id: { in: input.substituteIds },
            OR: [
              { createdById: user.user.id }, // User's own exercises
              {
                isPublic: true,
                ...getExerciseVersionWhereClause(), // Apply environment version filter to public exercises
              },
            ],
          },
        })

        if (substitutes.length !== input.substituteIds.length) {
          throw new Error(
            'Some substitute exercises were not found or are not accessible',
          )
        }

        await prisma.baseExerciseSubstitute.createMany({
          data: substitutes.map((substitute) => ({
            originalId: id,
            substituteId: substitute.id,
          })),
        })
      }
    }

    // Update images if provided
    if (input.imageUrls !== undefined) {
      // Get existing images to clean up from S3
      const existingImages = await prisma.image.findMany({
        where: {
          entityType: 'exercise',
          entityId: id,
        },
        select: { url: true },
      })

      // Delete existing images and all variants from S3
      if (existingImages.length > 0) {
        const deletePromises = existingImages.map(async (img) => {
          // Delete all variants (original, thumbnail, medium, large)
          await deleteExerciseImageVariants(img.url)
        })
        await Promise.all(deletePromises)
      }

      // Remove existing images from database
      await prisma.image.deleteMany({
        where: {
          entityType: 'exercise',
          entityId: id,
        },
      })

      // Add new images
      if (input.imageUrls && input.imageUrls.length > 0) {
        // Step 1: Move images from temp to final location
        const moveResult = await ImageHandler.move({
          fromUrls: input.imageUrls,
          toId: id,
          imageType: 'exercise',
        })

        if (!moveResult.success || !moveResult.data) {
          throw new Error('Failed to move images to final location')
        }

        // Step 2: Process each moved image to create optimized versions
        const processedImages = await Promise.all(
          moveResult.data.movedUrls.map(async (url, index) => {
            const optimized = await processExerciseImageToOptimized(url)
            return {
              url,
              thumbnail: optimized.thumbnail,
              medium: optimized.medium,
              large: optimized.large,
              order: index,
              entityType: 'exercise',
              entityId: id,
            }
          }),
        )

        await prisma.image.createMany({
          data: processedImages,
        })
      }
    }

    return true
  },
  deleteExercise: async (_, { id }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify exercise ownership
    const exercise = await prisma.baseExercise.findFirst({
      where: {
        id,
        createdById: user.user.id,
      },
    })

    if (!exercise) {
      throw new GraphQLError('Exercise not found or access denied')
    }

    // Check if exercise is used in any training plans
    const trainingExerciseCount = await prisma.trainingExercise.count({
      where: {
        baseId: id,
      },
    })

    if (trainingExerciseCount > 0) {
      throw new GraphQLError(
        `Cannot delete exercise. It is currently used in ${trainingExerciseCount} training plan${trainingExerciseCount === 1 ? '' : 's'}. Please remove it from all training plans before deleting.`,
      )
    }

    // Get exercise images to clean up from S3
    const exerciseImages = await prisma.image.findMany({
      where: {
        entityType: 'exercise',
        entityId: id,
      },
      select: { url: true },
    })

    // Delete images from database first
    await prisma.image.deleteMany({
      where: {
        entityType: 'exercise',
        entityId: id,
      },
    })

    // Delete images and all variants from S3
    if (exerciseImages.length > 0) {
      const deletePromises = exerciseImages.map(async (img) => {
        // Delete all variants (original, thumbnail, medium, large)
        await deleteExerciseImageVariants(img.url)
      })
      await Promise.all(deletePromises)
    }

    // Delete the exercise
    await prisma.baseExercise.delete({
      where: { id },
    })

    return true
  },
  // New substitute exercises management mutations
  addSubstituteExercise: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify original exercise ownership
    const originalExercise = await prisma.baseExercise.findFirst({
      where: {
        id: input.originalId,
        createdById: user.user.id,
      },
    })

    if (!originalExercise) {
      throw new Error('Original exercise not found or access denied')
    }

    // Verify substitute exercise exists and is accessible
    const substituteExercise = await prisma.baseExercise.findFirst({
      where: {
        id: input.substituteId,
        OR: [
          { createdById: user.user.id }, // User's own exercises
          {
            isPublic: true,
            ...getExerciseVersionWhereClause(), // Apply environment version filter to public exercises
          },
        ],
      },
    })

    if (!substituteExercise) {
      throw new Error('Substitute exercise not found or not accessible')
    }

    // Prevent self-substitution
    if (input.originalId === input.substituteId) {
      throw new Error('An exercise cannot be a substitute for itself')
    }

    // Create the substitute relationship
    await prisma.baseExerciseSubstitute.create({
      data: {
        originalId: input.originalId,
        substituteId: input.substituteId,
        reason: input.reason,
      },
    })

    return true
  },
  removeSubstituteExercise: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify original exercise ownership
    const originalExercise = await prisma.baseExercise.findFirst({
      where: {
        id: input.originalId,
        createdById: user.user.id,
      },
    })

    if (!originalExercise) {
      throw new Error('Original exercise not found or access denied')
    }

    // Remove the substitute relationship
    await prisma.baseExerciseSubstitute.deleteMany({
      where: {
        originalId: input.originalId,
        substituteId: input.substituteId,
      },
    })

    return true
  },
  updateSubstituteExercise: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify original exercise ownership
    const originalExercise = await prisma.baseExercise.findFirst({
      where: {
        id: input.originalId,
        createdById: user.user.id,
      },
    })

    if (!originalExercise) {
      throw new Error('Original exercise not found or access denied')
    }

    // Update the substitute relationship
    await prisma.baseExerciseSubstitute.updateMany({
      where: {
        originalId: input.originalId,
        substituteId: input.substituteId,
      },
      data: {
        reason: input.reason,
      },
    })

    return true
  },
}

// const MUSCLES = [
//   {
//     group: 'Abs',
//     muscles: ['Rectus Abdominus (abs)', 'Transverse Abdominus', 'Obliques'],
//   },
//   {
//     group: 'Arms',
//     muscles: ['Biceps', 'Triceps', 'Forearms', 'Flexors', 'Extensors'],
//   },
//   {
//     group: 'Back',
//     muscles: ['Lats', 'Traps', 'Rhomboids', 'Erector Spinae'],
//   },
//   {
//     group: 'Chest',
//     muscles: ['Pectoralis Major', 'Serratus'],
//   },
//   {
//     group: 'Glutes/Hips',
//     muscles: ['Glutes', 'Hip Abductors'],
//   },
//   {
//     group: 'Legs',
//     muscles: ['Quads', 'Hamstrings', 'Adductors', 'Calves', 'Shin'],
//   },
//   {
//     group: 'Neck',
//     muscles: ['Levator Scapulae'],
//   },
//   {
//     group: 'Shoulders',
//     muscles: ['Front Delts', 'Side Delts', 'Rear Delts', 'Rotator Cuff'],
//   },
// ]
