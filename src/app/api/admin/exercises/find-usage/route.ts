import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const baseId = searchParams.get('baseId')

    if (!baseId) {
      return NextResponse.json(
        { error: 'baseId parameter is required' },
        { status: 400 },
      )
    }

    const baseExercise = await prisma.baseExercise.findUnique({
      where: { id: baseId },
      select: {
        id: true,
        name: true,
      },
    })

    if (!baseExercise) {
      return NextResponse.json(
        { error: 'Base exercise not found' },
        { status: 404 },
      )
    }

    const trainingExercises = await prisma.trainingExercise.findMany({
      where: {
        baseId: baseId,
      },
      select: {
        id: true,
        name: true,
        day: {
          select: {
            id: true,
            dayOfWeek: true,
            week: {
              select: {
                id: true,
                weekNumber: true,
                plan: {
                  select: {
                    id: true,
                    title: true,
                    active: true,
                    isTemplate: true,
                    isDraft: true,
                    completedAt: true,
                    assignedTo: {
                      select: {
                        id: true,
                        email: true,
                        name: true,
                      },
                    },
                    createdBy: {
                      select: {
                        id: true,
                        email: true,
                        name: true,
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

    const planMap = new Map<
      string,
      {
        planId: string
        planTitle: string
        planActive: boolean
        planIsTemplate: boolean
        planIsDraft: boolean
        planCompletedAt: string | null
        userId: string
        userEmail: string
        userName: string | null
        createdById: string
        createdByEmail: string
        createdByName: string | null
        exerciseCount: number
        exercises: {
          exerciseId: string
          exerciseName: string
          weekNumber: number
          dayOfWeek: number
        }[]
      }
    >()

    for (const exercise of trainingExercises) {
      const plan = exercise.day.week.plan
      const planId = plan.id

      if (!planMap.has(planId)) {
        const assignedUser = plan.assignedTo
        const createdByUser = plan.createdBy

        planMap.set(planId, {
          planId: plan.id,
          planTitle: plan.title,
          planActive: plan.active,
          planIsTemplate: plan.isTemplate,
          planIsDraft: plan.isDraft,
          planCompletedAt: plan.completedAt?.toISOString() || null,
          userId: assignedUser?.id || createdByUser.id,
          userEmail: assignedUser?.email || createdByUser.email,
          userName: assignedUser?.name || createdByUser.name,
          createdById: createdByUser.id,
          createdByEmail: createdByUser.email,
          createdByName: createdByUser.name,
          exerciseCount: 0,
          exercises: [],
        })
      }

      const planData = planMap.get(planId)!
      planData.exerciseCount++
      planData.exercises.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        weekNumber: exercise.day.week.weekNumber,
        dayOfWeek: exercise.day.dayOfWeek,
      })
    }

    const plans = Array.from(planMap.values()).sort((a, b) => {
      if (a.planActive !== b.planActive) return a.planActive ? -1 : 1
      return b.exerciseCount - a.exerciseCount
    })

    return NextResponse.json({
      baseExercise: {
        id: baseExercise.id,
        name: baseExercise.name,
      },
      totalPlans: plans.length,
      totalExerciseInstances: trainingExercises.length,
      plans,
    })
  } catch (error) {
    console.error('Error finding exercise usage:', error)
    return NextResponse.json(
      {
        error: 'Failed to find exercise usage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

