import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { AnimatedLogo } from '@/components/animated-logo'
import { authOptions } from '@/lib/auth/config'
import { generateHandoffCode, saveHandoffCode } from '@/lib/auth/handoff-store'
import prisma from '@/lib/db'

/**
 * Mobile OAuth Completion Page
 *
 * After successful OAuth in the external browser, this page:
 * 1. Verifies the user is authenticated
 * 2. Generates a one-time handoff code
 * 3. Saves it to Redis (60s TTL)
 * 4. Redirects to: hypro://?oauth_code=XXX&next=/fitspace/workout
 *
 * The mobile app intercepts the deep link and loads the exchange endpoint
 * in the WebView, which sets session cookies and redirects to the final destination.
 */
export default async function MobileCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const mobile = params.mobile as string | undefined

  // Validate this is a mobile OAuth flow
  if (mobile !== '1') {
    console.error('🔐 [MOBILE-COMPLETE] Not a mobile OAuth flow')
    redirect('/login')
  }

  // Get the authenticated session
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    console.error('🔐 [MOBILE-COMPLETE] No session found')
    return (
      <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
        <AnimatedLogo size={80} infinite={false} />
        <h1 className="text-xl font-semibold mt-6 mb-2 text-destructive">
          Authentication Failed
        </h1>
        <p className="text-sm text-muted-foreground">
          Could not complete sign-in. Please try again.
        </p>
        <a href="/login" className="mt-4 text-sm text-primary hover:underline">
          Return to login
        </a>
      </div>
    )
  }

  // Look up user by email to get the actual database UUID
  // session.user.id is the Google OAuth ID, not our database ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    console.error('🔐 [MOBILE-COMPLETE] User not found:', {
      email: session.user.email,
    })
    return (
      <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
        <AnimatedLogo size={80} infinite={false} />
        <h1 className="text-xl font-semibold mt-6 mb-2 text-destructive">
          User Not Found
        </h1>
        <p className="text-sm text-muted-foreground">
          Could not find user account. Please try again.
        </p>
        <a href="/login" className="mt-4 text-sm text-primary hover:underline">
          Return to login
        </a>
      </div>
    )
  }

  // Generate and save handoff code with the actual database user ID
  const code = generateHandoffCode()
  await saveHandoffCode(code, user.id)

  // Use root-level deep link with query parameters to avoid Expo Router route matching
  // Format: hypro://?oauth_code=XXX&next=/fitspace/workout
  const nextPath = '/fitspace/workout'
  const redirectUrl = `hypro://?oauth_code=${code}&next=${encodeURIComponent(nextPath)}`

  console.info('🔐 [MOBILE-COMPLETE] Redirecting to deep link:', {
    userId: user.id,
    email: session.user.email,
    code: code.substring(0, 8) + '...',
    redirectUrl,
  })

  // Redirect to deep link (opens native app)
  // Note: redirect() throws a NEXT_REDIRECT error internally - this is expected behavior
  redirect(redirectUrl)
}
