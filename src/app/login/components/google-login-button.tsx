'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'

interface GoogleLoginButtonProps {
  className?: string
  disabled?: boolean
}

export const GoogleLoginButton = ({
  className,
  disabled = false,
}: GoogleLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { isNativeApp } = useMobileApp()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)

      if (isNativeApp) {
        // Native app: open OAuth in external browser
        const callbackUrl = `${window.location.origin}/fitspace/workout`
        const oauthUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}&mobile=true`

        // Open in system browser (same pattern as account-management)
        const opened = window.open(
          oauthUrl,
          '_blank',
          'noopener,noreferrer,external=true',
        )

        if (!opened) {
          // Fallback: create link element
          const link = document.createElement('a')
          link.href = oauthUrl
          link.target = '_blank'
          link.rel = 'noopener noreferrer external'
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

        // Reset loading state after a delay (user is in external browser)
        setTimeout(() => setIsLoading(false), 1000)
      } else {
        // Regular web login
        await signIn('google', {
          callbackUrl: `${window.location.origin}/fitspace/workout`,
          redirect: true,
        })
      }
    } catch (error) {
      console.error('Google login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="tertiary"
      size="lg"
      onClick={handleGoogleLogin}
      loading={isLoading}
      disabled={disabled || isLoading}
      className={className}
      aria-label={
        isLoading ? 'Signing in with Google...' : 'Sign in with Google'
      }
      type="button"
      iconStart={<GoogleIcon />}
    >
      Continue with Google
    </Button>
  )
}

const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)
