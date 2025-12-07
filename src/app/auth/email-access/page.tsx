'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'

function EmailAccessContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid link - no token provided')
      return
    }

    // Trigger sign in with email-access provider
    signIn('email-access', {
      token,
      callbackUrl: '/account-management',
    }).catch(() => {
      setError('Failed to authenticate. The link may have expired.')
    })
  }, [token])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold">Link Error</h1>
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
        <LoadingSkeleton count={1} variant="lg" />
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
      <EmailAccessContent />
    </Suspense>
  )
}
