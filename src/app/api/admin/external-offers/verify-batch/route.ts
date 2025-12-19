/**
 * Verify multiple external transactions against Google API
 */
import { NextRequest, NextResponse } from 'next/server'

import { adminAccessDeniedResponse, requireAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/db'
import { PACKAGE_NAME, getAndroidPublisher } from '@/lib/google-play/client'

interface VerifyBatchRequestBody {
  subscriptionIds: string[]
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser()
  } catch {
    return adminAccessDeniedResponse()
  }

  const body = (await request.json()) as VerifyBatchRequestBody
  const subscriptionIds = Array.isArray(body?.subscriptionIds)
    ? body.subscriptionIds
    : []

  if (subscriptionIds.length === 0) {
    return NextResponse.json({ results: [] })
  }

  const subscriptions = await prisma.userSubscription.findMany({
    where: { id: { in: subscriptionIds } },
    select: { id: true, initialStripeInvoiceId: true },
  })

  const androidPublisher = getAndroidPublisher()
  const parent = `applications/${PACKAGE_NAME}`

  const results: Array<{
    id: string
    invoiceId: string | null
    verified: boolean
    googleData?: Record<string, unknown>
    error?: string
  }> = []

  // Avoid hammering Google API if we have many rows
  const concurrency = 5
  let idx = 0

  async function worker() {
    while (idx < subscriptions.length) {
      const current = subscriptions[idx]
      idx += 1

      if (!current.initialStripeInvoiceId) {
        results.push({
          id: current.id,
          invoiceId: null,
          verified: false,
          error: 'missing_invoice_id',
        })
        continue
      }

      const name = `${parent}/externalTransactions/${current.initialStripeInvoiceId}`

      try {
        const response =
          await androidPublisher.externaltransactions.getexternaltransaction({
            name,
          })

        results.push({
          id: current.id,
          invoiceId: current.initialStripeInvoiceId,
          verified: true,
          googleData: response.data as unknown as Record<string, unknown>,
        })
      } catch (error) {
        const err = error as { code?: number; message?: string }
        if (err.code === 404) {
          results.push({
            id: current.id,
            invoiceId: current.initialStripeInvoiceId,
            verified: false,
            error: 'not_found',
          })
        } else {
          results.push({
            id: current.id,
            invoiceId: current.initialStripeInvoiceId,
            verified: false,
            error: err.message || 'verify_failed',
          })
        }
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))

  return NextResponse.json({ results })
}
