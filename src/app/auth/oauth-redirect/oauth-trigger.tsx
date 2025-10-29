'use client'

import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

interface OAuthTriggerProps {
  provider: string
  callbackUrl: string
  mobile: boolean
}

/**
 * Client component that triggers OAuth flow immediately on mount
 */
export function OAuthTrigger({
  provider,
  callbackUrl,
  mobile,
}: OAuthTriggerProps) {
  useEffect(() => {
    // Build callback URL with mobile flag
    let finalCallbackUrl = callbackUrl

    // Add mobile flag to callback URL so NextAuth redirect callback can detect it
    if (mobile) {
      const separator = callbackUrl.includes('?') ? '&' : '?'
      finalCallbackUrl = `${callbackUrl}${separator}mobile=true`
    }

    // Trigger OAuth flow immediately
    signIn(provider, {
      callbackUrl: finalCallbackUrl,
      redirect: true,
    }).catch((err) => {
      console.error('OAuth trigger error:', err)
    })
  }, [provider, callbackUrl, mobile])

  return null
}
