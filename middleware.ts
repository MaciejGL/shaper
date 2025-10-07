import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for Session Token Authentication
 *
 * Intercepts requests to specific pages and checks for session_token query parameter.
 * If found and no active session exists, redirects to NextAuth callback to establish session.
 * Removes token from URL after processing to prevent reuse.
 *
 * Protected routes:
 * - /offer/*
 * - /account-management
 */

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const sessionToken = searchParams.get('session_token')

  // Only process routes that need session token handling
  const isProtectedRoute =
    pathname.startsWith('/offer/') || pathname === '/account-management'

  if (!isProtectedRoute || !sessionToken) {
    return NextResponse.next()
  }

  // Check if user already has a session cookie
  const sessionCookie = request.cookies.get('next-auth.session-token')
  const secureSessionCookie = request.cookies.get(
    '__Secure-next-auth.session-token',
  )

  if (sessionCookie || secureSessionCookie) {
    // User already has a session, just remove token from URL to prevent reuse
    const cleanUrl = new URL(request.url)
    cleanUrl.searchParams.delete('session_token')
    return NextResponse.redirect(cleanUrl)
  }

  // No session - redirect to NextAuth signin with session token
  const callbackUrl = request.url.split('?')[0] // URL without query params

  const signInUrl = new URL('/api/auth/signin/session-token', request.url)
  signInUrl.searchParams.set('token', sessionToken)
  signInUrl.searchParams.set('callbackUrl', callbackUrl)

  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ['/offer/:path*', '/account-management'],
}
