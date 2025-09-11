import { NextRequest, NextResponse } from 'next/server'

import { GQLEquipment } from '@/generated/graphql-client'
import {
  moderatorAccessDeniedResponse,
  requireModeratorUser,
} from '@/lib/admin-auth'
import { ImageHandler } from '@/lib/aws/image-handler'
import { prisma } from '@/lib/db'
import { processExerciseImageToOptimized } from '@/lib/image-optimization'

interface CreatePublicExerciseInput {
  name: string
  description?: string | null
  videoUrl?: string | null
  equipment?: GQLEquipment
  muscleGroups: string[]
  secondaryMuscleGroups?: string[]
  substituteIds?: string[]
  imageUrls?: string[]
  isPremium?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Check moderator access
    await requireModeratorUser()

    const input: CreatePublicExerciseInput = await request.json()

    if (!input.name?.trim()) {
      return NextResponse.json(
        { error: 'Exercise name is required' },
        { status: 400 },
      )
    }

    if (!input.muscleGroups?.length) {
      return NextResponse.json(
        { error: 'At least one muscle group is required' },
        { status: 400 },
      )
    }

    // Check if exercise with same name already exists
    const existingExercise = await prisma.baseExercise.findFirst({
      where: {
        isPublic: true,
        name: {
          equals: input.name.trim(),
          mode: 'insensitive',
        },
      },
    })

    if (existingExercise) {
      return NextResponse.json(
        { error: 'An exercise with this name already exists' },
        { status: 409 },
      )
    }

    // Validate muscle groups exist
    const muscleGroups = await prisma.muscleGroup.findMany({
      where: {
        id: { in: input.muscleGroups },
      },
    })

    if (muscleGroups.length !== input.muscleGroups.length) {
      return NextResponse.json(
        { error: 'Some muscle groups were not found' },
        { status: 400 },
      )
    }

    // Validate secondary muscle groups if provided
    let secondaryMuscleGroups: { id: string }[] = []
    if (input.secondaryMuscleGroups?.length) {
      const secondaryMuscleGroupsData = await prisma.muscleGroup.findMany({
        where: {
          id: { in: input.secondaryMuscleGroups },
        },
      })

      if (
        secondaryMuscleGroupsData.length !== input.secondaryMuscleGroups.length
      ) {
        return NextResponse.json(
          { error: 'Some secondary muscle groups were not found' },
          { status: 400 },
        )
      }

      secondaryMuscleGroups = secondaryMuscleGroupsData.map((mg) => ({
        id: mg.id,
      }))
    }

    // Create the public exercise
    const exercise = await prisma.baseExercise.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        videoUrl: input.videoUrl?.trim() || null,
        equipment: input.equipment,
        isPublic: true, // This is the key difference - always public for moderator-created exercises
        isPremium: input.isPremium ?? false,
        version: 2, // Default to V2 for new exercises
        muscleGroups: {
          connect: muscleGroups.map((mg) => ({ id: mg.id })),
        },
        secondaryMuscleGroups: {
          connect: secondaryMuscleGroups,
        },
      },
    })

    // Add substitute exercises if provided
    if (input.substituteIds?.length) {
      // Validate that substitute exercises exist and are public
      const substitutes = await prisma.baseExercise.findMany({
        where: {
          id: { in: input.substituteIds },
          isPublic: true, // Only allow public exercises as substitutes for public exercises
        },
      })

      if (substitutes.length !== input.substituteIds.length) {
        return NextResponse.json(
          {
            error: 'Some substitute exercises were not found or are not public',
          },
          { status: 400 },
        )
      }

      await prisma.baseExerciseSubstitute.createMany({
        data: substitutes.map((substitute) => ({
          originalId: exercise.id,
          substituteId: substitute.id,
        })),
      })
    }

    // Add images with optimization if provided
    if (input.imageUrls?.length) {
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
            entityType: 'exercise' as const,
            entityId: exercise.id,
          }
        }),
      )

      await prisma.image.createMany({
        data: processedImages,
      })
    }

    return NextResponse.json({
      success: true,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        isPublic: exercise.isPublic,
        isPremium: exercise.isPremium,
      },
    })
  } catch (error) {
    console.error('Error creating public exercise for moderator:', error)

    if (
      error instanceof Error &&
      error.message.includes('Moderator access required')
    ) {
      return moderatorAccessDeniedResponse()
    }

    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 },
    )
  }
}
