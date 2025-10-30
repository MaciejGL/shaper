'use client'

interface DeepLinkRedirectProps {
  callbackUrl: string
}

/**
 * Client component that triggers deep link to return to mobile app
 *
 * Browsers block automatic deep link redirects for security.
 * User must click the button to open the app.
 */
export function DeepLinkRedirect({ callbackUrl }: DeepLinkRedirectProps) {
  const deepLink = `hypro://?url=${encodeURIComponent(callbackUrl)}`

  const handleOpenApp = () => {
    console.info('📱 [DEEP-LINK] Opening app with URL:', callbackUrl)
    console.info('📱 [DEEP-LINK] Full deep link:', deepLink)
    window.location.href = deepLink
  }

  return (
    <button
      onClick={handleOpenApp}
      className="mt-6 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
    >
      Open Hypro App
    </button>
  )
}
