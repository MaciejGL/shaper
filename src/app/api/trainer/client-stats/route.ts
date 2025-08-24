import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const trainerId = searchParams.get('trainerId')

    if (!clientId || !trainerId) {
      return NextResponse.json(
        { error: 'Missing clientId or trainerId' },
        { status: 400 },
      )
    }

    // Verify the trainer is accessing their own client's data
    if (currentUser.user.id !== trainerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get client information
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true, stripeCustomerId: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Initialize stats
    let totalSpent = 0
    let completedPurchases = 0
    let stripePayments: Stripe.PaymentIntent[] = []

    // Query Stripe directly for payment data if client has a Stripe customer ID
    if (client.stripeCustomerId) {
      try {
        // Get all payment intents for this client that involve this trainer
        const payments = await stripe.paymentIntents.list({
          customer: client.stripeCustomerId,
          limit: 100, // Get last 100 payments
        })

        // Filter for successful payments that involve this trainer
        stripePayments = payments.data.filter((payment) => {
          return (
            payment.status === 'succeeded' &&
            payment.metadata?.trainerId === trainerId
          )
        })

        // Calculate statistics from Stripe data
        totalSpent = stripePayments.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        )
        completedPurchases = stripePayments.length
      } catch (error) {
        console.error('Error fetching Stripe payments:', error)
        // Continue with empty data if Stripe fails
      }
    }

    // Get trainer offers for this client (simplified)
    const offers = await prisma.trainerOffer.findMany({
      where: {
        trainerId: trainerId,
        clientEmail: client.email,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate offer statistics
    const activeOffers = offers.filter(
      (offer) =>
        offer.status === 'PENDING' && new Date(offer.expiresAt) > new Date(),
    ).length

    // Calculate commission (90% of total spent)
    const totalCommission = Math.round((totalSpent * 0.9) / 100)

    // Get recent activity from Stripe payments
    const recentActivity = stripePayments
      .slice(0, 10) // Get last 10 payments
      .map((payment) => ({
        id: `payment-${payment.id}`,
        type: 'payment',
        item: payment.description || 'Training Package',
        amount: Math.round(payment.amount / 100), // Convert cents to dollars
        status: 'completed',
        date: new Date(payment.created * 1000).toISOString(),
      }))

    // Simplified offer processing
    const processedOffers = offers.map((offer) => {
      // Get payment data from Stripe if offer is linked
      let actualPaymentData = null
      if (offer.stripePaymentIntentId) {
        const matchingPayment = stripePayments.find(
          (payment) => payment.id === offer.stripePaymentIntentId,
        )
        if (matchingPayment) {
          actualPaymentData = {
            amount: matchingPayment.amount,
            currency: matchingPayment.currency,
            description: matchingPayment.description,
          }
        }
      }

      return {
        id: offer.id,
        token: offer.token,
        status: offer.status,
        personalMessage: offer.personalMessage,
        clientEmail: offer.clientEmail,
        createdAt: offer.createdAt.toISOString(),
        updatedAt: offer.updatedAt.toISOString(),
        expiresAt: offer.expiresAt.toISOString(),
        completedAt: offer.completedAt?.toISOString() || null,
        // Package info from simplified packageSummary JSON
        packageSummary: offer.packageSummary || null,
        // Payment data comes from Stripe if completed
        stripePaymentIntentId: offer.stripePaymentIntentId || null,
        actualPaymentData,
        paymentDataSource: offer.stripePaymentIntentId
          ? 'stripe_payment'
          : 'pending',
      }
    })

    const stats = {
      totalSpent: Math.round(totalSpent / 100), // Convert from cents to dollars
      totalCommission,
      activeOffers,
      completedPurchases,
      totalOffers: offers.length,
    }

    return NextResponse.json({
      client,
      stats,
      offers: processedOffers,
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching client stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
