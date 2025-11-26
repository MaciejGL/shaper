import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'
import { stripe } from '@/lib/stripe/stripe'

interface PaymentRecord {
  id: string
  amount: number
  currency: string
  description: string | null
  created: number
  type: 'one-time' | 'subscription'
}

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
    const allPayments: PaymentRecord[] = []

    // Query Stripe directly for payment data if client has a Stripe customer ID
    console.info('[client-stats] Client:', {
      id: client.id,
      email: client.email,
      stripeCustomerId: client.stripeCustomerId,
    })

    if (client.stripeCustomerId) {
      try {
        // 1. Get one-time payment intents with trainer metadata
        const payments = await stripe.paymentIntents.list({
          customer: client.stripeCustomerId,
          limit: 100,
        })

        // Filter for successful one-time payments that involve this trainer
        for (const payment of payments.data) {
          if (
            payment.status === 'succeeded' &&
            payment.metadata?.trainerId === trainerId
          ) {
            allPayments.push({
              id: payment.id,
              amount: payment.amount,
              currency: payment.currency,
              description: payment.description,
              created: payment.created,
              type: 'one-time',
            })
          }
        }

        // 2. Get subscription payments (invoices) for subscriptions with this trainer
        // First, check ALL subscriptions for this client in our database
        const allDbSubscriptions = await prisma.userSubscription.findMany({
          where: { userId: clientId },
          select: {
            stripeSubscriptionId: true,
            trainerId: true,
            status: true,
          },
        })

        console.info(
          '[client-stats] ALL DB subscriptions for client:',
          allDbSubscriptions,
        )

        // Filter for this trainer
        const dbSubscriptions = allDbSubscriptions.filter(
          (s) => s.trainerId === trainerId,
        )

        console.info(
          '[client-stats] DB subscriptions for trainer:',
          dbSubscriptions,
        )

        const dbSubscriptionIds = dbSubscriptions
          .map((s) => s.stripeSubscriptionId)
          .filter((id): id is string => id !== null)

        // Also check Stripe metadata as fallback
        const stripeSubscriptions = await stripe.subscriptions.list({
          customer: client.stripeCustomerId,
          limit: 100,
          status: 'all',
        })

        console.info(
          '[client-stats] Stripe subscriptions:',
          stripeSubscriptions.data.map((s) => ({
            id: s.id,
            status: s.status,
            metadata: s.metadata,
          })),
        )

        const stripeTrainerSubIds = stripeSubscriptions.data
          .filter((sub) => sub.metadata?.trainerId === trainerId)
          .map((sub) => sub.id)

        // Combine both sources
        const trainerSubscriptionIds = [
          ...new Set([...dbSubscriptionIds, ...stripeTrainerSubIds]),
        ]

        console.info(
          '[client-stats] Trainer subscription IDs:',
          trainerSubscriptionIds,
        )

        // Fetch invoices directly by subscription ID (more reliable)
        for (const subId of trainerSubscriptionIds) {
          try {
            const subInvoices = await stripe.invoices.list({
              subscription: subId,
              limit: 100,
            })

            console.info(
              `[client-stats] Invoices for subscription ${subId}:`,
              subInvoices.data.map((inv) => ({
                id: inv.id,
                status: inv.status,
                amount_paid: inv.amount_paid,
                created: new Date(inv.created * 1000).toISOString(),
              })),
            )

            // Add all paid invoices
            for (const invoice of subInvoices.data) {
              if (invoice.status === 'paid' && invoice.amount_paid > 0) {
                const alreadyAdded = allPayments.some(
                  (p) => p.id === invoice.id,
                )

                if (!alreadyAdded) {
                  allPayments.push({
                    id: invoice.id,
                    amount: invoice.amount_paid,
                    currency: invoice.currency,
                    description:
                      invoice.lines.data[0]?.description ||
                      'Subscription payment',
                    created: invoice.created,
                    type: 'subscription',
                  })
                }
              }
            }
          } catch (error) {
            console.error(
              `[client-stats] Error fetching invoices for subscription ${subId}:`,
              error,
            )
          }
        }

        // Calculate totals
        totalSpent = allPayments.reduce((sum, p) => sum + p.amount, 0)
        completedPurchases = allPayments.length

        console.info('[client-stats] Final payments found:', allPayments)
        console.info('[client-stats] Total spent (cents):', totalSpent)
      } catch (error) {
        console.error('[client-stats] Error fetching Stripe payments:', error)
        // Continue with empty data if Stripe fails
      }
    } else {
      console.info('[client-stats] No stripeCustomerId for client')
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

    // Get recent activity from all payments (sorted by date)
    const sortedPayments = [...allPayments].sort(
      (a, b) => b.created - a.created,
    )
    const recentActivity = sortedPayments.slice(0, 10).map((payment) => ({
      id: `payment-${payment.id}`,
      type: payment.type,
      item: payment.description || 'Training Package',
      amount: Math.round(payment.amount / 100),
      status: 'completed',
      date: new Date(payment.created * 1000).toISOString(),
    }))

    // Simplified offer processing
    const processedOffers = offers.map((offer) => {
      // Get payment data from Stripe if offer is linked
      let actualPaymentData = null
      if (offer.stripePaymentIntentId) {
        const matchingPayment = allPayments.find(
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
