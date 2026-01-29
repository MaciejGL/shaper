import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser()

    const { id } = await params

    const plan = await prisma.trainingPlan.findUnique({
      relationLoadStrategy: 'query',
      where: { id },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                exercises: {
                  include: {
                    base: {
                      include: {
                        images: true,
                      },
                    },
                    sets: true,
                  },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { dayOfWeek: 'asc' },
            },
          },
          orderBy: { weekNumber: 'asc' },
        },
      },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Training plan not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error fetching training plan exercises:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
