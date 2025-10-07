import { NextRequest, NextResponse } from 'next/server'

import { verifySessionToken } from '@/lib/auth/session-token'

/**
 * Session Token Authentication Handler
 *
 * This endpoint handles session token authentication for external browser links.
 * It RESTORES the original JWT cookie from the mobile app, ensuring
 * both contexts share the SAME session.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const callbackUrl = searchParams.get('callbackUrl')

    if (!token || !callbackUrl) {
      return NextResponse.json(
        { error: 'Missing token or callback URL' },
        { status: 400 },
      )
    }

    console.warn('🔓 [SESSION-TOKEN-AUTH] Restoring original JWT:', {
      callbackUrl,
    })

    // Verify and extract the original JWT
    const tokenData = verifySessionToken(token)
    if (!tokenData) {
      console.error('Invalid or expired session token')
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      )
    }

    console.warn('🔓 [SESSION-TOKEN-AUTH] Token verified, setting cookie:', {
      email: tokenData.email,
    })

    // Create response with redirect
    const response = NextResponse.redirect(callbackUrl)

    // RESTORE the original JWT cookie
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

    response.cookies.set(cookieName, tokenData.originalJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Let the original JWT expiration handle the cookie expiration
    })

    console.warn('🔓 [SESSION-TOKEN-AUTH] Cookie restored, redirecting')

    return response
  } catch (error) {
    console.error('Session token authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 },
    )
  }
}
