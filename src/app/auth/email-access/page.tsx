'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { Loader } from '@/components/loader'
import { LoadingSkeleton } from '@/components/loading-skeleton'

/**
 * Decode JWT token to extract redirectUrl (without verification - server does that)
 * Handles base64url encoding (used by JWT) which uses - and _ instead of + and /
 */
function getRedirectFromToken(token: string): string {
  try {
    // Convert base64url to standard base64
    const base64 = token
      .split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return payload.redirectUrl || '/account-management'
  } catch {
    return '/account-management'
  }
}

function EmailAccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid link - no token provided')
      return
    }

    const authenticate = async () => {
      const redirectUrl = getRedirectFromToken(token)

      // Use redirect: false to handle errors manually
      // Without this, NextAuth redirects to error page instead of throwing
      const result = await signIn('email-access', {
        token,
        redirect: false,
      })

      if (result?.error) {
        setError('Failed to authenticate. The link may have expired.')
      } else if (result?.ok) {
        router.push(redirectUrl)
      } else {
        setError('Authentication failed. Please try again.')
      }
    }

    authenticate()
  }, [token, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Link Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please request a new link or sign in manually.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}

export default function EmailAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <LoadingSkeleton count={1} variant="lg" />
        </div>
      }
    >
      <div className="container-hypertro mx-auto max-w-md p-4">
        <EmailAccessContent />
      </div>
    </Suspense>
  )
}
