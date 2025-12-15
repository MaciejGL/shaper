/**
 * Verify a subscription's external transaction against Google API
 */
import { NextRequest, NextResponse } from 'next/server'

import { adminAccessDeniedResponse, requireAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/db'
import { PACKAGE_NAME, getAndroidPublisher } from '@/lib/google-play/client'

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
    select: { initialStripeInvoiceId: true },
  })

  if (!subscription) {
    return NextResponse.json(
      { error: 'Subscription not found' },
      { status: 404 },
    )
  }

  if (!subscription.initialStripeInvoiceId) {
    return NextResponse.json(
      { error: 'No invoice ID to verify' },
      { status: 400 },
    )
  }

  try {
    const androidPublisher = getAndroidPublisher()
    const name = `applications/${PACKAGE_NAME}/externalTransactions/${subscription.initialStripeInvoiceId}`

    const response =
      await androidPublisher.externaltransactions.getexternaltransaction({
        name,
      })

    return NextResponse.json({
      verified: true,
      invoiceId: subscription.initialStripeInvoiceId,
      googleData: response.data,
    })
  } catch (error) {
    const err = error as { code?: number; message?: string }

    if (err.code === 404) {
      return NextResponse.json({
        verified: false,
        invoiceId: subscription.initialStripeInvoiceId,
        message: 'Transaction not found in Google',
      })
    }

    return NextResponse.json(
      { error: 'Verification failed', details: err.message },
      { status: 500 },
    )
  }
}
