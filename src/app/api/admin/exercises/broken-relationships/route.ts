import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Find training exercises with null baseId
    const brokenExercises = await prisma.trainingExercise.findMany({
      where: {
        baseId: null,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        baseId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      //   take: 300, // Limit for performance
    })

    return NextResponse.json({
      totalBroken: brokenExercises.length,
      exercises: brokenExercises,
    })
  } catch (error) {
    console.error('Error fetching broken exercise relationships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch broken exercise relationships' },
      { status: 500 },
    )
  }
}
