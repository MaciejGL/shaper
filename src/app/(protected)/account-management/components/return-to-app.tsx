'use client'

import { ArrowLeft, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useIsMobileDevice } from '@/hooks/use-is-mobile-device'
import { getBaseUrl } from '@/lib/get-base-url'

interface ReturnToAppProps {
  variant?: 'back' | 'complete'
}

export function ReturnToApp({ variant = 'complete' }: ReturnToAppProps) {
  const isMobileDevice = useIsMobileDevice()

  const handleReturn = () => {
    // Only use deep links on mobile devices to prevent desktop issues
    if (isMobileDevice) {
      // This page is excluded from universal links and opens in Safari/Chrome,
      // so we use hypro:// scheme to return to the app
      const deepLink = `hypro://fitspace/settings`

      // Try deep link first (will open app if installed)
      window.location.href = deepLink

      // Fallback to web URL after a delay if deep link fails
      setTimeout(() => {
        window.location.href = `${getBaseUrl()}/fitspace/settings`
      }, 2000)
    } else {
      // Desktop users: just navigate to web URL
      window.location.href = `${getBaseUrl()}/fitspace/settings`
    }
  }

  return (
    <Button
      onClick={handleReturn}
      variant={variant === 'complete' ? 'default' : 'ghost'}
      size={variant === 'complete' ? 'lg' : 'md'}
      iconStart={variant === 'complete' ? <CheckCircle /> : <ArrowLeft />}
    >
      {variant === 'complete' ? 'Return to App' : 'Back'}
    </Button>
  )
}
