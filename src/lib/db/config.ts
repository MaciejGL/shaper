/**
 * Database configuration and environment detection
 */

// Environment detection
export const isBuildTime =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE === 'phase-production-build'

export const isDevRuntime =
  process.env.NODE_ENV === 'development' && !process.env.NEXT_PHASE

// Database configuration optimized for different environments
export const DATABASE_CONFIG = {
  MAX_CONNECTIONS: isBuildTime
    ? 2
    : parseInt(process.env.DATABASE_MAX_CONNECTIONS || '5'),
  MIN_CONNECTIONS: isBuildTime
    ? 1
    : parseInt(process.env.DATABASE_MIN_CONNECTIONS || '1'),
  IDLE_TIMEOUT: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
  CONNECTION_TIMEOUT: parseInt(
    process.env.DATABASE_CONNECTION_TIMEOUT || '10000',
  ),
  TRANSACTION_TIMEOUT: parseInt(
    process.env.DATABASE_TRANSACTION_TIMEOUT || '30000',
  ),
  MAX_WAIT: parseInt(process.env.DATABASE_MAX_WAIT || '10000'),
  MAX_USES: isBuildTime ? 100 : 2000,
} as const

/**
 * Check if the connection string is for Supabase
 */
export function isSupabaseConnection(): boolean {
  return process.env.DATABASE_URL?.includes('supabase.com') ?? false
}

/**
 * Determine SSL configuration based on environment
 */
export function getSSLConfig() {
  return process.env.NODE_ENV === 'production' || isSupabaseConnection()
    ? { rejectUnauthorized: false }
    : false
}
