/**
 * Email Access Token Utilities
 *
 * Generates and verifies signed JWT tokens for email links.
 * Unlike session tokens, these can be generated server-side without
 * the user's current session.
 *
 * Security features:
 * - Signed with NEXTAUTH_SECRET (cannot be forged)
 * - 7-day expiration (emails might be opened later)
 * - Single use recommended (invalidate after first use)
 */
import jwt from 'jsonwebtoken'

const SECRET = process.env.NEXTAUTH_SECRET!
const TOKEN_EXPIRATION = 60 * 60 * 24 * 7 // 7 days in seconds

interface EmailAccessTokenPayload {
  userId: string
  email: string
  redirectUrl: string
  iat: number
  exp: number
}

/**
 * Generate a signed JWT token for email access links
 * @param userId User's ID
 * @param email User's email address
 * @param redirectUrl URL to redirect to after authentication
 * @returns Signed JWT token
 */
export function generateEmailAccessToken(
  userId: string,
  email: string,
  redirectUrl: string,
): string {
  if (!SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined')
  }

  const payload: Omit<EmailAccessTokenPayload, 'iat' | 'exp'> = {
    userId,
    email,
    redirectUrl,
  }

  return jwt.sign(payload, SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  })
}

/**
 * Verify and decode an email access token
 * @param token JWT token to verify
 * @returns Token payload if valid, null if invalid/expired
 */
export function verifyEmailAccessToken(
  token: string,
): EmailAccessTokenPayload | null {
  if (!SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined')
  }

  try {
    const decoded = jwt.verify(token, SECRET) as EmailAccessTokenPayload

    if (!decoded.userId || !decoded.email) {
      return null
    }

    return decoded
  } catch (error) {
    console.warn('Email access token verification failed:', error)
    return null
  }
}

