import { NextResponse } from 'next/server'

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
export async function POST() {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()

    if (!user?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Generate signed session token
    const sessionToken = generateSessionToken(user.user.email)

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
