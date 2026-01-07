import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { MobileAppBanner } from '@/components/mobile-app-banner'
import { MOBILE_STORE_LINKS } from '@/config/mobile-store-links'
import { ServerEvent, captureServerEvent } from '@/lib/posthog-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type DeviceType = 'ios' | 'android' | 'desktop'

function detectDevice(userAgent: string): DeviceType {
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  return 'desktop'
}

function trackDownloadVisit({
  ref,
  referer,
  device,
  userAgent,
  redirectedTo,
}: {
  ref: string | null
  referer: string | null
  device: DeviceType
  userAgent: string
  redirectedTo: 'app_store' | 'google_play' | null
}) {
  captureServerEvent({
    distinctId: 'anonymous_download',
    event: ServerEvent.APP_DOWNLOAD_PAGE_VISIT,
    properties: {
      ref,
      referer,
      device,
      user_agent: userAgent,
      redirected_to: redirectedTo,
    },
  })
}

export default async function DownloadPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const params = await searchParams
  const ref = params.ref ?? null

  const headersList = await headers()
  const userAgent = headersList.get('user-agent')?.toLowerCase() ?? ''
  const referer = headersList.get('referer') ?? null

  const device = detectDevice(userAgent)

  // iOS -> App Store
  if (device === 'ios') {
    trackDownloadVisit({
      ref,
      referer,
      device,
      userAgent,
      redirectedTo: 'app_store',
    })
    redirect(MOBILE_STORE_LINKS.ios.url)
  }

  // Android -> Google Play
  if (device === 'android') {
    trackDownloadVisit({
      ref,
      referer,
      device,
      userAgent,
      redirectedTo: 'google_play',
    })
    redirect(MOBILE_STORE_LINKS.android.url)
  }

  // Desktop/unknown - track and show fallback UI
  trackDownloadVisit({
    ref,
    referer,
    device,
    userAgent,
    redirectedTo: null,
  })

  return (
    <div className="dark flex min-h-screen w-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-8 max-w-sm text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Get Hypro
          </h1>
          <p className="text-muted-foreground text-sm">
            Download the app for your device
          </p>
        </div>

        <MobileAppBanner alwaysShow hideOpenAppButton />
      </div>
    </div>
  )
}
