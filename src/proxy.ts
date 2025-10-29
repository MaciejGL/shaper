import { NextRequest, NextResponse } from 'next/server'

import { verifySessionToken } from '@/lib/auth/session-token'

/**
 * Proxy for Session Token Authentication
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

export async function proxy(request: NextRequest) {
  // Handle OPTIONS preflight requests for CORS
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin') || ''

    // Whitelist of allowed origins
    const allowedOrigins = [
      'http://localhost:4000',
      'https://www.hypro.app',
      'https://staging.hypro.app',
    ]

    // Only allow CORS if origin is in whitelist
    const isAllowedOrigin = allowedOrigins.includes(origin)
    const allowOrigin = isAllowedOrigin ? origin : 'https://www.hypro.app'

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const { pathname, searchParams } = request.nextUrl
  const sessionToken = searchParams.get('session_token')

  // Only process pages with session_token parameter (OAuth callback or external pages)
  if (!sessionToken) {
    return NextResponse.next()
  }

  // Allow session token on protected routes and external pages
  const isExternal =
    pathname.startsWith('/offer/') ||
    pathname === '/account-management' ||
    pathname.startsWith('/fitspace/') ||
    pathname.startsWith('/trainer/')

  if (!isExternal || !sessionToken) {
    return NextResponse.next()
  }

  // Check if already has session cookie
  const cookieName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
  const existingCookie = request.cookies.get(cookieName)

  // Verify token first
  const tokenData = verifySessionToken(sessionToken)
  if (!tokenData) {
    // Invalid token - redirect to error page
    console.error('[PROXY] Invalid or expired session token')
    return NextResponse.redirect(
      new URL('/auth/error?error=SessionExpired', request.url),
    )
  }

  if (existingCookie) {
    // Already has a cookie - check if it's the SAME JWT
    if (existingCookie.value === tokenData.originalJwt) {
      // Same JWT, just clean URL without setting cookie again
      console.info('[PROXY] JWT already set, skipping restore')
      const cleanUrl = new URL(request.url)
      cleanUrl.searchParams.delete('session_token')
      return NextResponse.redirect(cleanUrl)
    } else {
      // Keep existing cookie, don't overwrite
      const cleanUrl = new URL(request.url)
      cleanUrl.searchParams.delete('session_token')
      return NextResponse.redirect(cleanUrl)
    }
  }

  console.warn('🔓 [PROXY] Restoring session JWT:', {
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
  matcher: [
    '/offer/:path*',
    '/account-management',
    '/fitspace/:path*', // All fitspace routes (for OAuth callback)
    '/trainer/:path*', // All trainer routes (for OAuth callback)
    '/api/:path*', // Handle CORS for API routes
  ],
}
