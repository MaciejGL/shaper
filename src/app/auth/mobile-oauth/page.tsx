import { cookies } from 'next/headers'

import { AnimatedLogo } from '@/components/animated-logo'
import { storePendingSession } from '@/lib/auth/pending-sessions'

import { MobileOAuthRedirect } from './mobile-oauth-redirect'

/**
 * Mobile OAuth Success Page
 *
 * Server component that stores the session for polling,
 * then shows success message and auto-redirects to app.
 */
export default async function MobileOAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const authCode = params.auth_code as string | undefined

  if (!authCode) {
    return (
      <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
        <AnimatedLogo size={80} infinite={false} />
        <h1 className="text-xl font-semibold mt-6 mb-2 text-destructive">
          Missing auth code
        </h1>
        <p className="text-sm text-muted-foreground">
          Please try logging in again.
        </p>
      </div>
    )
  }

  // Get the session token from NextAuth cookie
  const cookieStore = await cookies()

  // Log all cookies for debugging
  const allCookies = cookieStore.getAll()
  console.info('📱 [MOBILE-OAUTH] All cookies:', {
    count: allCookies.length,
    names: allCookies.map((c) => c.name),
  })

  const cookieName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'

  console.info('📱 [MOBILE-OAUTH] Looking for cookie:', { cookieName })

  const sessionToken = cookieStore.get(cookieName)?.value

  if (!sessionToken) {
    console.error('📱 [MOBILE-OAUTH] Session cookie not found!', {
      authCode: authCode.substring(0, 8) + '...',
      cookieName,
      availableCookies: allCookies.map((c) => c.name),
    })

    return (
      <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
        <AnimatedLogo size={80} infinite={false} />
        <h1 className="text-xl font-semibold mt-6 mb-2 text-destructive">
          Session error
        </h1>
        <p className="text-sm text-muted-foreground">
          Could not retrieve session. Please try again.
        </p>
        <p className="text-xs text-muted-foreground/50 mt-4">
          Missing: {cookieName}
        </p>
      </div>
    )
  }

  console.info('📱 [MOBILE-OAUTH] Session cookie found!', {
    authCode: authCode.substring(0, 8) + '...',
    tokenLength: sessionToken.length,
  })

  // Store the session for polling
  storePendingSession(authCode, sessionToken)

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={true} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Authentication successful!
      </h1>
      <p className="text-sm text-muted-foreground animate-pulse">
        Returning to the app...
      </p>
      {authCode && (
        <p className="text-xs text-muted-foreground/50 mt-4">
          Auth code: {authCode.substring(0, 8)}...
        </p>
      )}
      <MobileOAuthRedirect />
    </div>
  )
}
