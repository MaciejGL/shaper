import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import {
  abortMuscleGeneration,
  ExerciseMuscleGenerator,
  getGenerationProgress,
  isGenerationRunning,
} from '@/scripts/generate-exercise-muscles'

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dryRun = false, batchSize = 10, skipExisting = true } = body

    // Validate inputs
    if (typeof dryRun !== 'boolean' || typeof skipExisting !== 'boolean') {
      return NextResponse.json(
        {
          error: 'Invalid parameters. dryRun and skipExisting must be boolean',
        },
        { status: 400 },
      )
    }

    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 50) {
      return NextResponse.json(
        { error: 'Invalid batchSize. Must be integer between 1 and 50' },
        { status: 400 },
      )
    }

    // Check if generation is already running
    if (isGenerationRunning()) {
      return NextResponse.json(
        { error: 'Generation already in progress. Stop it first.' },
        { status: 409 },
      )
    }

    // Initialize generator with configuration
    const generator = new ExerciseMuscleGenerator({
      dryRun,
      batchSize,
      skipExisting,
      maxRetries: 3,
      delayBetweenRequests: 2000,
    })

    // Start generation process
    const generationPromise = generator.generateMuscles()

    if (dryRun) {
      // For dry runs, we can wait for completion since no actual updates occur
      const result = await generationPromise
      return NextResponse.json({
        success: true,
        message: `Dry run completed. ${result.processed} exercises analyzed.`,
        dryRun: true,
        ...result,
      })
    } else {
      // For actual runs, return immediately and let it run in background
      generationPromise.catch((error) => {
        console.error('Background exercise muscle generation failed:', error)
      })

      return NextResponse.json({
        success: true,
        message: 'Exercise muscle generation started in background',
        dryRun: false,
      })
    }
  } catch (error) {
    console.error('Failed to start exercise muscle generation:', error)
    return NextResponse.json(
      { error: 'Failed to start muscle generation' },
      { status: 500 },
    )
  }
}

// DELETE endpoint to abort the generation
export async function DELETE() {
  try {
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wasRunning = abortMuscleGeneration()

    if (wasRunning) {
      return NextResponse.json({
        success: true,
        message: 'Generation stopped successfully',
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No generation was running',
      })
    }
  } catch (error) {
    console.error('Failed to abort generation:', error)
    return NextResponse.json(
      { error: 'Failed to abort generation' },
      { status: 500 },
    )
  }
}

// GET endpoint to check exercises that need muscle groups and generation progress
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if only progress is requested
    const progressOnly = request.nextUrl.searchParams.get('progress') === 'true'

    // Always include generation progress
    const progress = getGenerationProgress()

    if (progressOnly) {
      return NextResponse.json({ progress })
    }

    const { prisma } = await import('@/lib/db')

    // Get all public exercises with their muscle groups
    const allPublicExercises = await prisma.baseExercise.findMany({
      where: { isPublic: true },
      select: {
        muscleGroups: { select: { id: true } },
        secondaryMuscleGroups: { select: { id: true } },
      },
    })

    const totalPublicExercises = allPublicExercises.length

    const exercisesWithoutPrimary = allPublicExercises.filter(
      (ex) => ex.muscleGroups.length === 0,
    ).length

    const exercisesWithoutSecondary = allPublicExercises.filter(
      (ex) => ex.secondaryMuscleGroups.length === 0,
    ).length

    const exercisesNeedingMuscles = allPublicExercises.filter(
      (ex) =>
        ex.muscleGroups.length === 0 || ex.secondaryMuscleGroups.length === 0,
    ).length

    const exercisesFullyAssigned = allPublicExercises.filter(
      (ex) => ex.muscleGroups.length > 0 && ex.secondaryMuscleGroups.length > 0,
    ).length

    return NextResponse.json({
      totalPublicExercises,
      exercisesWithoutPrimary,
      exercisesWithoutSecondary,
      exercisesNeedingMuscles,
      exercisesFullyAssigned,
      percentageComplete: Math.round(
        (exercisesFullyAssigned / totalPublicExercises) * 100,
      ),
      progress,
    })
  } catch (error) {
    console.error('Failed to fetch exercise muscle stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 },
    )
  }
}
