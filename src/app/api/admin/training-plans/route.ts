import { NextRequest, NextResponse } from 'next/server'

import { Prisma } from '@/generated/prisma/client'
import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// GET /api/admin/training-plans - Get training plans list
export async function GET(request: NextRequest) {
  try {
    await requireAdminUser()

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    const whereClause: Prisma.TrainingPlanWhereInput = {
      isTemplate: true, // Only show template plans (not user-assigned instances)
    }

    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const [plans, total] = await Promise.all([
      prisma.trainingPlan.findMany({
        where: whereClause,
        include: {
          createdBy: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.trainingPlan.count({ where: whereClause }),
    ])

    const planListItems = plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      isPublic: plan.isPublic,
      premium: plan.premium,
      isDraft: plan.isDraft,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
      createdBy: {
        id: plan.createdBy.id,
        name: plan.createdBy.name,
        profile: plan.createdBy.profile
          ? {
              firstName: plan.createdBy.profile.firstName,
              lastName: plan.createdBy.profile.lastName,
            }
          : null,
      },
    }))

    return NextResponse.json({
      plans: planListItems,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Error in admin training plans API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Access denied' },
      { status: 403 },
    )
  }
}

