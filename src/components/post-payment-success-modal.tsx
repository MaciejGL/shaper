'use client'

import { CheckCircle, Info, Loader2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

import { BiggyIcon } from './biggy-icon'
import { useMobileApp } from './mobile-app-bridge'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface PostPaymentSuccessModalProps {
  open: boolean
  isPolling: boolean
  isTimeout: boolean
  subscriptionReady: boolean
  onRefresh: () => void
}

export function PostPaymentSuccessModal({
  open,
  isPolling,
  isTimeout,
  subscriptionReady,
  onRefresh,
}: PostPaymentSuccessModalProps) {
  const { isNativeApp, navigateToPath } = useMobileApp()
  const [showContent, setShowContent] = useState(false)

  // Delay content appearance for smooth animation
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setShowContent(true), 100)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [open])

  const handleReturnToApp = () => {
    if (isNativeApp) {
      navigateToPath('/fitspace/progress')
    } else {
      window.location.href = '/fitspace/progress'
    }
  }

  // Prevent closing modal until ready or timeout
  const handleOpenChange = (newOpen: boolean) => {
    // Can only close after subscription is ready or timeout
    if (!newOpen && (subscriptionReady || isTimeout)) {
      return
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dialogTitle="Payment Status"
        withCloseButton={subscriptionReady || isTimeout}
        className="sm:max-w-md"
      >
        {/* Loading State */}
        {isPolling && showContent && (
          <>
            <div className="flex justify-center mb-4">
              <BiggyIcon icon={CheckCircle} variant="success" />
            </div>

            <DialogHeader className="text-center">
              <DialogTitle>Payment Successful!</DialogTitle>
              <DialogDescription className="pt-2">
                Your payment was processed successfully.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-card-on-card p-4 rounded-lg">
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Activating your subscription...</p>
              </div>
            </div>
          </>
        )}

        {/* Timeout State */}
        {isTimeout && showContent && (
          <>
            <div className="flex justify-center mb-4">
              <BiggyIcon icon={Info} variant="default" />
            </div>

            <DialogHeader className="text-center">
              <DialogTitle>Processing Subscription</DialogTitle>
              <DialogDescription className="pt-2">
                Your subscription is being activated.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-card-on-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                This is taking longer than expected. Your subscription will be
                ready shortly.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={onRefresh} variant="outline" className="w-full">
                Check Status
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Success/Ready State */}
        {subscriptionReady && showContent && (
          <>
            <div className="flex justify-center mb-4">
              <BiggyIcon icon={Sparkles} variant="amber" />
            </div>

            <DialogHeader className="text-center">
              <DialogTitle>Subscription Activated!</DialogTitle>
              <DialogDescription className="pt-2">
                Welcome to Premium. You now have access to all premium features.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-card-on-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Start tracking your progress and unlock your full potential.
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={handleReturnToApp}
                variant="gradient"
                size="lg"
                className="w-full"
                iconStart={<Sparkles />}
              >
                Return to App
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
