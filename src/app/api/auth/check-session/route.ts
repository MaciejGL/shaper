import { NextRequest, NextResponse } from 'next/server'

import { consumePendingSession } from '@/lib/auth/pending-sessions'

/**
 * Check Session API Endpoint
 *
 * Used by WebView to poll for OAuth session completion.
 * Returns session token if ready, otherwise indicates still pending.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authCode = searchParams.get('auth_code')

    if (!authCode) {
      return NextResponse.json(
        { error: 'Missing auth_code parameter' },
        { status: 400 },
      )
    }

    // Try to consume the pending session
    const sessionToken = consumePendingSession(authCode)

    if (sessionToken) {
      // Session is ready!
      return NextResponse.json({
        ready: true,
        sessionToken,
      })
    }

    // Session not ready yet
    return NextResponse.json({
      ready: false,
    })
  } catch (error) {
    console.error('📱 [CHECK-SESSION] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
