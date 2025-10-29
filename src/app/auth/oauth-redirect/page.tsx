'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'

/**
 * OAuth Redirect Page for Mobile Apps
 *
 * This page automatically triggers OAuth flow when opened in external browser.
 * Used when opening Google/Apple login from mobile WebView.
 */
export default function OAuthRedirectPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const provider = searchParams.get('provider')
    const callbackUrl = searchParams.get('callbackUrl')
    const mobile = searchParams.get('mobile')

    if (!provider) {
      setError('Missing provider parameter')
      return
    }

    // Auto-trigger OAuth flow
    const triggerOAuth = async () => {
      try {
        // Build callback URL with mobile flag
        let finalCallbackUrl = callbackUrl || '/fitspace/workout'

        // Add mobile flag to callback URL so NextAuth redirect callback can detect it
        if (mobile === 'true') {
          const separator = finalCallbackUrl.includes('?') ? '&' : '?'
          finalCallbackUrl = `${finalCallbackUrl}${separator}mobile=true`
        }

        await signIn(provider, {
          callbackUrl: finalCallbackUrl,
          redirect: true,
        })
      } catch (err) {
        console.error('OAuth redirect error:', err)
        setError('Failed to start authentication')
      }
    }

    triggerOAuth()
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <AnimatedLogo size={80} infinite={true} />
      <h1 className="text-xl font-semibold mt-6 mb-2">
        Starting authentication...
      </h1>
      {error ? (
        <p className="text-sm text-destructive mt-4">{error}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          You will be redirected to complete sign in
        </p>
      )}
    </div>
  )
}
