import { AnimatedLogo } from '@/components/animated-logo'

import { DeepLinkRedirect } from './deep-link-redirect'

/**
 * Mobile OAuth Callback Page
 *
 * After successful OAuth in external browser, NextAuth redirects here.
 * This page then triggers the deep link to return to the mobile app.
 */
export default async function MobileCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const callbackUrl = (params.url as string) || '/fitspace/workout'

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={true} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Authentication successful!
      </h1>
      <p className="text-sm text-muted-foreground animate-pulse">
        Returning to the app...
      </p>
      <DeepLinkRedirect callbackUrl={callbackUrl} />
    </div>
  )
}
