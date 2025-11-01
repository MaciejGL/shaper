import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { getBaseUrl } from '@/lib/get-base-url'
import { stripe } from '@/lib/stripe/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, returnUrl } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    // Get user with Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        {
          error:
            'User has no Stripe customer ID. Please create a subscription first.',
        },
        { status: 400 },
      )
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${getBaseUrl()}/fitspace/settings`,
    })

    return NextResponse.json({
      url: portalSession.url,
    })
  } catch (error) {
    console.error('Error creating customer portal session:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 },
    )
  }
}
