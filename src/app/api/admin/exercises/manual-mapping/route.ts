import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { brokenExerciseName, correctBaseExerciseName } = await request.json()

    if (!brokenExerciseName || !correctBaseExerciseName) {
      return NextResponse.json(
        { error: 'Both exercise names are required' },
        { status: 400 },
      )
    }

    console.info(
      `🔗 Manual mapping: "${brokenExerciseName}" → "${correctBaseExerciseName}"`,
    )

    // Step 1: Find the correct base exercise
    const baseExercise = await prisma.baseExercise.findFirst({
      where: {
        name: {
          equals: correctBaseExerciseName.trim(),
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    if (!baseExercise) {
      return NextResponse.json(
        {
          error: `Base exercise "${correctBaseExerciseName}" not found`,
          matched: 0,
          updated: 0,
        },
        { status: 404 },
      )
    }

    console.info(
      `✅ Found base exercise: "${baseExercise.name}" (ID: ${baseExercise.id})`,
    )

    // Step 2: Find all training exercises with matching name and null baseId
    const brokenExercises = await prisma.trainingExercise.findMany({
      where: {
        name: {
          equals: brokenExerciseName.trim(),
          mode: 'insensitive',
        },
        baseId: null,
      },
      select: {
        id: true,
        name: true,
      },
    })

    console.info(
      `📋 Found ${brokenExercises.length} broken exercises to update`,
    )

    if (brokenExercises.length === 0) {
      return NextResponse.json({
        message: `No broken exercises found with name "${brokenExerciseName}"`,
        matched: 1,
        updated: 0,
      })
    }

    // Step 3: Update all matching exercises to link to the base exercise
    const updateResult = await prisma.trainingExercise.updateMany({
      where: {
        id: {
          in: brokenExercises.map((ex) => ex.id),
        },
      },
      data: {
        baseId: baseExercise.id,
      },
    })

    console.info(
      `🎉 Successfully updated ${updateResult.count} training exercises`,
    )

    return NextResponse.json({
      message: `Successfully linked ${updateResult.count} exercises to "${baseExercise.name}"`,
      matched: 1,
      updated: updateResult.count,
      baseExercise: {
        id: baseExercise.id,
        name: baseExercise.name,
      },
      brokenExerciseName,
    })
  } catch (error) {
    console.error('Error in manual exercise mapping:', error)
    return NextResponse.json(
      {
        error: 'Failed to map exercises',
        details: error instanceof Error ? error.message : 'Unknown error',
        matched: 0,
        updated: 0,
      },
      { status: 500 },
    )
  }
}
