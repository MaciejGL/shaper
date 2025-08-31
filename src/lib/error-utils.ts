/**
 * Utility functions for handling different types of errors in the application
 */

/**
 * Common network error messages that indicate connectivity issues
 * rather than application errors that should be shown to users
 */
const NETWORK_ERROR_PATTERNS = [
  'Failed to fetch',
  'NetworkError',
  'fetch failed',
  'Could not connect to the server',
  'network error',
  'connection refused',
  'timeout',
  'aborted',
  'no internet',
  'offline',
  'ERR_NETWORK',
  'ERR_INTERNET_DISCONNECTED',
  'The Internet connection appears to be offline',
  'Unable to connect to the Internet',
] as const

/**
 * HTTP status codes that indicate network/server issues
 * rather than application logic errors
 */
const NETWORK_STATUS_CODES = [
  0, // No response (often network issue)
  408, // Request Timeout
  429, // Too Many Requests (rate limiting)
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
  507, // Insufficient Storage
  509, // Bandwidth Limit Exceeded
  598, // Network read timeout
  599, // Network connect timeout
]

/**
 * Determines if an error is likely a network/connectivity issue
 * that shouldn't alarm the user with a toast notification
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false

  const errorMessage = error instanceof Error ? error.message : String(error)
  const lowerMessage = errorMessage.toLowerCase()

  // Check for common network error patterns
  const hasNetworkPattern = NETWORK_ERROR_PATTERNS.some((pattern) =>
    lowerMessage.includes(pattern.toLowerCase()),
  )

  if (hasNetworkPattern) return true

  // Check if it's a fetch error with a network status code
  if (error instanceof Error && 'status' in error) {
    const status = error.status
    if (typeof status === 'number' && NETWORK_STATUS_CODES.includes(status)) {
      return true
    }
  }

  // Check for GraphQL network errors
  if (errorMessage.includes('API returned') && errorMessage.includes('500')) {
    return true
  }

  // Additional check for browser offline state
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true
  }

  return false
}

/**
 * Determines if an error should be shown to the user as a toast
 * Returns true for application errors, false for network issues
 */
export function shouldShowErrorToUser(error: unknown): boolean {
  // Don't show network errors as toasts
  if (isNetworkError(error)) {
    return false
  }

  // Show other errors to users
  return true
}

/**
 * Gets a user-friendly error message for display
 * Sanitizes technical details while preserving useful information
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred'

  const errorMessage = error instanceof Error ? error.message : String(error)

  // For network errors, show a friendly offline message
  if (isNetworkError(error)) {
    return 'Please check your internet connection and try again'
  }

  // For GraphQL errors, try to extract the meaningful part
  if (errorMessage.includes('API returned')) {
    const match = errorMessage.match(/API returned \d+ (.+)/)
    if (match && match[1]) {
      try {
        // Try to parse as JSON error response
        const parsed = JSON.parse(match[1])
        if (parsed.error || parsed.message) {
          return parsed.error || parsed.message
        }
      } catch {
        // Not JSON, return as is
        return match[1]
      }
    }
  }

  // Return the original message for other errors
  return errorMessage
}
