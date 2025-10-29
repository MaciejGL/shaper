'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SessionRestoreClientProps {
  sessionToken: string
  redirect: string
}

/**
 * Client component that restores session by calling our API
 * This ensures the cookie is set properly in the WebView context
 */
export function SessionRestoreClient({
  sessionToken,
  redirect,
}: SessionRestoreClientProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        console.info('[SESSION-RESTORE] Restoring session with token')

        // Call our API to restore the session
        const response = await fetch('/api/auth/restore-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken }),
          credentials: 'include', // Important for cookies
        })

        if (!response.ok) {
          throw new Error('Failed to restore session')
        }

        const data = await response.json()
        console.info('[SESSION-RESTORE] Session restored:', data)

        // Wait a moment for cookie to be set, then redirect
        setTimeout(() => {
          router.push(redirect)
        }, 500)
      } catch (err) {
        console.error('[SESSION-RESTORE] Error:', err)
        setError('Failed to restore session. Please try logging in again.')
      }
    }

    restoreSession()
  }, [sessionToken, redirect, router])

  if (error) {
    return <p className="text-sm text-destructive mt-4">{error}</p>
  }

  return null
}
