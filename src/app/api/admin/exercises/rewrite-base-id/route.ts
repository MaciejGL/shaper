import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/db'
import { clearCachePattern } from '@/lib/redis'

/**
 * POST /api/admin/exercises/rewrite-base-id
 * Rewrite baseId for training exercises
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await requireAdminUser()

    const body = await req.json()
    const { oldBaseId, newBaseId, exerciseName, preview } = body

    if (!oldBaseId || !newBaseId) {
      return NextResponse.json(
        { error: 'oldBaseId and newBaseId are required' },
        { status: 400 },
      )
    }

    // Build where clause
    const where: {
      baseId: string
      name?: string
    } = {
      baseId: oldBaseId,
    }

    if (exerciseName) {
      where.name = exerciseName
    }

    if (preview) {
      // Preview mode - just return what would be updated
      const exercisesToUpdate = await prisma.trainingExercise.findMany({
        where,
        select: {
          id: true,
          name: true,
          baseId: true,
          day: {
            select: {
              dayOfWeek: true,
              week: {
                select: {
                  weekNumber: true,
                  plan: {
                    select: {
                      assignedTo: {
                        select: {
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })

      return NextResponse.json({
        exercisesToUpdate: exercisesToUpdate.map((ex) => ({
          id: ex.id,
          name: ex.name,
          currentBaseId: ex.baseId,
          weekNumber: ex.day.week.weekNumber,
          dayOfWeek: ex.day.dayOfWeek,
          userEmail: ex.day.week.plan.assignedTo?.email || 'Unknown',
        })),
      })
    } else {
      // Apply mode - update the exercises
      const result = await prisma.trainingExercise.updateMany({
        where,
        data: {
          baseId: newBaseId,
        },
      })

      // Clear cache for previous exercises
      try {
        await clearCachePattern('previous-exercises-v1:*')
        console.info(
          '[CACHE] Cleared previous exercises cache after baseId rewrite',
        )
      } catch (error) {
        console.warn('[CACHE] Could not clear cache:', error)
      }

      return NextResponse.json({
        updated: result.count,
      })
    }
  } catch (error) {
    console.error('[API] Error in rewrite-base-id:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
