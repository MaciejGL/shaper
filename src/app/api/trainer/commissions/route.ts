import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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
    const trainerId = searchParams.get('trainerId')
    const startDate = searchParams.get('startDate') // ISO string
    const endDate = searchParams.get('endDate') // ISO string
    const clientId = searchParams.get('clientId') // Optional filter by client

    if (!trainerId) {
      return NextResponse.json({ error: 'Missing trainerId' }, { status: 400 })
    }

    // Verify the trainer is accessing their own commissions
    if (currentUser.user.id !== trainerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Set default date range (last 30 days if not provided)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    try {
      // Query Stripe for all successful payments involving this trainer
      const payments = await stripe.paymentIntents.list({
        created: {
          gte: Math.floor(start.getTime() / 1000),
          lte: Math.floor(end.getTime() / 1000),
        },
        limit: 100,
      })

      // Filter for payments that involve this trainer
      const trainerPayments = payments.data.filter((payment) => {
        return (
          payment.status === 'succeeded' &&
          payment.metadata?.trainerId === trainerId &&
          (!clientId || payment.customer === clientId)
        )
      })

      // Calculate commission data from Stripe payments
      const commissionData = trainerPayments.map((payment) => {
        const totalAmount = payment.amount // in cents
        const platformCommission = Math.round(totalAmount * 0.1) // 10%
        const trainerPayout = Math.round(totalAmount * 0.9) // 90%

        return {
          id: payment.id,
          stripePaymentIntentId: payment.id,
          totalAmount,
          platformCommission,
          trainerPayout,
          currency: payment.currency.toUpperCase(),
          status: 'PENDING', // Default status for commission payouts
          serviceType: payment.metadata?.serviceType || 'UNKNOWN',
          packageName: payment.description || 'Training Package',
          clientEmail: payment.metadata?.clientEmail || 'Unknown',
          paymentDate: new Date(payment.created * 1000).toISOString(),
          metadata: {
            checkoutSessionId: payment.metadata?.checkoutSessionId,
            offerToken: payment.metadata?.offerToken,
          },
        }
      })

      // Calculate summary statistics
      const totalEarnings = commissionData.reduce(
        (sum, commission) => sum + commission.trainerPayout,
        0,
      )
      const totalPlatformFees = commissionData.reduce(
        (sum, commission) => sum + commission.platformCommission,
        0,
      )
      const totalRevenue = commissionData.reduce(
        (sum, commission) => sum + commission.totalAmount,
        0,
      )

      const summary = {
        totalEarnings: Math.round(totalEarnings / 100), // Convert to dollars
        totalPlatformFees: Math.round(totalPlatformFees / 100),
        totalRevenue: Math.round(totalRevenue / 100),
        paymentCount: commissionData.length,
        averagePayment:
          commissionData.length > 0
            ? Math.round(totalRevenue / commissionData.length / 100)
            : 0,
        currency: commissionData[0]?.currency || 'USD',
      }

      // Format commission data for response
      const formattedCommissions = commissionData.map((commission) => ({
        ...commission,
        totalAmount: Math.round(commission.totalAmount / 100),
        platformCommission: Math.round(commission.platformCommission / 100),
        trainerPayout: Math.round(commission.trainerPayout / 100),
      }))

      return NextResponse.json({
        commissions: formattedCommissions,
        summary,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        dataSource: 'stripe_realtime',
      })
    } catch (stripeError) {
      console.error('Error fetching Stripe payments:', stripeError)
      return NextResponse.json(
        { error: 'Failed to fetch commission data from Stripe' },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Error calculating commissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// Get commission summary for trainer dashboard
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { trainerId, period = 'month' } = body // 'week', 'month', 'quarter', 'year'

    // Verify the trainer is accessing their own data
    if (currentUser.user.id !== trainerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    try {
      // Query Stripe for payments in this period
      const payments = await stripe.paymentIntents.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(now.getTime() / 1000),
        },
        limit: 100,
      })

      // Filter for trainer payments
      const trainerPayments = payments.data.filter((payment) => {
        return (
          payment.status === 'succeeded' &&
          payment.metadata?.trainerId === trainerId
        )
      })

      // Calculate totals
      const totalRevenue = trainerPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      )
      const trainerEarnings = Math.round(totalRevenue * 0.9) // 90%
      const platformFees = Math.round(totalRevenue * 0.1) // 10%

      // Group by service type for breakdown
      const serviceBreakdown = trainerPayments.reduce(
        (acc, payment) => {
          const serviceType = payment.metadata?.serviceType || 'OTHER'
          if (!acc[serviceType]) {
            acc[serviceType] = { count: 0, revenue: 0, earnings: 0 }
          }
          acc[serviceType].count += 1
          acc[serviceType].revenue += payment.amount
          acc[serviceType].earnings += Math.round(payment.amount * 0.9)
          return acc
        },
        {} as Record<
          string,
          { count: number; revenue: number; earnings: number }
        >,
      )

      // Format service breakdown
      const formattedBreakdown = Object.entries(serviceBreakdown).map(
        ([serviceType, data]) => ({
          serviceType,
          count: data.count,
          revenue: Math.round(data.revenue / 100),
          earnings: Math.round(data.earnings / 100),
        }),
      )

      return NextResponse.json({
        period,
        summary: {
          totalRevenue: Math.round(totalRevenue / 100),
          trainerEarnings: Math.round(trainerEarnings / 100),
          platformFees: Math.round(platformFees / 100),
          paymentCount: trainerPayments.length,
          averagePayment:
            trainerPayments.length > 0
              ? Math.round(totalRevenue / trainerPayments.length / 100)
              : 0,
        },
        serviceBreakdown: formattedBreakdown,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString(),
        },
        dataSource: 'stripe_realtime',
      })
    } catch (stripeError) {
      console.error('Error fetching Stripe data for summary:', stripeError)
      return NextResponse.json(
        { error: 'Failed to fetch commission summary from Stripe' },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Error generating commission summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
