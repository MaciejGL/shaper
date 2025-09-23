'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
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

  const handleDirectLogin = async () => {
    if (!detectedUser) {
      console.error('No user data available for direct login')
      return
    }

    try {
      setIsLoading(true)

      // Use regular Google OAuth but with login hint to skip account picker

      // Try to sign in silently first
      const result = await signIn('google', {
        callbackUrl: `${window.location.origin}/fitspace/workout`,
        redirect: false,
        login_hint: detectedUser.email,
        prompt: 'none',
      })

      if (result?.url) {
        window.location.href = result.url
      } else if (result?.error) {
        console.error('Silent sign-in failed:', result.error)
        // Fallback to regular OAuth
        await signIn('google', {
          callbackUrl: `${window.location.origin}/fitspace/workout`,
          redirect: true,
          login_hint: detectedUser.email,
        })
      }
    } catch (error) {
      console.error('Direct login error:', error)
      setIsLoading(false)
      // Final fallback to regular Google OAuth
      await signIn('google', {
        callbackUrl: `${window.location.origin}/fitspace/workout`,
        redirect: true,
        login_hint: detectedUser.email,
      })
    }
  }

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        console.info('Google One Tap credential received - auto-logging in')

        // Validate the credential and get user info
        const result = await fetch('/api/auth/google-one-tap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })

        const data = await result.json()

        if (data.success && data.user) {
          // Show the user briefly for confirmation
          setDetectedUser(data.user)
          onAccountDetected?.(data.user)

          // Auto-login after showing user for 2 seconds
          setTimeout(async () => {
            setIsLoading(true)
            console.info('Auto-logging in user:', data.user.email)

            // Try silent login first
            try {
              const result = await signIn('google', {
                callbackUrl: `${window.location.origin}/fitspace/workout`,
                redirect: false,
                login_hint: data.user.email,
                prompt: 'none',
              })

              if (result?.url) {
                window.location.href = result.url
              } else {
                // If silent fails, redirect with login hint to minimize account picker
                window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(`${window.location.origin}/fitspace/workout`)}&login_hint=${encodeURIComponent(data.user.email)}`
              }
            } catch (error) {
              console.error('Silent login failed, using redirect:', error)
              window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(`${window.location.origin}/fitspace/workout`)}&login_hint=${encodeURIComponent(data.user.email)}`
            }
          }, 2000)
        } else {
          // Fallback to regular Google login
          await signIn('google', {
            callbackUrl: `${window.location.origin}/fitspace/workout`,
            redirect: true,
          })
        }
      } catch (error) {
        console.error('Google One Tap error:', error)
        // Fallback to regular Google login
        await signIn('google', {
          callbackUrl: `${window.location.origin}/fitspace/workout`,
          redirect: true,
        })
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
      <Card borderless className="mb-4 bg-card-on-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {detectedUser.picture && (
              <Image
                src={detectedUser.picture}
                alt={detectedUser.name}
                className="size-10 rounded-full"
                width={40}
                height={40}
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-blue-900 dark:text-amber-100">
                {detectedUser.name}
              </p>
              <p className="text-sm text-blue-700 dark:text-amber-300">
                {detectedUser.email}
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={handleDirectLogin}
              className="flex-1"
              loading={isLoading}
            >
              Continue as {detectedUser.given_name || detectedUser.name}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
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
