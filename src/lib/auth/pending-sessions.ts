/**
 * Pending OAuth Sessions Storage
 *
 * Stores session tokens temporarily for OAuth polling flow.
 * Used to transfer session from external browser to WebView.
 */

interface PendingSession {
  sessionToken: string
  expiresAt: number // Timestamp in milliseconds
}

// In-memory storage for pending sessions
// In production, you might want to use Redis instead
const pendingSessions = new Map<string, PendingSession>()

// Cleanup interval (runs every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000
// Session TTL (15 minutes)
const SESSION_TTL = 15 * 60 * 1000

/**
 * Store a pending session for polling
 */
export function storePendingSession(
  authCode: string,
  sessionToken: string,
): void {
  const expiresAt = Date.now() + SESSION_TTL

  pendingSessions.set(authCode, {
    sessionToken,
    expiresAt,
  })

  console.info('📱 [PENDING-SESSION] Stored session for auth code:', {
    authCode: authCode.substring(0, 8) + '...',
    expiresAt: new Date(expiresAt).toISOString(),
  })
}

/**
 * Retrieve and remove a pending session
 */
export function consumePendingSession(authCode: string): string | null {
  const session = pendingSessions.get(authCode)

  if (!session) {
    console.warn('📱 [PENDING-SESSION] No session found for auth code:', {
      authCode: authCode.substring(0, 8) + '...',
    })
    return null
  }

  // Check if expired
  if (Date.now() > session.expiresAt) {
    pendingSessions.delete(authCode)
    console.warn('📱 [PENDING-SESSION] Session expired for auth code:', {
      authCode: authCode.substring(0, 8) + '...',
    })
    return null
  }

  // Remove from map (consume once)
  pendingSessions.delete(authCode)

  console.info('📱 [PENDING-SESSION] Consumed session for auth code:', {
    authCode: authCode.substring(0, 8) + '...',
  })

  return session.sessionToken
}

/**
 * Cleanup expired sessions
 */
function cleanupExpiredSessions(): void {
  const now = Date.now()
  let cleanedCount = 0

  for (const [authCode, session] of pendingSessions.entries()) {
    if (now > session.expiresAt) {
      pendingSessions.delete(authCode)
      cleanedCount++
    }
  }

  if (cleanedCount > 0) {
    console.info(
      `📱 [PENDING-SESSION] Cleaned up ${cleanedCount} expired session(s)`,
    )
  }
}

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL)
}
