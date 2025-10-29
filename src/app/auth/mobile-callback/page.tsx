import { getToken } from 'next-auth/jwt'
import { cookies } from 'next/headers'

import { AnimatedLogo } from '@/components/animated-logo'
import { generateSessionToken } from '@/lib/auth/session-token'
import { getCurrentUser } from '@/lib/getUser'

import { DeepLinkRedirect } from './deep-link-redirect'

/**
 * Mobile OAuth Callback Page
 *
 * After successful OAuth in external browser, NextAuth redirects here.
 * This page generates a session token and passes it via deep link to restore session in WebView.
 */
export default async function MobileCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const callbackUrl = (params.url as string) || '/fitspace/workout'

  // Get authenticated user
  const user = await getCurrentUser()

  if (!user?.user?.email) {
    return (
      <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
        <AnimatedLogo size={80} infinite={false} />
        <h1 className="text-xl font-semibold mt-6 mb-2 text-destructive">
          Authentication Error
        </h1>
        <p className="text-sm text-muted-foreground">
          Could not verify your authentication. Please try again.
        </p>
      </div>
    )
  }

  // Get the raw JWT cookie to generate session token
  const cookieStore = await cookies()
  const cookieName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
  const rawJwt = cookieStore.get(cookieName)?.value

  if (!rawJwt) {
    return (
      <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
        <AnimatedLogo size={80} infinite={false} />
        <h1 className="text-xl font-semibold mt-6 mb-2 text-destructive">
          Session Error
        </h1>
        <p className="text-sm text-muted-foreground">
          Could not retrieve session. Please try again.
        </p>
      </div>
    )
  }

  // Generate session token
  const sessionToken = generateSessionToken(user.user.email, rawJwt)

  // Add session token to callback URL
  const separator = callbackUrl.includes('?') ? '&' : '?'
  const callbackUrlWithToken = `${callbackUrl}${separator}session_token=${encodeURIComponent(sessionToken)}`

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={true} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Authentication successful!
      </h1>
      <p className="text-sm text-muted-foreground animate-pulse">
        Returning to the app...
      </p>
      <DeepLinkRedirect callbackUrl={callbackUrlWithToken} />
    </div>
  )
}
