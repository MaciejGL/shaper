'use client'

import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'
import { Loader2, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

import { Dialog, DialogClose, DialogContent, DialogPortal } from './ui/dialog'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  onCloseScanner: () => void
  isProcessing?: boolean
  isOpen: boolean
}

export function BarcodeScanner({
  onScan,
  onClose,
  onCloseScanner,
  isOpen,
  isProcessing = false,
}: BarcodeScannerProps) {
  const [error, setError] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)
  const [scannedCode, setScannedCode] = useState<string>('')

  useEffect(() => {
    // Detect mobile device for optimal camera settings
    const checkMobile = () => {
      const userAgent =
        navigator.userAgent ||
        navigator.vendor ||
        (window as unknown as { opera: string })?.opera
      return /android|blackberry|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i.test(
        userAgent.toLowerCase(),
      )
    }
    setIsMobile(checkMobile())
  }, [])

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0 && !isProcessing) {
      const barcode = detectedCodes.at(0)?.rawValue
      if (barcode && barcode !== scannedCode) {
        setScannedCode(barcode)

        // Provide haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(100)
        }

        // Immediately call onScan without delay
        onScan(barcode)
        onCloseScanner()
      }
    }
  }

  const handleError = (error: unknown) => {
    console.error('Scanner error:', error)
    setError(error instanceof Error ? error.message : 'Camera error occurred')
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-background">
        <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
        <p className="text-muted-foreground text-sm mb-6 text-center">
          {error}
        </p>
        <div className="space-y-2 w-full max-w-sm">
          <Button onClick={() => setError('')} className="w-full">
            Try Again
          </Button>
          <Button variant="secondary" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseScanner}>
      <DialogPortal>
        <DialogContent
          dialogTitle="Barcode Scanner"
          fullScreen
          className="bg-black p-0"
          withCloseButton={false}
        >
          <div className="relative h-full w-full">
            {/* Close button */}
            <div className="absolute top-6 right-6 z-[1000]">
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  size="icon-md"
                  iconOnly={<XIcon />}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onCloseScanner()
                  }}
                />
              </DialogClose>
            </div>

            {/* Scanner */}
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{
                facingMode: 'environment', // Use back camera
                width: {
                  ideal: isMobile ? 1920 : 1920,
                  min: 640,
                },
                height: {
                  ideal: isMobile ? 1080 : 1080,
                  min: 480,
                },
                // Enable higher frame rate for better scanning
                frameRate: { ideal: 30, min: 15 },
              }}
              formats={[
                'ean_13', // Most common for groceries
                'ean_8', // Short version
                'upc_a', // Common in North America
                'upc_e', // Short UPC
                'code_128', // Used for some products
                'qr_code', // Sometimes used for products
              ]}
              components={{
                torch: true, // Enable torch/flashlight
                onOff: true,
                finder: false,
              }}
              scanDelay={isMobile ? 500 : 300} // Longer delay on mobile for better accuracy
            />

            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Viewfinder Frame */}
              <div className="flex items-center justify-center h-full">
                <div className="relative">
                  {/* Scanning frame */}
                  <div
                    className={`w-72 h-48 border-2 rounded-lg transition-all duration-300 ${
                      isProcessing
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-white/50'
                    }`}
                  >
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />

                    {/* Processing loader */}
                    {isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="size-12 text-yellow-500 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Instruction Text */}
              <div className="absolute bottom-32 left-0 right-0">
                <div className="text-center space-y-2">
                  <p className="text-white text-md font-medium px-4">
                    {isProcessing
                      ? 'Looking up product...'
                      : 'Position barcode within the frame'}
                  </p>
                  {!isProcessing && (
                    <p className="text-white/70 text-sm px-4">
                      Make sure the barcode is well-lit and clearly visible
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
