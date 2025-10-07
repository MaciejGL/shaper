/**
 * Session Token Utilities
 *
 * Generates and verifies signed JWT tokens for secure session transfer
 * between mobile webview and external browser.
 *
 * Security features:
 * - Signed with NEXTAUTH_SECRET (cannot be forged)
 * - 1-hour expiration
 * - Includes email for user lookup
 */
import jwt from 'jsonwebtoken'

const SECRET = process.env.NEXTAUTH_SECRET!
const TOKEN_EXPIRATION = 60 * 60 // 1 hour in seconds

interface SessionTokenPayload {
  email: string
  originalJwt: string // The actual NextAuth JWT to restore
  iat: number
  exp: number
}

/**
 * Generate a signed JWT token for session transfer
 * @param email User's email address
 * @param originalJwt The actual NextAuth JWT to restore
 * @returns Signed JWT token
 */
export function generateSessionToken(
  email: string,
  originalJwt: string,
): string {
  if (!SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined')
  }

  const payload: Omit<SessionTokenPayload, 'iat' | 'exp'> = {
    email,
    originalJwt,
  }

  return jwt.sign(payload, SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  })
}

/**
 * Verify and decode a session token
 * @param token JWT token to verify
 * @returns Object with email and originalJwt if valid, null if invalid/expired
 */
export function verifySessionToken(token: string): {
  email: string
  originalJwt: string
} | null {
  if (!SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined')
  }

  try {
    const decoded = jwt.verify(token, SECRET) as SessionTokenPayload

    if (!decoded.email || !decoded.originalJwt) {
      return null
    }

    return {
      email: decoded.email,
      originalJwt: decoded.originalJwt,
    }
  } catch (error) {
    // Token is invalid or expired
    console.warn('Session token verification failed:', error)
    return null
  }
}
