import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import {
  isModeratorUser,
  moderatorAccessDeniedResponse,
} from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check moderator access
    const hasModeratorAccess = await isModeratorUser()
    if (!hasModeratorAccess) {
      return moderatorAccessDeniedResponse()
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const premium = searchParams.get('premium') || 'free'
    const version = searchParams.get('version') || 'all'
    const publicFilter = searchParams.get('public') || 'public'
    const imagesFilter = searchParams.get('images') || 'all'
    const videoFilter = searchParams.get('video') || 'all'
    const descriptionFilter = searchParams.get('description') || 'all'
    const muscleFilter = searchParams.get('muscle') || 'all'

    // Build where clause
    const conditions: Prisma.BaseExerciseWhereInput[] = []

    // Search filter
    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      })
    }

    // Premium filter
    if (premium === 'premium') {
      conditions.push({ isPremium: true })
    } else if (premium === 'free') {
      conditions.push({ isPremium: false })
    }

    // Version filter
    if (version === 'v1') {
      conditions.push({ version: { not: 2 } })
    } else if (version === 'v2') {
      conditions.push({ version: 2 })
    }
    // 'all' means no version filter

    // Public filter
    if (publicFilter === 'public') {
      conditions.push({ isPublic: true })
    } else if (publicFilter === 'private') {
      conditions.push({ isPublic: false })
    }
    // 'all' means no public filter

    // Images filter
    if (imagesFilter === 'with') {
      conditions.push({ images: { some: {} } })
    } else if (imagesFilter === 'without') {
      conditions.push({ images: { none: {} } })
    }
    // 'all' means no images filter

    // Video filter
    if (videoFilter === 'with') {
      conditions.push({
        AND: [{ videoUrl: { not: null } }, { videoUrl: { not: '' } }],
      })
    } else if (videoFilter === 'without') {
      conditions.push({
        OR: [{ videoUrl: null }, { videoUrl: '' }],
      })
    }
    // 'all' means no video filter

    // Description filter
    if (descriptionFilter === 'with') {
      conditions.push({
        AND: [{ description: { not: null } }, { description: { not: '' } }],
      })
    } else if (descriptionFilter === 'without') {
      conditions.push({
        OR: [{ description: null }, { description: '' }],
      })
    }
    // 'all' means no description filter

    // Muscle category filter
    if (muscleFilter !== 'all') {
      conditions.push({
        muscleGroups: {
          some: {
            groupSlug: muscleFilter,
          },
        },
      })
    }
    // 'all' means no muscle filter

    // Combine all conditions with AND
    const where: Prisma.BaseExerciseWhereInput =
      conditions.length > 0 ? { AND: conditions } : {}

    // Get total count for pagination
    const totalItems = await prisma.baseExercise.count({ where })
    const totalPages = Math.ceil(totalItems / limit)
    const skip = (page - 1) * limit

    // Fetch exercises with selected fields only (moderator access)
    const exercises = await prisma.baseExercise.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        instructions: true,
        tips: true,
        equipment: true,
        isPublic: true,
        isPremium: true,
        version: true,
        videoUrl: true,
        images: {
          select: {
            id: true,
            url: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
        muscleGroups: {
          select: {
            id: true,
            name: true,
            alias: true,
            groupSlug: true,
          },
          orderBy: { name: 'asc' },
        },
        secondaryMuscleGroups: {
          select: {
            id: true,
            name: true,
            alias: true,
            groupSlug: true,
          },
          orderBy: { name: 'asc' },
        },
        substitutes: {
          select: {
            substitute: {
              select: {
                id: true,
                name: true,
                equipment: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { name: 'asc' }, // Alphabetical
      ],
      skip,
      take: limit,
    })

    // Transform the response to flatten substitute structure
    const transformedExercises = exercises.map((exercise) => ({
      ...exercise,
      substitutes: exercise.substitutes?.map((sub) => sub.substitute) || [],
    }))

    return NextResponse.json({
      exercises: transformedExercises,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching exercises for moderator:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 },
    )
  }
}
