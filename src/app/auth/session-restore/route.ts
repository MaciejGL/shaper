import { NextRequest, NextResponse } from 'next/server'

import { verifySessionToken } from '@/lib/auth/session-token'

/**
 * Session Restore Route Handler
 *
 * This handles GET requests to /auth/session-restore with session_token parameter.
 * It sets the cookie and redirects - all server-side, which is more reliable for WebView.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const sessionToken = searchParams.get('session_token')
    const redirect = searchParams.get('redirect') || '/fitspace/workout'

    if (!sessionToken) {
      return NextResponse.redirect(
        new URL('/auth/error?error=MissingToken', req.url),
      )
    }

    // Verify and decode the session token
    const tokenData = verifySessionToken(sessionToken)

    if (!tokenData) {
      console.error('[SESSION-RESTORE] Invalid or expired session token')
      return NextResponse.redirect(
        new URL('/auth/error?error=InvalidToken', req.url),
      )
    }

    console.info('[SESSION-RESTORE] Restoring session for:', tokenData.email)

    // Create redirect response
    const redirectUrl = new URL(redirect, req.url)
    const response = NextResponse.redirect(redirectUrl)

    // Set the session cookie
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

    response.cookies.set(cookieName, tokenData.originalJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    console.info(
      '[SESSION-RESTORE] Session cookie set, redirecting to:',
      redirect,
    )

    return response
  } catch (error) {
    console.error('[SESSION-RESTORE] Error:', error)
    return NextResponse.redirect(
      new URL('/auth/error?error=ServerError', req.url),
    )
  }
}
