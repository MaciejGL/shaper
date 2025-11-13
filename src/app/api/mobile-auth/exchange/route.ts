import { encode } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

import { consumeHandoffCode } from '@/lib/auth/handoff-store'
import prisma from '@/lib/db'

/**
 * Mobile OAuth Exchange Endpoint
 *
 * Exchanges a one-time handoff code for a NextAuth session.
 * This endpoint is called from within the WebView after the user
 * completes OAuth in the external browser and is deep-linked back.
 *
 * Flow:
 * 1. Validate handoff code from query params
 * 2. Consume code from Redis (atomic, single-use)
 * 3. Get user data from database
 * 4. Create NextAuth JWT token manually
 * 5. Set session cookie and redirect to final destination
 *
 * Query params:
 * - code: One-time handoff code (60s TTL)
 * - next: Where to redirect after setting cookies (default: /fitspace/workout)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/fitspace/workout'

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=missing_code', request.url),
      )
    }

    // Consume the handoff code (atomic get+delete)
    const handoffData = await consumeHandoffCode(code)

    if (!handoffData) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_code', request.url),
      )
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: handoffData.userId },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=user_not_found', request.url),
      )
    }

    // Create NextAuth JWT token using NextAuth's encode function
    // This creates the exact same token that NextAuth would create during normal sign-in
    const token = await encode({
      token: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          profile: user.profile,
          trainerId: user.trainerId,
        },
        sub: user.id, // Subject (user ID) - NextAuth standard
        email: user.email,
        iat: Math.floor(Date.now() / 1000), // Issued at
        exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // Expires in 365 days
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 365 * 24 * 60 * 60, // 365 days (same as NextAuth default)
    })

    // Redirect to the final destination with session cookie
    // Add success=true to show loading overlay during session establishment
    const redirectUrl = new URL(next, request.nextUrl.origin)
    redirectUrl.searchParams.set('success', 'true')
    const response = NextResponse.redirect(redirectUrl)

    // Prevent caching of this endpoint
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

    // Set NextAuth session token cookie
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

    response.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 365 * 24 * 60 * 60, // 365 days
    })

    return response
  } catch (error) {
    console.error('🔐 [EXCHANGE] Unexpected error:', error)
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url),
    )
  }
}
