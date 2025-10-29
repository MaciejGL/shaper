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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const provider = params.provider as string | undefined
  const callbackUrl = (params.callbackUrl as string) || '/fitspace/workout'
  const mobile = params.mobile as string | undefined

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <AnimatedLogo size={80} infinite={true} />
      <h1 className="text-xl font-semibold mt-6 mb-2">
        Starting authentication...
      </h1>
      <p className="text-sm text-muted-foreground">
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
