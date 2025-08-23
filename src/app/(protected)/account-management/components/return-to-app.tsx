'use client'

import { ArrowLeft, CheckCircle } from 'lucide-react'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'

interface ReturnToAppProps {
  variant?: 'back' | 'complete'
}

export function ReturnToApp({ variant = 'complete' }: ReturnToAppProps) {
  const { isNativeApp, navigateToPath } = useMobileApp()

  const handleReturn = () => {
    if (isNativeApp) {
      // Use native navigation
      navigateToPath('/fitspace/settings')
    } else {
      // Try deeplink first, fallback to web
      try {
        window.location.href = 'hypertro://fitspace/settings'
        // Fallback to web app after short delay
        setTimeout(() => {
          window.location.href = `${window.location.origin}/fitspace/settings`
        }, 1000)
      } catch {
        window.location.href = `${window.location.origin}/fitspace/settings`
      }
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
