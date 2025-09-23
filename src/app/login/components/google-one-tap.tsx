'use client'

import { signIn } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface GoogleOneTapProps {
  disabled?: boolean
  onAccountDetected?: (user: DetectedUser) => void
}

interface DetectedUser {
  email: string
  name: string
  picture: string
  given_name?: string
  family_name?: string
}

interface GooglePromptNotification {
  isNotDisplayed: () => boolean
  isSkippedMoment: () => boolean
  isDismissedMoment: () => boolean
  getNotDisplayedReason: () => string
  getSkippedReason: () => string
  getDismissedReason: () => string
}

interface GoogleCredentialResponse {
  credential: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
            context?: string
            ux_mode?: string
            use_fedcm_for_prompt?: boolean
          }) => void
          prompt: (
            callback?: (notification: GooglePromptNotification) => void,
          ) => void
          cancel: () => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

export const GoogleOneTap = ({
  disabled = false,
  onAccountDetected,
}: GoogleOneTapProps) => {
  const initializedRef = useRef(false)
  const [detectedUser, setDetectedUser] = useState<DetectedUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      await signIn('google', {
        callbackUrl: `${window.location.origin}/fitspace/workout`,
        redirect: true,
      })
    } catch (error) {
      console.error('Google login error:', error)
      setIsLoading(false)
    }
  }

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        console.info('Google One Tap credential received')

        // Send credential to our API to decode user info
        const result = await fetch('/api/auth/google-one-tap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })

        const data = await result.json()

        if (data.success && data.user) {
          setDetectedUser(data.user)
          onAccountDetected?.(data.user)
        } else {
          // Fallback to regular Google login
          await handleGoogleLogin()
        }
      } catch (error) {
        console.error('Google One Tap error:', error)
        // Fallback to regular Google login
        await handleGoogleLogin()
      }
    },
    [onAccountDetected],
  )

  useEffect(() => {
    if (disabled || initializedRef.current) return

    const initializeGoogleOneTap = () => {
      if (!window.google?.accounts?.id) return

      const clientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
      if (!clientId) {
        console.error('Google Client ID not found')
        return
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
        use_fedcm_for_prompt: true,
      })

      // Show One Tap prompt after a short delay
      setTimeout(() => {
        window.google?.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.info(
              'One Tap not displayed:',
              notification.getNotDisplayedReason(),
            )
          } else if (notification.isSkippedMoment()) {
            console.info('One Tap skipped:', notification.getSkippedReason())
          } else if (notification.isDismissedMoment()) {
            console.info(
              'One Tap dismissed:',
              notification.getDismissedReason(),
            )
          }
        })
      }, 1000)

      initializedRef.current = true
    }

    // Check if Google script is loaded
    if (window.google?.accounts?.id) {
      initializeGoogleOneTap()
    } else {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogle)
          initializeGoogleOneTap()
        }
      }, 100)

      // Cleanup after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkGoogle)
      }, 10000)

      return () => {
        clearInterval(checkGoogle)
        clearTimeout(timeout)
      }
    }
  }, [disabled, handleCredentialResponse])

  const handleDismiss = () => {
    setDetectedUser(null)
  }

  // Show detected user card
  if (detectedUser) {
    return (
      <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <img
              src={detectedUser.picture}
              alt={detectedUser.name}
              className="size-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {detectedUser.name}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {detectedUser.email}
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={handleGoogleLogin}
              loading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              Continue as {detectedUser.given_name || detectedUser.name}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              disabled={isLoading}
            >
              Not you?
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // This component doesn't render anything when no user is detected
  return null
}
