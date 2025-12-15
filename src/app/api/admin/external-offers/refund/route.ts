/**
 * Report a full refund to Google
 */
import { NextRequest, NextResponse } from 'next/server'

import { adminAccessDeniedResponse, requireAdminUser } from '@/lib/admin-auth'
import { PACKAGE_NAME, getAndroidPublisher } from '@/lib/google-play/client'

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser()
  } catch {
    return adminAccessDeniedResponse()
  }

  const body = await request.json()
  const { originalTransactionId } = body

  if (!originalTransactionId) {
    return NextResponse.json(
      { error: 'originalTransactionId is required' },
      { status: 400 },
    )
  }

  try {
    const androidPublisher = getAndroidPublisher()
    const name = `applications/${PACKAGE_NAME}/externalTransactions/${originalTransactionId}`

    await androidPublisher.externaltransactions.refundexternaltransaction({
      name,
      requestBody: {
        fullRefund: {},
        refundTime: new Date().toISOString(),
      },
    })

    console.info('[GOOGLE] Refund reported:', originalTransactionId)

    return NextResponse.json({
      success: true,
      message: 'Full refund reported',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[GOOGLE] Refund failed:', errorMessage)

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    )
  }
}
