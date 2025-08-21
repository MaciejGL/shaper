import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { BILLING_HELPERS } from '@/lib/stripe/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    // Get user's billing records
    const [billingRecords, totalCount] = await Promise.all([
      prisma.billingRecord.findMany({
        where: {
          subscription: {
            userId,
          },
        },
        include: {
          subscription: {
            include: {
              package: {
                select: {
                  name: true,
                  duration: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.billingRecord.count({
        where: {
          subscription: {
            userId,
          },
        },
      }),
    ])

    // Format the response
    const formattedRecords = billingRecords.map((record) => ({
      id: record.id,
      amount: record.amount,
      currency: record.currency,
      status: record.status,
      description:
        record.description ||
        `${record.subscription.package.name} - ${record.subscription.package.duration}`,

      // Billing period
      periodStart: record.periodStart,
      periodEnd: record.periodEnd,

      // Payment details
      paidAt: BILLING_HELPERS.isSuccessful(record.status)
        ? record.createdAt
        : null,
      failureReason: record.failureReason,

      // Refund details
      refundAmount: record.refundAmount,
      refundReason: record.refundReason,

      // References
      stripeInvoiceId: record.stripeInvoiceId,

      // Package info
      package: {
        name: record.subscription.package.name,
        duration: record.subscription.package.duration,
      },

      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }))

    // Calculate summary statistics
    const successfulPayments = billingRecords.filter((r) =>
      BILLING_HELPERS.isSuccessful(r.status),
    )
    const totalPaid = successfulPayments.reduce(
      (sum, record) => sum + record.amount,
      0,
    )
    const totalRefunded = billingRecords.reduce(
      (sum, record) => sum + (record.refundAmount || 0),
      0,
    )

    return NextResponse.json({
      records: formattedRecords,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      summary: {
        totalRecords: totalCount,
        totalPaid,
        totalRefunded,
        currency: billingRecords[0]?.currency || 'USD',
      },
    })
  } catch (error) {
    console.error('Error fetching billing history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 },
    )
  }
}
