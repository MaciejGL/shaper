import { MobileOAuthTrigger } from './mobile-oauth-trigger'

/**
 * Mobile OAuth Start Page
 *
 * This page is opened in the system browser from the mobile app.
 * It immediately triggers the Google OAuth flow without showing any UI.
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

  return <MobileOAuthTrigger callbackUrl={callbackUrl} />
}
