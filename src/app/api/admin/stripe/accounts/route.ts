import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type') // 'users', 'teams', or 'all'

    const results: {
      users?: {
        id: string
        email: string
        name: string | null
        role: string
        stripeConnectedAccountId: string | null
      }[]
      teams?: {
        id: string
        name: string
        stripeConnectedAccountId: string | null
        memberCount: number
      }[]
    } = {}

    // Build search conditions
    const searchCondition = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    if (type === 'users' || type === 'all' || !type) {
      const users = await prisma.user.findMany({
        where: {
          role: { in: ['TRAINER', 'ADMIN'] }, // Only show trainers and admins
          ...searchCondition,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          stripeConnectedAccountId: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit for performance
      })
      results.users = users
    }

    if (type === 'teams' || type === 'all' || !type) {
      const teamSearchCondition = search
        ? { name: { contains: search, mode: 'insensitive' as const } }
        : {}

      const teams = await prisma.team.findMany({
        where: teamSearchCondition,
        select: {
          id: true,
          name: true,
          stripeConnectedAccountId: true,
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit for performance
      })

      results.teams = teams.map((team) => ({
        id: team.id,
        name: team.name,
        stripeConnectedAccountId: team.stripeConnectedAccountId,
        memberCount: team._count.members,
      }))
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Failed to fetch Stripe accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Stripe accounts' },
      { status: 500 },
    )
  }
}
