import { NextRequest, NextResponse } from 'next/server'

import { verifySessionToken } from '@/lib/auth/session-token'

const ALLOWED_ORIGINS =
  process.env.NODE_ENV === 'production'
    ? ['https://www.hypro.app', 'https://staging.hypro.app']
    : [
        'http://localhost:4000',
        'https://www.hypro.app',
        'https://staging.hypro.app',
      ]

const COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'

/**
 * Proxy for Session Token Authentication
 *
 * Intercepts requests to external pages with session_token parameter.
 * Verifies token and restores the original JWT cookie in a single step.
 *
 * Protected routes:
 * - /offer/*
 * - /account-management
 */

export async function proxy(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return handleCorsPreFlight(request)
  }

  const { pathname, searchParams } = request.nextUrl
  const sessionToken = searchParams.get('session_token')

  if (!isExternalPage(pathname) || !sessionToken) {
    return NextResponse.next()
  }

  return handleExternalPage(request, pathname, sessionToken)
}

export const config = {
  matcher: [
    '/offer/:path*',
    '/account-management',
    '/api/:path*', // Handle CORS for API routes
  ],
}

function handleExternalPage(
  request: NextRequest,
  pathname: string,
  sessionToken: string,
): NextResponse {
  const existingCookie = request.cookies.get(COOKIE_NAME)

  const tokenData = verifySessionToken(sessionToken)
  if (!tokenData) {
    return handleInvalidToken(request, pathname, !!sessionToken)
  }

  if (existingCookie) {
    return handleExistingCookie(request, pathname)
  }

  return handleNewCookie(
    request,
    pathname,
    tokenData.originalJwt,
    tokenData.email,
  )
}

function handleCorsPreFlight(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') || ''
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin)
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

function isExternalPage(pathname: string): boolean {
  return pathname.startsWith('/offer/') || pathname === '/account-management'
}

function cleanUrlFromSessionToken(url: string): URL {
  const cleanUrl = new URL(url)
  cleanUrl.searchParams.delete('session_token')
  return cleanUrl
}

function handleInvalidToken(
  request: NextRequest,
  pathname: string,
  hasToken: boolean,
): NextResponse {
  console.error('[PROXY] Invalid or expired session token', {
    pathname,
    hasToken,
  })
  return NextResponse.redirect(
    new URL('/auth/error?error=SessionExpired', request.url),
  )
}

function handleExistingCookie(
  request: NextRequest,
  pathname: string,
): NextResponse {
  try {
    const cleanUrl = cleanUrlFromSessionToken(request.url)
    return NextResponse.redirect(cleanUrl)
  } catch (error) {
    console.error('[PROXY] Failed to redirect with existing cookie', {
      pathname,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.redirect(
      new URL('/auth/error?error=RedirectError', request.url),
    )
  }
}

function handleNewCookie(
  request: NextRequest,
  pathname: string,
  originalJwt: string,
  email: string,
): NextResponse {
  try {
    const cleanUrl = cleanUrlFromSessionToken(request.url)
    const response = NextResponse.redirect(cleanUrl, { status: 302 })

    response.cookies.set(COOKIE_NAME, originalJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('[PROXY] Failed to set session cookie', {
      pathname,
      email,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.redirect(
      new URL('/auth/error?error=SessionError', request.url),
    )
  }
}
