import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { stripe } from '@/lib/stripe/stripe'

interface TestResult {
  accountId: string
  isValid: boolean
  status: string
  details?: {
    type?: string
    country?: string
    charges_enabled?: boolean
    payouts_enabled?: boolean
    capabilities?: Record<string, unknown>
    business_type?: string | null
  }
  error?: string
  testTransfer?: {
    success: boolean
    amount: number
    currency: string
    error?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser()

    const { accountId } = await request.json()

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 },
      )
    }

    const testResult: TestResult = {
      accountId,
      isValid: false,
      status: 'unknown',
    }

    try {
      // Step 1: Check if account exists and get details
      console.info(`🧪 Testing Stripe Connect account: ${accountId}`)
      const account = await stripe.accounts.retrieve(accountId)

      testResult.details = {
        type: account.type,
        country: account.country,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        capabilities: account.capabilities as Record<string, unknown>,
        business_type: account.business_type || null,
      }

      if (!account.charges_enabled || !account.payouts_enabled) {
        testResult.status = 'incomplete_onboarding'
        testResult.error = 'Account exists but onboarding is not complete'
        return NextResponse.json({ testResult })
      }

      // Step 2: Test if we can transfer to this account
      console.info(`💰 Testing transfer capability to account: ${accountId}`)
      try {
        const testTransfer = await stripe.transfers.create({
          amount: 100, // $1.00 test amount
          currency: 'usd',
          destination: accountId,
          description: 'Test transfer from Hypertro platform',
          metadata: {
            test: 'true',
            source: 'admin_dashboard',
            timestamp: new Date().toISOString(),
          },
        })

        testResult.testTransfer = {
          success: true,
          amount: 100,
          currency: 'usd',
        }

        // Immediately reverse the test transfer
        await stripe.transfers.createReversal(testTransfer.id, {
          description: 'Reversing test transfer',
        })

        testResult.isValid = true
        testResult.status = 'connected_and_working'

        console.info(`✅ Account ${accountId} is valid and working!`)
      } catch (transferError: unknown) {
        const errorMessage =
          transferError instanceof Error
            ? transferError.message
            : 'Unknown error'
        console.info(`❌ Transfer test failed for ${accountId}:`, errorMessage)

        testResult.testTransfer = {
          success: false,
          amount: 100,
          currency: 'usd',
          error: errorMessage,
        }

        const errorCode = (transferError as { code?: string }).code
        if (errorCode === 'account_invalid') {
          testResult.status = 'account_invalid'
          testResult.error =
            'Account exists but is not properly connected to your platform'
        } else if (errorCode === 'transfer_failed') {
          testResult.status = 'transfer_restricted'
          testResult.error = 'Account exists but cannot receive transfers'
        } else {
          testResult.status = 'transfer_error'
          testResult.error = `Transfer failed: ${errorMessage}`
        }
      }
    } catch (accountError: unknown) {
      const errorMessage =
        accountError instanceof Error ? accountError.message : 'Unknown error'
      console.info(
        `❌ Account retrieval failed for ${accountId}:`,
        errorMessage,
      )

      const errorCode = (accountError as { code?: string }).code
      if (errorCode === 'resource_missing') {
        testResult.status = 'not_found'
        testResult.error = 'Account does not exist or is not accessible'
      } else if (errorCode === 'permission_denied') {
        testResult.status = 'permission_denied'
        testResult.error =
          'Account exists but you do not have permission to access it'
      } else {
        testResult.status = 'error'
        testResult.error = `Account check failed: ${errorMessage}`
      }
    }

    return NextResponse.json({ testResult })
  } catch (error) {
    console.error('Failed to test Stripe account:', error)
    return NextResponse.json(
      { error: 'Failed to test Stripe account' },
      { status: 500 },
    )
  }
}
