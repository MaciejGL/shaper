import { NextRequest, NextResponse } from 'next/server'

import { verifySessionToken } from '@/lib/auth/session-token'

/**
 * Session Token Authentication Handler
 *
 * This endpoint handles session token authentication for external browser links.
 * It verifies the token and redirects to NextAuth's credential signin with the token.
 * This ensures proper NextAuth session creation and cookie management.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const token = searchParams.get('token')
    const callbackUrl = searchParams.get('callbackUrl')

    if (!token || !callbackUrl) {
      return NextResponse.json(
        { error: 'Missing token or callback URL' },
        { status: 400 },
      )
    }

    // Verify the session token is valid
    const email = verifySessionToken(token)
    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      )
    }

    // Redirect to a client-side page that will use NextAuth's signIn
    const authPage = new URL('/auth/session-token-signin', origin)
    authPage.searchParams.set('token', token)
    authPage.searchParams.set('callbackUrl', callbackUrl)

    return NextResponse.redirect(authPage)
  } catch (error) {
    console.error('Session token authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 },
    )
  }
}
