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
        user: true,
      },
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: 'You must be an admin of this team' },
        { status: 403 },
      )
    }

    const team = teamMember.team

    // Check if team already has a connected account
    if (team.stripeConnectedAccountId) {
      return NextResponse.json(
        {
          error: 'Team already has a connected account',
          accountId: team.stripeConnectedAccountId,
        },
        { status: 400 },
      )
    }

    // Create Stripe Express account for the team
    console.info(`Creating Stripe Connect account for team: ${team.id}`)

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'NO', // Default to Norway
      email: teamMember.user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'company',
      metadata: {
        hypertro_entity_type: 'team',
        hypertro_team_id: team.id,
        hypertro_admin_user_id: session.user.id,
        created_by: 'team_admin',
        created_at: new Date().toISOString(),
      },
    })

    // Save the account ID to the team
    await prisma.team.update({
      where: { id: team.id },
      data: { stripeConnectedAccountId: account.id },
    })

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/trainer/teams?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/trainer/teams?connected=true`,
      type: 'account_onboarding',
    })

    console.info(`✅ Created Connect account ${account.id} for team ${team.id}`)

    return NextResponse.json({
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
      teamName: team.name,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    })
  } catch (error) {
    console.error('Failed to create team onboarding link:', error)
    return NextResponse.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 },
    )
  }
}
