import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

import { generateSessionToken } from '@/lib/auth/session-token'
import { getCurrentUser } from '@/lib/getUser'

/**
 * Generate Session Token API
 *
 * Endpoint for authenticated users to generate a session transfer token.
 * Used when opening external browser links from mobile webview.
 *
 * Security:
 * - Requires active NextAuth session
 * - Returns signed JWT valid for 1 hour
 * - Can only be called by authenticated users
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()

    if (!user?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the raw JWT cookie value to transfer it
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'
    const rawJwt = req.cookies.get(cookieName)?.value

    if (!rawJwt) {
      console.error('Could not get JWT cookie')
      return NextResponse.json({ error: 'Session error' }, { status: 500 })
    }

    // Verify the JWT is valid before transferring
    const jwtToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!jwtToken) {
      console.error('Could not decode JWT')
      return NextResponse.json({ error: 'Session error' }, { status: 500 })
    }

    console.warn('🔐 Transferring session JWT:', {
      email: user.user.email,
      jwtExp: jwtToken.exp
        ? new Date(Number(jwtToken.exp) * 1000).toISOString()
        : 'none',
    })

    // Generate session token containing the ORIGINAL JWT
    const sessionToken = generateSessionToken(user.user.email, rawJwt)

    return NextResponse.json({
      sessionToken,
      expiresIn: 3600, // 1 hour
    })
  } catch (error) {
    console.error('Error generating session token:', error)
    return NextResponse.json(
      { error: 'Failed to generate session token' },
      { status: 500 },
    )
  }
}
