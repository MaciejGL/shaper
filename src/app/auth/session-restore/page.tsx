import { AnimatedLogo } from '@/components/animated-logo'

import { SessionRestoreClient } from './session-restore-client'

/**
 * Session Restore Page for Mobile OAuth
 *
 * This page receives a session_token parameter and uses client-side JavaScript
 * to restore the session by calling our API to set the cookie properly.
 * This is more reliable than relying on middleware redirects for WebView.
 */
export default async function SessionRestorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const sessionToken = params.session_token as string | undefined
  const redirect = (params.redirect as string) || '/fitspace/workout'

  if (!sessionToken) {
    return (
      <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
        <AnimatedLogo size={80} infinite={false} />
        <h1 className="text-xl font-semibold mt-6 mb-2 text-destructive">
          Missing Session Token
        </h1>
        <p className="text-sm text-muted-foreground">
          Unable to restore session. Please try logging in again.
        </p>
      </div>
    )
  }

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={true} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Restoring your session...
      </h1>
      <p className="text-sm text-muted-foreground animate-pulse">
        Just a moment
      </p>
      <SessionRestoreClient sessionToken={sessionToken} redirect={redirect} />
    </div>
  )
}
