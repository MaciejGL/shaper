import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth/config'

import { ExistingSessionHandoff } from './existing-session-handoff'
import { MobileOAuthTrigger } from './mobile-oauth-trigger'

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

  if (!callbackUrl) {
    return (
      <div className="dark flex items-center justify-center min-h-screen bg-background">
        <p className="text-destructive">Missing callback URL</p>
      </div>
    )
  }

  // Check if user already has a session in this browser
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    // User already logged in! Show confirmation button instead of re-authenticating
    const userName = session.user.name || session.user.email

    return (
      <ExistingSessionHandoff userName={userName} callbackUrl={callbackUrl} />
    )
  }

  // No session - render client component that triggers Google OAuth
  return <MobileOAuthTrigger callbackUrl={callbackUrl} />
}
