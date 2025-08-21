import { NextRequest, NextResponse } from 'next/server'

import { Prisma } from '@/generated/prisma/client'
import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

// GET /api/admin/users - Get user statistics
export async function GET(request: NextRequest) {
  try {
    await requireAdminUser()

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'stats') {
      return getUserStats()
    } else if (action === 'list') {
      return getUserList(request)
    } else {
      return NextResponse.json(
        { error: 'Invalid action parameter' },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Access denied' },
      { status: 403 },
    )
  }
}

async function getUserStats() {
  const [
    totalUsers,
    totalClients,
    totalTrainers,
    totalAdmins,
    usersWithoutProfiles,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.user.count({ where: { role: 'TRAINER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { profile: null } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ])

  // Calculate active users (users with recent sessions or activity)
  const activeUsers = await prisma.user.count({
    where: {
      OR: [
        {
          sessions: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
        {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
  })

  return NextResponse.json({
    totalUsers,
    totalClients,
    totalTrainers,
    totalAdmins,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    usersWithoutProfiles,
    recentSignups,
  })
}

async function getUserList(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const search = searchParams.get('search')
  const role = searchParams.get('role')
  const hasProfile = searchParams.get('hasProfile')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const whereClause: Prisma.UserWhereInput = {}

  if (role && ['CLIENT', 'TRAINER', 'ADMIN'].includes(role)) {
    whereClause.role = role
  }

  if (search) {
    whereClause.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      {
        profile: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ]
  }

  if (hasProfile !== null) {
    if (hasProfile === 'true') {
      whereClause.profile = { isNot: null }
    } else if (hasProfile === 'false') {
      whereClause.profile = null
    }
  }

  if (dateFrom || dateTo) {
    whereClause.createdAt = {}
    if (dateFrom) {
      whereClause.createdAt.gte = new Date(dateFrom)
    }
    if (dateTo) {
      whereClause.createdAt.lte = new Date(dateTo)
    }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
        trainer: {
          include: { profile: true },
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            sessions: true,
            clients: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where: whereClause }),
  ])

  const userListItems = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.sessions[0]?.createdAt?.toISOString() || null,
    sessionCount: user._count.sessions,
    profile: user.profile
      ? {
          id: user.profile.id,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          phone: user.profile.phone,
          birthday: user.profile.birthday?.toISOString(),
          sex: user.profile.sex,
        }
      : null,
    trainer: user.trainer
      ? {
          id: user.trainer.id,
          email: user.trainer.email,
          firstName: user.trainer.profile?.firstName,
          lastName: user.trainer.profile?.lastName,
        }
      : null,
    clientCount: user._count.clients,
    isActive:
      user.sessions.length > 0 &&
      user.sessions[0].createdAt >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  }))

  return NextResponse.json({
    users: userListItems,
    total,
    hasMore: offset + limit < total,
  })
}
