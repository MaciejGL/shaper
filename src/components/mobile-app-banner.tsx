'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { MOBILE_STORE_LINKS } from '@/config/mobile-store-links'

interface MobileAppBannerProps {
  className?: string
  /**
   * Always show the banner, bypassing device/native app detection.
   * Useful for pages like account-management where we want to show
   * download buttons to all web users.
   */
  alwaysShow?: boolean
}

export function MobileAppBanner({
  className,
  alwaysShow = false,
}: MobileAppBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'other'>(
    'other',
  )
  const [isNativeApp, setIsNativeApp] = useState(false)

  useEffect(() => {
    // Check if running in native app
    const userAgent = navigator.userAgent.toLowerCase()
    const isInApp = window.isNativeApp
    setIsNativeApp(isInApp || false)

    // Detect device type - only for mobile devices
    let nextDeviceType: 'ios' | 'android' | 'other' = 'other'
    if (/iphone|ipad|ipod/.test(userAgent)) {
      nextDeviceType = 'ios'
    } else if (/android/.test(userAgent)) {
      nextDeviceType = 'android'
    }
    setDeviceType(nextDeviceType)

    // Show banner only on mobile devices and not in native app
    const isMobile =
      /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const shouldShow = alwaysShow
      ? true
      : isMobile &&
        !isInApp &&
        ((nextDeviceType === 'ios' && MOBILE_STORE_LINKS.ios.isAvailable) ||
          (nextDeviceType === 'android' &&
            MOBILE_STORE_LINKS.android.isAvailable))

    setIsVisible(shouldShow)
  }, [alwaysShow])

  const openStoreUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // When alwaysShow is true, bypass isAvailable checks
  const canShowIos = alwaysShow || MOBILE_STORE_LINKS.ios.isAvailable
  const canShowAndroid = alwaysShow || MOBILE_STORE_LINKS.android.isAvailable

  // When alwaysShow is true, skip visibility checks but still hide in native app
  const shouldRender = alwaysShow
    ? !isNativeApp
    : isVisible &&
      !isNativeApp &&
      ((deviceType === 'ios' && canShowIos) ||
        (deviceType === 'android' && canShowAndroid) ||
        (deviceType === 'other' && (canShowIos || canShowAndroid)))

  if (!shouldRender) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        {deviceType === 'ios' && canShowIos && (
          <button
            type="button"
            onClick={() => openStoreUrl(MOBILE_STORE_LINKS.ios.url)}
          >
            <Image
              src="/app-store.svg"
              alt="App Store"
              width={240}
              height={80}
            />
          </button>
        )}

        {deviceType === 'android' && canShowAndroid && (
          <button
            type="button"
            onClick={() => openStoreUrl(MOBILE_STORE_LINKS.android.url)}
          >
            <Image
              src="/google-play.svg"
              alt="Google Play"
              width={240}
              height={80}
            />
          </button>
        )}

        {deviceType === 'other' && (
          <div className="flex flex-col gap-4">
            {canShowIos && (
              <Button
                onClick={() => openStoreUrl(MOBILE_STORE_LINKS.ios.url)}
                size="xl"
                iconStart={<AppleIcon />}
              >
                Download on the App Store
              </Button>
            )}
            {canShowAndroid && (
              <Button
                onClick={() => openStoreUrl(MOBILE_STORE_LINKS.android.url)}
                size="xl"
                iconStart={<GooglePlayIcon />}
              >
                Download on Google Play
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const GooglePlayIcon = () => {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  )
}

const AppleIcon = () => {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}
