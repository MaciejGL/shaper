import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'
import { stripe } from '@/lib/stripe/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId } = await request.json()
    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 },
      )
    }

    // Verify user is admin of this team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
        role: 'ADMIN',
      },
      include: {
        team: true,
      },
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: 'You must be an admin of this team' },
        { status: 403 },
      )
    }

    const team = teamMember.team

    // Check if team has a connected account
    if (!team.stripeConnectedAccountId) {
      return NextResponse.json(
        { error: 'Team does not have a connected Stripe account' },
        { status: 400 },
      )
    }

    // Create dashboard link
    const loginLink = await stripe.accounts.createLoginLink(
      team.stripeConnectedAccountId,
    )

    console.info(`📊 Created dashboard link for team ${team.id}`)

    return NextResponse.json({
      success: true,
      dashboardUrl: loginLink.url,
      accountId: team.stripeConnectedAccountId,
      teamName: team.name,
    })
  } catch (error) {
    console.error('Failed to create team dashboard link:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard link' },
      { status: 500 },
    )
  }
}
