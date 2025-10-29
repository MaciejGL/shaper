import { NextRequest, NextResponse } from 'next/server'

import { verifySessionToken } from '@/lib/auth/session-token'

/**
 * Restore Session API
 *
 * Endpoint to restore session from a session token.
 * Called from the session-restore page to set the cookie in the WebView context.
 * This is more reliable than middleware redirects for WebView cookie handling.
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionToken } = await req.json()

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing session token' },
        { status: 400 },
      )
    }

    // Verify and decode the session token
    const tokenData = verifySessionToken(sessionToken)

    if (!tokenData) {
      console.error('[RESTORE-SESSION] Invalid or expired session token')
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 },
      )
    }

    console.info('[RESTORE-SESSION] Restoring session for:', tokenData.email)

    // Create response
    const response = NextResponse.json({
      success: true,
      email: tokenData.email,
    })

    // Set the session cookie
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

    response.cookies.set(cookieName, tokenData.originalJwt, {
      httpOnly: true,
      secure: true, // Always true for mobile OAuth
      sameSite: 'none',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    console.info('[RESTORE-SESSION] Session cookie set successfully')

    return response
  } catch (error) {
    console.error('[RESTORE-SESSION] Error:', error)
    return NextResponse.json(
      { error: 'Failed to restore session' },
      { status: 500 },
    )
  }
}
