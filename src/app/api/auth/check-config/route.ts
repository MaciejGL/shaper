import { NextResponse } from 'next/server'

/**
 * NextAuth Configuration Diagnostic Endpoint
 *
 * Checks if required environment variables are set.
 * IMPORTANT: Remove or protect this endpoint in production!
 */

// Force dynamic rendering to ensure we get runtime env vars
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const config = {
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_ID_LENGTH: process.env.GOOGLE_CLIENT_ID?.length || 0,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_SECRET_LENGTH: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_SECRET_LENGTH: process.env.NEXTAUTH_SECRET?.length || 0,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }

  console.warn('🔐 [CONFIG-CHECK] Environment variables:', config)

  return NextResponse.json({
    message: 'NextAuth configuration check',
    config,
    note: 'true means the variable is set (not showing actual values for security)',
  })
}
