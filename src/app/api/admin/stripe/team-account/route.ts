import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    await requireAdminUser()

    const { teamId, stripeConnectedAccountId } = await request.json()

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 },
      )
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: { stripeConnectedAccountId: stripeConnectedAccountId || null },
      select: {
        id: true,
        name: true,
        stripeConnectedAccountId: true,
      },
    })

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Failed to update team Stripe account:', error)
    return NextResponse.json(
      { error: 'Failed to update team Stripe account' },
      { status: 500 },
    )
  }
}
