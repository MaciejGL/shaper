import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    await requireAdminUser()

    const { userId, stripeConnectedAccountId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { stripeConnectedAccountId: stripeConnectedAccountId || null },
      select: {
        id: true,
        email: true,
        name: true,
        stripeConnectedAccountId: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to update user Stripe account:', error)
    return NextResponse.json(
      { error: 'Failed to update user Stripe account' },
      { status: 500 },
    )
  }
}
