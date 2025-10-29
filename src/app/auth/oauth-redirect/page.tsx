import { AnimatedLogo } from '@/components/animated-logo'

import { OAuthTrigger } from './oauth-trigger'

/**
 * OAuth Redirect Page for Mobile Apps
 *
 * This page automatically triggers OAuth flow when opened in external browser.
 * Used when opening Google/Apple login from mobile WebView.
 */
export default async function OAuthRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{
    provider?: string
    callbackUrl?: string
    mobile?: string
  }>
}) {
  const params = await searchParams
  const provider = params.provider
  const callbackUrl = params.callbackUrl || '/fitspace/workout'
  const mobile = params.mobile

  if (!provider) {
    return (
      <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
        <AnimatedLogo size={80} infinite={false} />
        <h1 className="text-xl font-semibold mt-6 mb-2 text-destructive">
          Error
        </h1>
        <p className="text-sm text-muted-foreground">
          Missing provider parameter
        </p>
      </div>
    )
  }

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={true} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Starting authentication...
      </h1>
      <p className="text-sm text-muted-foreground animate-pulse">
        You will be redirected to complete sign in
      </p>
      <OAuthTrigger
        provider={provider}
        callbackUrl={callbackUrl}
        mobile={mobile === 'true'}
      />
    </div>
  )
}
