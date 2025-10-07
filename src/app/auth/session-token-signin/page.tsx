'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { SessionTokenExpired } from '@/components/session-token-expired'

/**
 * Session Token Signin Page
 *
 * This page handles automatic signin using session tokens.
 * It extracts the token from URL params and uses NextAuth's signIn
 * to create a proper session.
 */
export default function SessionTokenSigninPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const callbackUrl = searchParams.get('callbackUrl') || '/fitspace'
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!token) {
      setError(true)
      return
    }

    const handleSignIn = async () => {
      try {
        const result = await signIn('session-token', {
          token,
          callbackUrl,
          redirect: true, // Let NextAuth handle the redirect
        })

        // If redirect is false, we'd check result here
        // But with redirect: true, NextAuth will automatically redirect
        if (result && !result.ok) {
          console.error('Session token signin failed:', result.error)
          setError(true)
        }
      } catch (error) {
        console.error('Session token signin error:', error)
        setError(true)
      }
    }

    handleSignIn()
  }, [token, callbackUrl])

  // Show error state
  if (error || !token) {
    return (
      <SessionTokenExpired
        message="Invalid or expired session link"
        returnPath="fitspace"
      />
    )
  }

  // Show loading state
  return (
    <div className="min-h-screen flex-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <h2 className="text-xl font-semibold">Signing you in...</h2>
        <p className="text-muted-foreground">
          Please wait while we authenticate your session.
        </p>
      </div>
    </div>
  )
}
