'use client'

import { CheckCircle, Info, Loader2, Sparkles } from 'lucide-react'

import { BiggyIcon } from './biggy-icon'
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
  state: 'polling' | 'timeout' | 'ready'
  onRefresh: () => void
}

export function PostPaymentSuccessModal({
  open,
  state,
  onRefresh,
}: PostPaymentSuccessModalProps) {
  const handleReturnToApp = () => {
    // Simple window.location works for both native app and web
    // WebView automatically detects URL changes through onNavigationStateChange
    window.location.href = '/fitspace/workout'
  }

  // Prevent closing modal while polling - only allow closing when ready or timeout
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && state === 'polling') {
      // Prevent closing while still polling
      return
    }
    // Allow closing when ready or timeout - navigate away to clear URL params
    if (!newOpen) {
      handleReturnToApp()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dialogTitle="Payment Status"
        withCloseButton={state === 'ready' || state === 'timeout'}
        className="sm:max-w-md"
      >
        {/* Loading State */}
        {state === 'polling' && (
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
        {state === 'timeout' && (
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
        {state === 'ready' && (
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
                Start training and unlock your full potential.
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
                Start Training
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
