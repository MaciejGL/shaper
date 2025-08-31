import { NextRequest, NextResponse } from 'next/server'

import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

/**
 * Lightweight endpoint to fetch all exercise names for duplicate detection
 * Returns minimal data needed for similarity checking without performance impact
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const { searchParams } = request.nextUrl
    const includePrivate = searchParams.get('includePrivate') === 'true'

    // Build where clause based on access level
    const whereClause: Prisma.BaseExerciseWhereInput = {}

    // Only include user's own private exercises if requested
    if (includePrivate) {
      whereClause.OR = [
        { isPublic: true }, // All public exercises
        {
          AND: [
            { isPublic: false },
            { createdById: user.user.id }, // Only user's private exercises
          ],
        },
      ]
    } else {
      whereClause.isPublic = true // Only public exercises
    }

    // Fetch minimal exercise data for duplicate checking
    const exercises = await prisma.baseExercise.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        isPublic: true,
        createdById: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      exercises: exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        isPublic: ex.isPublic,
        isOwnExercise: ex.createdById === user.user.id,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch exercise names:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercise names' },
      { status: 500 },
    )
  }
}
