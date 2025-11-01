import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth/config'

import { ExistingSessionHandoff } from './existing-session-handoff'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Mobile OAuth Start Page
 *
 * This page is opened in the system browser from the mobile app.
 * It checks if the user already has a session in the browser.
 * If yes, shows a "Continue as [name]" button.
 * If no, triggers the Google OAuth flow via server-side redirect.
 */
export default async function MobileStartPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const callbackUrl = params.callbackUrl as string | undefined

  console.warn('🔐 [MOBILE-START] Page loaded with params:', {
    callbackUrl,
    allParams: params,
    timestamp: new Date().toISOString(),
  })

  if (!callbackUrl) {
    console.warn('🔐 [MOBILE-START] ERROR: Missing callback URL')
    return (
      <div className="dark flex items-center justify-center min-h-screen bg-background">
        <p className="text-destructive">Missing callback URL</p>
      </div>
    )
  }

  // Check if user already has a session in this browser
  const session = await getServerSession(authOptions)

  console.warn('🔐 [MOBILE-START] Session check:', {
    hasSession: !!session,
    userEmail: session?.user?.email,
    userName: session?.user?.name,
  })

  if (session?.user?.email) {
    // User already logged in! Show confirmation button instead of re-authenticating
    const userName = session.user.name || session.user.email

    console.warn(
      '🔐 [MOBILE-START] Existing session found, showing handoff page for:',
      userName,
    )

    return (
      <ExistingSessionHandoff userName={userName} email={session.user.email} />
    )
  }

  // No session - redirect directly to Google OAuth via NextAuth
  // Build FULL absolute URL so that NextAuth can correctly determine provider & callback
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.PUBLIC_URL ??
    'https://www.hypro.app'

  const authUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`

  console.warn('🔐 [MOBILE-START] Redirecting to Google OAuth:', {
    authUrl,
    baseUrl,
    callbackUrl,
  })

  redirect(authUrl)
}
