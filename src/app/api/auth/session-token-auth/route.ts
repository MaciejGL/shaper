import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

import { verifySessionToken } from '@/lib/auth/session-token'
import { createUserLoaders } from '@/lib/loaders/user.loader'

/**
 * Session Token Authentication Handler
 *
 * This endpoint handles session token authentication for external browser links.
 * It verifies the token, creates a NextAuth session cookie, and redirects to the callback URL.
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

    // Verify the session token
    const email = verifySessionToken(token)
    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      )
    }

    // Load user by email with profile
    const loaders = createUserLoaders()
    const user = await loaders.getCurrentUser.load(email)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create NextAuth JWT token (same format as NextAuth uses)
    const jwtToken = jwt.sign(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          profile: user.profile,
          trainerId: user.trainerId,
        },
      },
      process.env.NEXTAUTH_SECRET!,
      {
        expiresIn: '30d',
      },
    )

    // Redirect to callback URL with session cookie
    const response = NextResponse.redirect(callbackUrl)

    // Set the NextAuth session cookie
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

    response.cookies.set(cookieName, jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Session token authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 },
    )
  }
}
