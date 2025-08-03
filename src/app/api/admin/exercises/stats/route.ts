import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get exercise statistics
    const [
      totalExercises,
      v1Exercises,
      v2Exercises,
      publicExercises,
      privateExercises,
      difficultyStats,
      equipmentStats,
      dataSourceStats,
      lastImport,
    ] = await Promise.all([
      // Total exercises
      prisma.baseExercise.count(),

      // V1 exercises (version = 1 or null)
      prisma.baseExercise.count({
        where: {
          version: {
            not: 2,
          },
        },
      }),

      // V2 exercises (version = 2)
      prisma.baseExercise.count({
        where: { version: 2 },
      }),

      // Public exercises
      prisma.baseExercise.count({
        where: { isPublic: true },
      }),

      // Private exercises
      prisma.baseExercise.count({
        where: { isPublic: false },
      }),

      // Difficulty breakdown
      prisma.baseExercise.groupBy({
        by: ['difficulty'],
        _count: { difficulty: true },
      }),

      // Equipment breakdown
      prisma.baseExercise.groupBy({
        by: ['equipment'],
        _count: { equipment: true },
      }),

      // Data source breakdown
      prisma.baseExercise.groupBy({
        by: ['dataSource'],
        _count: { dataSource: true },
      }),

      // Last import date
      prisma.baseExercise.findFirst({
        where: {
          version: 2,
          importedAt: { not: null },
        },
        orderBy: { importedAt: 'desc' },
        select: { importedAt: true },
      }),
    ])

    // Process difficulty stats
    const exercisesByDifficulty = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      unclassified: 0,
    }

    difficultyStats.forEach((item) => {
      const difficulty = item.difficulty?.toLowerCase()
      if (difficulty === 'beginner') {
        exercisesByDifficulty.beginner = item._count.difficulty
      } else if (difficulty === 'intermediate') {
        exercisesByDifficulty.intermediate = item._count.difficulty
      } else if (difficulty === 'advanced') {
        exercisesByDifficulty.advanced = item._count.difficulty
      } else {
        exercisesByDifficulty.unclassified += item._count.difficulty
      }
    })

    // Process equipment stats
    const exercisesByEquipment: Record<string, number> = {}
    equipmentStats.forEach((item) => {
      const equipment = item.equipment || 'None'
      exercisesByEquipment[equipment] = item._count.equipment
    })

    // Process data source stats
    const exercisesByDataSource: Record<string, number> = {}
    dataSourceStats.forEach((item) => {
      const source = item.dataSource || 'manual'
      exercisesByDataSource[source] = item._count.dataSource
    })

    return NextResponse.json({
      totalExercises,
      v1Exercises,
      v2Exercises,
      publicExercises,
      privateExercises,
      exercisesByDifficulty,
      exercisesByEquipment,
      exercisesByDataSource,
      lastImportDate: lastImport?.importedAt?.toISOString() || null,
      hasExercemusData: v2Exercises > 0,
    })
  } catch (error) {
    console.error('Failed to fetch exercise stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercise statistics' },
      { status: 500 },
    )
  }
}
