'use client'

import { ArrowLeft, CheckCircle } from 'lucide-react'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'
import { navigateToPath as navigateToDeepLink } from '@/lib/deep-links'

interface ReturnToAppProps {
  variant?: 'back' | 'complete'
}

export function ReturnToApp({ variant = 'complete' }: ReturnToAppProps) {
  const { isNativeApp, navigateToPath } = useMobileApp()
  const handleReturn = () => {
    if (isNativeApp) {
      navigateToPath('/fitspace/settings')
    } else {
      navigateToDeepLink('/fitspace/settings')
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
