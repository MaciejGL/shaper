'use client'

import { AnimatedLogo } from '@/components/animated-logo'
import { Button } from '@/components/ui/button'

/**
 * Error state when callback URL is missing
 */
export function MobileStartError() {
  const handleReturnToLogin = () => {
    window.location.href = 'hypro://'
  }

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={false} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Something went wrong...
      </h1>
      <p className="text-sm text-muted-foreground mb-4">Please try again.</p>

      <Button
        onClick={handleReturnToLogin}
        variant="default"
        size="lg"
        className="w-full max-w-sm"
      >
        Return to login
      </Button>
    </div>
  )
}
