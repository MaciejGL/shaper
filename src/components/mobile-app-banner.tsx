'use client'

import { ArrowRight, Smartphone } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { MOBILE_STORE_LINKS } from '@/config/mobile-store-links'
import { analyticsEvents } from '@/lib/analytics-events'

type MobileAppBannerSource =
  | 'download_page'
  | 'hero'
  | 'account_management'
  | 'push_settings'

interface MobileAppBannerProps {
  className?: string
  source: MobileAppBannerSource
  /**
   * Always show the banner, bypassing device/native app detection.
   * Useful for pages like account-management where we want to show
   * download buttons to all web users.
   */
  alwaysShow?: boolean
  /**
   * Hide the open app button.
   * Useful for pages like download where we want to show only the download buttons.
   */
  hideOpenAppButton?: boolean
  /**
   * Controls where the open app button should render relative to download CTAs on mobile.
   * Defaults to current behavior to avoid changing existing pages.
   */
  openAppPlacement?: 'aboveDownload' | 'belowDownload'
  /**
   * Optional helper text displayed above the open app button (mobile only).
   */
  openAppHelperText?: string
  /**
   * Force showing both store CTAs even on iOS/Android devices.
   * Useful for pages like /download where the user should choose.
   */
  showAllStoreButtons?: boolean
}

export function MobileAppBanner({
  className,
  source,
  alwaysShow = false,
  hideOpenAppButton = false,
  openAppPlacement = 'aboveDownload',
  openAppHelperText,
  showAllStoreButtons: _showAllStoreButtons = false,
}: MobileAppBannerProps) {
  const ref =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)?.get('ref')
      : null

  const openStoreUrl = (url: string, store: 'ios' | 'android') => {
    analyticsEvents.appStoreClick({ store, source, ref })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Hide only when actually running inside native shell.
  // Important: do NOT rely on `useMobileApp().isNativeApp` here, because it can be
  // forced via NEXT_PUBLIC_PLATFORM for dev/testing which would hide the banner on web.
  const isTrulyNative =
    typeof window !== 'undefined' &&
    (window.isNativeApp === true || !!window.nativeApp)
  if (isTrulyNative) return null

  // When alwaysShow is true, bypass isAvailable checks
  const canShowIos = alwaysShow || MOBILE_STORE_LINKS.ios.isAvailable
  const canShowAndroid = alwaysShow || MOBILE_STORE_LINKS.android.isAvailable

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        {!hideOpenAppButton && openAppPlacement === 'aboveDownload' ? (
          <OpenAppButton />
        ) : null}

        {canShowIos ? (
          <button
            type="button"
            onClick={() => openStoreUrl(MOBILE_STORE_LINKS.ios.url, 'ios')}
            aria-label="Download on the App Store"
          >
            <Image
              src="/app-store.svg"
              alt="App Store"
              width={240}
              height={80}
            />
          </button>
        ) : null}

        {canShowAndroid ? (
          <button
            type="button"
            onClick={() =>
              openStoreUrl(MOBILE_STORE_LINKS.android.url, 'android')
            }
            aria-label="Get it on Google Play"
          >
            <Image
              src="/google-play.svg"
              alt="Google Play"
              width={240}
              height={80}
            />
          </button>
        ) : null}

        {!hideOpenAppButton && openAppPlacement === 'belowDownload' ? (
          <>
            {openAppHelperText ? (
              <p className="text-sm text-muted-foreground text-center">
                {openAppHelperText}
              </p>
            ) : null}
            <OpenAppButton />
          </>
        ) : null}
      </div>
    </div>
  )
}

const OpenAppButton = () => {
  const openApp = () => {
    window.location.href = 'hypro://fitspace/workout'
  }

  return (
    <Button
      onClick={openApp}
      size="xl"
      iconStart={<Smartphone />}
      iconEnd={<ArrowRight />}
      className="w-full md:hidden"
    >
      Open the app
    </Button>
  )
}
