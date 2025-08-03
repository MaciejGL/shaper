import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const premium = searchParams.get('premium') || 'free'
    const version = searchParams.get('version') || 'all'
    const publicFilter = searchParams.get('public') || 'public'

    // Build where clause
    const where: Prisma.BaseExerciseWhereInput = {}

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Premium filter
    if (premium === 'premium') {
      where.isPremium = true
    } else if (premium === 'free') {
      where.isPremium = false
    }

    // Version filter
    if (version === 'v1') {
      where.version = { not: 2 }
    } else if (version === 'v2') {
      where.version = 2
    }
    // 'all' means no version filter

    // Public filter
    if (publicFilter === 'public') {
      where.isPublic = true
    } else if (publicFilter === 'private') {
      where.isPublic = false
    }
    // 'all' means no public filter

    // Get total count for pagination
    const totalItems = await prisma.baseExercise.count({ where })
    const totalPages = Math.ceil(totalItems / limit)
    const skip = (page - 1) * limit

    // Fetch exercises
    const exercises = await prisma.baseExercise.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        difficulty: true,
        equipment: true,
        videoUrl: true,
        isPublic: true,
        isPremium: true,
        version: true,
        dataSource: true,
        additionalInstructions: true,
        instructions: true,
        tips: true,
      },
      orderBy: [
        { isPremium: 'desc' }, // Premium first
        { version: 'desc' }, // V2 before V1
        { name: 'asc' },
      ],
      skip,
      take: limit,
    })

    return NextResponse.json({
      exercises,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Failed to fetch exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 },
    )
  }
}
