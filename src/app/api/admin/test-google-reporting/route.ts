/**
 * Test endpoint to verify Google Play API connection
 * Only for admin testing - not for production use
 */
import { NextResponse } from 'next/server'

import { PACKAGE_NAME, getAndroidPublisher } from '@/lib/google-play/client'

export async function GET() {
  try {
    // Verify environment variables are set
    const hasEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const hasKey = !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

    if (!hasEmail || !hasKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          GOOGLE_SERVICE_ACCOUNT_EMAIL: hasEmail ? 'set' : 'missing',
          GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: hasKey ? 'set' : 'missing',
        },
      })
    }

    const androidPublisher = getAndroidPublisher()
    const results: Record<string, unknown> = {}

    // Test 1: Try to get app details (basic permission check)
    try {
      const appDetails = await androidPublisher.edits.insert({
        packageName: PACKAGE_NAME,
      })
      results.editInsert = { success: true, editId: appDetails.data.id }

      // Clean up the edit
      if (appDetails.data.id) {
        await androidPublisher.edits.delete({
          packageName: PACKAGE_NAME,
          editId: appDetails.data.id,
        })
      }
    } catch (e) {
      const err = e as { message?: string; code?: number }
      results.editInsert = {
        success: false,
        error: err.message,
        code: err.code,
      }
    }

    // Test 2: Try external transactions API
    try {
      const name = `applications/${PACKAGE_NAME}/externalTransactions/test-check`
      await androidPublisher.externaltransactions.getexternaltransaction({
        name,
      })
      results.externalTransactions = { success: true }
    } catch (e) {
      const err = e as { message?: string; code?: number }
      // 404 means API works but transaction doesn't exist (expected)
      if (err.code === 404) {
        results.externalTransactions = {
          success: true,
          note: '404 expected for test ID',
        }
      } else {
        results.externalTransactions = {
          success: false,
          error: err.message,
          code: err.code,
        }
      }
    }

    // Determine overall success
    const basicWorks = (results.editInsert as { success: boolean })?.success
    const externalWorks = (results.externalTransactions as { success: boolean })
      ?.success

    return NextResponse.json({
      success: basicWorks && externalWorks,
      packageName: PACKAGE_NAME,
      tests: results,
      recommendation: !basicWorks
        ? 'Service account needs basic app permissions in Play Console'
        : !externalWorks
          ? 'External Transactions API not accessible - check External Offers enrollment'
          : 'All permissions OK',
    })
  } catch (error) {
    console.error('[TEST GOOGLE REPORTING] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test Google API connection',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
