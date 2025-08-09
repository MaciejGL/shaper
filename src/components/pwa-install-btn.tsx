'use client'

import { Download, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallButtonProps {
  variant?: 'default' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showOnMobile?: boolean // Show even on mobile devices
}

export function PWAInstallButton({
  variant = 'default',
  size = 'md',
  className,
  showOnMobile = true,
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (
      window.matchMedia &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      setIsInstalled(true)
      return
    }

    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Don't show on mobile browsers unless specified
    if (
      !showOnMobile &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    ) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [showOnMobile])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true)
      return
    }

    if (!deferredPrompt) {
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.info('PWA install accepted')
      } else {
        console.info('PWA install dismissed')
      }

      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  // Don't show if already installed
  if (isInstalled) return null

  // Show for installable PWAs or iOS devices
  if (!isInstallable && !isIOS) return null

  return (
    <>
      <Button
        onClick={handleInstallClick}
        variant={variant}
        size={size}
        className={cn('gap-2', className)}
        iconStart={isIOS ? <Smartphone /> : <Download />}
      >
        {isIOS ? 'Add to Home Screen' : 'Install App'}
      </Button>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowIOSInstructions(false)}
        >
          <div
            className="dark bg-card rounded-lg p-6 max-w-sm w-full shadow-neuro-light dark:shadow-neuro-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-4 text-white">
              Install Hypertro
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  Tap the <strong>Share button</strong> at the bottom of Safari
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  Tap <strong>"Add"</strong> to install Hypertro
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-6"
              variant="secondary"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
