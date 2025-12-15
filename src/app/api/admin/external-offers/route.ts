/**
 * Admin API for External Offers
 * GET - List Android subscriptions with external offer tokens
 * POST - Manual transaction report to Google
 */
import { NextRequest, NextResponse } from 'next/server'

import { adminAccessDeniedResponse, requireAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/db'
import { reportToGoogle } from '@/lib/external-reporting/google'
import { PACKAGE_NAME, getAndroidPublisher } from '@/lib/google-play/client'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser()
  } catch {
    return adminAccessDeniedResponse()
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  // Get Android subscriptions that have external offer tracking
  const [subscriptions, total] = await Promise.all([
    prisma.userSubscription.findMany({
      where: {
        originPlatform: 'android',
        initialStripeInvoiceId: { not: null },
        package: {
          stripeLookupKey: {
            in: [
              STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY,
              STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
            ],
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: { select: { id: true, email: true, name: true } },
        package: { select: { name: true, stripeLookupKey: true } },
      },
    }),
    prisma.userSubscription.count({
      where: {
        originPlatform: 'android',
        initialStripeInvoiceId: { not: null },
      },
    }),
  ])

  return NextResponse.json({ subscriptions, total, limit, offset })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser()
  } catch {
    return adminAccessDeniedResponse()
  }

  const body = await request.json()
  const {
    stripeInvoiceId,
    transactionType,
    amount,
    currency,
    countryCode,
    externalOfferToken,
    initialExternalTransactionId,
  } = body

  if (!stripeInvoiceId || !transactionType || !amount || !currency) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    )
  }

  try {
    if (transactionType === 'refund') {
      const androidPublisher = getAndroidPublisher()
      const targetId = initialExternalTransactionId || stripeInvoiceId
      const name = `applications/${PACKAGE_NAME}/externalTransactions/${targetId}`

      await androidPublisher.externaltransactions.refundexternaltransaction({
        name,
        requestBody: {
          fullRefund: {},
          refundTime: new Date().toISOString(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Refund reported to Google',
      })
    }

    await reportToGoogle({
      externalTransactionId: stripeInvoiceId,
      transactionType,
      amount,
      currency,
      countryCode: countryCode || 'NO',
      externalOfferToken,
      initialExternalTransactionId,
    })

    return NextResponse.json({
      success: true,
      message: 'Transaction reported to Google',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    )
  }
}
