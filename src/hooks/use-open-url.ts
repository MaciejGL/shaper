import { useState } from 'react'
import { toast } from 'sonner'

import { useMobileApp } from '@/components/mobile-app-bridge'

interface UseOpenUrlOptions {
  /**
   * Whether to generate and append session token for native app
   * @default true
   */
  withSessionToken?: boolean
  /**
   * Error message to show if opening fails
   * @default 'Failed to open page'
   */
  errorMessage?: string
}

/**
 * Hook to open URLs with proper native app support
 * Handles session token generation for native apps and fallback mechanisms
 *
 * @example
 * ```tsx
 * const { openUrl, isLoading } = useOpenUrl()
 *
 * <Button
 *   onClick={() => openUrl('/fitspace/settings')}
 *   loading={isLoading}
 * >
 *   Open Settings
 * </Button>
 * ```
 */
export function useOpenUrl(options: UseOpenUrlOptions = {}) {
  const { withSessionToken = true, errorMessage = 'Failed to open page' } =
    options

  const { isNativeApp, openExternalUrl } = useMobileApp()
  const [isLoading, setIsLoading] = useState(false)

  const openUrl = async (path: string) => {
    setIsLoading(true)

    try {
      // Convert relative path to absolute URL
      let targetUrl = path.startsWith('http')
        ? path
        : `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`

      // If in native app and session token is needed
      if (isNativeApp && withSessionToken) {
        try {
          const response = await fetch('/api/auth/generate-session-token', {
            method: 'POST',
          })

          if (response.ok) {
            const { sessionToken } = await response.json()
            const separator = targetUrl.includes('?') ? '&' : '?'
            targetUrl += `${separator}session_token=${encodeURIComponent(sessionToken)}`
          }
        } catch (error) {
          console.error('Failed to generate session token:', error)
          // Continue without token - user may need to login
        }
      }

      // Use bridge's openExternalUrl for proper external browser handling
      openExternalUrl(targetUrl)
    } catch (error) {
      console.error('Error opening URL:', error)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    openUrl,
    isLoading,
  }
}
