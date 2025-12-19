/**
 * Manually report an initial purchase to Google for a subscription.
 * Uses the stored externalOfferToken + initialStripeInvoiceId.
 */
import { NextRequest, NextResponse } from 'next/server'

import { getCountryCodeFromTimezone } from '@/config/payment-rules'
import { adminAccessDeniedResponse, requireAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/db'
import { reportToGoogle } from '@/lib/external-reporting/google'
import { stripe } from '@/lib/stripe/stripe'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser()
  } catch {
    return adminAccessDeniedResponse()
  }

  const { id } = await params

  const subscription = await prisma.userSubscription.findUnique({
    where: { id },
    select: {
      userId: true,
      originPlatform: true,
      externalOfferToken: true,
      initialStripeInvoiceId: true,
      user: { select: { profile: { select: { timezone: true } } } },
    },
  })

  if (!subscription) {
    return NextResponse.json(
      { error: 'Subscription not found' },
      { status: 404 },
    )
  }

  if (subscription.originPlatform !== 'android') {
    return NextResponse.json(
      { error: 'Only Android subscriptions can be reported to Google' },
      { status: 400 },
    )
  }

  if (!subscription.initialStripeInvoiceId) {
    return NextResponse.json(
      { error: 'Missing initial invoice ID' },
      { status: 400 },
    )
  }

  if (!subscription.externalOfferToken) {
    return NextResponse.json(
      { error: 'Missing external offer token' },
      { status: 400 },
    )
  }

  const countryCode = getCountryCodeFromTimezone(
    subscription.user?.profile?.timezone,
  )
  if (!countryCode) {
    return NextResponse.json(
      { error: 'Missing country code for user timezone' },
      { status: 400 },
    )
  }

  const invoice = await stripe.invoices.retrieve(
    subscription.initialStripeInvoiceId,
  )

  await reportToGoogle({
    externalTransactionId: subscription.initialStripeInvoiceId,
    transactionType: 'purchase',
    amount: invoice.amount_paid || 0,
    currency: invoice.currency || 'usd',
    countryCode,
    externalOfferToken: subscription.externalOfferToken,
  })

  return NextResponse.json({
    success: true,
    invoiceId: subscription.initialStripeInvoiceId,
  })
}
