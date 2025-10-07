import { NextRequest, NextResponse } from 'next/server'

import { verifySessionToken } from '@/lib/auth/session-token'

/**
 * Middleware for Session Token Authentication
 *
 * Intercepts requests to external pages with session_token parameter.
 * Verifies token and restores the original JWT cookie in a single step.
 *
 * Flow:
 * 1. Check for session_token in URL
 * 2. If session already exists, just clean URL
 * 3. If no session, verify token and restore JWT cookie
 * 4. Redirect to clean URL (token removed)
 *
 * Protected routes:
 * - /offer/*
 * - /account-management
 */

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const sessionToken = searchParams.get('session_token')

  // Only process external pages
  const isExternal =
    pathname.startsWith('/offer/') || pathname === '/account-management'

  if (!isExternal || !sessionToken) {
    return NextResponse.next()
  }

  // Check if already has session cookie
  const cookieName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
  const hasCookie = request.cookies.get(cookieName)

  if (hasCookie) {
    // Already authenticated, just clean URL
    const cleanUrl = new URL(request.url)
    cleanUrl.searchParams.delete('session_token')
    return NextResponse.redirect(cleanUrl)
  }

  // Verify token and restore JWT in ONE step
  const tokenData = verifySessionToken(sessionToken)
  if (!tokenData) {
    // Invalid token - redirect to error page
    console.error('Invalid or expired session token')
    return NextResponse.redirect(
      new URL('/auth/error?error=SessionExpired', request.url),
    )
  }

  console.warn('🔓 [MIDDLEWARE] Restoring session JWT:', {
    email: tokenData.email,
    pathname,
  })

  // Create response with cleaned URL
  const cleanUrl = new URL(request.url)
  cleanUrl.searchParams.delete('session_token')
  const response = NextResponse.redirect(cleanUrl)

  // Restore the original JWT cookie
  response.cookies.set(cookieName, tokenData.originalJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return response
}

export const config = {
  matcher: ['/offer/:path*', '/account-management'],
}
