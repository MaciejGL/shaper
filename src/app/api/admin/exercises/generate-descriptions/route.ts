import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { ExerciseDescriptionGenerator } from '@/scripts/generate-exercise-descriptions'

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

    // Initialize generator with configuration
    const generator = new ExerciseDescriptionGenerator({
      dryRun,
      batchSize,
      skipExisting: skipExisting,
      maxRetries: 3,
      delayBetweenRequests: 2000,
    })

    // Start generation process
    // Note: This runs in the background, so we return immediately
    // In production, you might want to use a job queue for this
    const generationPromise = generator.generateDescriptions()

    if (dryRun) {
      // For dry runs, we can wait for completion since no actual updates occur
      await generationPromise
      return NextResponse.json({
        success: true,
        message: 'Dry run completed successfully',
        dryRun: true,
      })
    } else {
      // For actual runs, return immediately and let it run in background
      generationPromise.catch((error) => {
        console.error(
          'Background exercise description generation failed:',
          error,
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Exercise description generation started in background',
        dryRun: false,
      })
    }
  } catch (error) {
    console.error('Failed to start exercise description generation:', error)
    return NextResponse.json(
      { error: 'Failed to start generation process' },
      { status: 500 },
    )
  }
}

// GET endpoint to check exercises that need descriptions
export async function GET() {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prisma } = await import('@/lib/db')

    // Get stats about exercises needing descriptions
    // Get all public exercises and calculate stats in application logic
    const allPublicExercises = await prisma.baseExercise.findMany({
      where: { isPublic: true },
      select: {
        description: true,
        instructions: true,
        tips: true,
      },
    })

    const totalPublicExercises = allPublicExercises.length
    const exercisesWithoutDescription = allPublicExercises.filter(
      (ex) => !ex.description || ex.description.trim() === '',
    ).length
    const exercisesWithoutInstructions = allPublicExercises.filter(
      (ex) => !ex.instructions || ex.instructions.length === 0,
    ).length
    const exercisesWithoutTips = allPublicExercises.filter(
      (ex) => !ex.tips || ex.tips.length === 0,
    ).length
    const exercisesNeedingAnyContent = allPublicExercises.filter((ex) => {
      const needsDescription = !ex.description || ex.description.trim() === ''
      const needsInstructions = !ex.instructions || ex.instructions.length === 0
      const needsTips = !ex.tips || ex.tips.length === 0
      return needsDescription || needsInstructions || needsTips
    }).length

    return NextResponse.json({
      totalPublicExercises,
      exercisesWithoutDescription,
      exercisesWithoutInstructions,
      exercisesWithoutTips,
      exercisesNeedingAnyContent,
      percentageComplete: Math.round(
        ((totalPublicExercises - exercisesNeedingAnyContent) /
          totalPublicExercises) *
          100,
      ),
    })
  } catch (error) {
    console.error('Failed to fetch exercise description stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 },
    )
  }
}
