import { NextRequest, NextResponse } from 'next/server'

import { consumeHandoffCode } from '@/lib/auth/handoff-store'

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
 * 3. Call NextAuth's signin endpoint with server-nonce provider
 * 4. Forward session cookies to the WebView
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      console.error('🔐 [EXCHANGE] Missing code parameter')
      return NextResponse.json(
        { error: 'Missing code parameter' },
        { status: 400 },
      )
    }

    console.info('🔐 [EXCHANGE] Exchange attempt:', {
      code: code.substring(0, 8) + '...',
    })

    // Consume the handoff code (atomic get+delete)
    const handoffData = await consumeHandoffCode(code)

    if (!handoffData) {
      console.error('🔐 [EXCHANGE] Invalid or expired code:', {
        code: code.substring(0, 8) + '...',
      })
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 },
      )
    }

    // Call NextAuth's credentials callback with the server-nonce provider
    // This creates the session and returns proper session cookies
    const authUrl = new URL(
      '/api/auth/callback/credentials/server-nonce',
      request.nextUrl.origin,
    )

    const signInResponse = await fetch(authUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        userId: handoffData.userId,
        redirect: 'false',
        json: 'true',
      }).toString(),
    })

    if (!signInResponse.ok) {
      console.error('🔐 [EXCHANGE] Failed to create session:', {
        status: signInResponse.status,
        userId: handoffData.userId,
      })
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 },
      )
    }

    // Extract Set-Cookie headers from NextAuth response
    const setCookieHeaders = signInResponse.headers.getSetCookie()

    if (setCookieHeaders.length === 0) {
      console.error('🔐 [EXCHANGE] No session cookies received')
      return NextResponse.json(
        { error: 'Failed to set session cookies' },
        { status: 500 },
      )
    }

    console.info('🔐 [EXCHANGE] Session created successfully:', {
      userId: handoffData.userId,
      cookiesSet: setCookieHeaders.length,
    })

    // Return 204 with session cookies
    const response = new NextResponse(null, { status: 204 })

    // Forward all Set-Cookie headers to the client
    setCookieHeaders.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie)
    })

    return response
  } catch (error) {
    console.error('🔐 [EXCHANGE] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

