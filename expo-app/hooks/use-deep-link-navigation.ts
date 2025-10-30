/**
 * Hook to handle initial navigation from deep links and push notifications
 */
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'

export function useDeepLinkNavigation() {
  const [initialWebUrl, setInitialWebUrl] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    const checkInitialNavigation = async () => {
      // 1. Check for deep link (cold start)
      const initialUrl = await Linking.getInitialURL()
      if (initialUrl) {
        console.info('📱 [DEEP-LINK] Cold start with deep link:', initialUrl)

        const parsed = Linking.parse(initialUrl)
        console.info('📱 [DEEP-LINK] Parsed:', {
          queryParams: parsed.queryParams,
          allParams: Object.keys(parsed.queryParams || {}),
        })

        const urlParam = (parsed.queryParams?.url as string) || undefined

        if (urlParam) {
          // Construct the full web URL with domain
          let fullUrl = urlParam.startsWith('http')
            ? urlParam
            : `https://www.hypro.app${urlParam.startsWith('/') ? '' : '/'}${urlParam}`

          // IMPORTANT: Check if session_token was parsed as a separate query param
          // This happens if the URL wasn't properly encoded in the deep link
          const sessionToken = parsed.queryParams?.session_token as
            | string
            | undefined
          if (sessionToken && !fullUrl.includes('session_token')) {
            console.warn(
              '⚠️ [DEEP-LINK] session_token parsed separately! Reconstructing...',
            )
            fullUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}session_token=${sessionToken}`
          }

          console.info('📱 [DEEP-LINK] Setting initial URL:', {
            urlParam,
            fullUrl,
            hasSessionToken: fullUrl.includes('session_token'),
            sessionTokenLength: sessionToken?.length,
          })

          setInitialWebUrl(fullUrl)
          return // Don't check notification if deep link exists
        }
      }

      // 2. Check for push notification navigation (only if no deep link)
      const lastNotificationResponse =
        await Notifications.getLastNotificationResponse()
      if (lastNotificationResponse?.notification.request.content.data?.url) {
        const notificationUrl = lastNotificationResponse.notification.request
          .content.data.url as string
        console.info(
          '📱 [NOTIFICATION] App opened from notification:',
          notificationUrl,
        )

        const fullNotificationUrl = notificationUrl.startsWith('http')
          ? notificationUrl
          : `https://www.hypro.app${notificationUrl.startsWith('/') ? '' : '/'}${notificationUrl}`
        setInitialWebUrl(fullNotificationUrl)
      }
    }

    checkInitialNavigation()
  }, [])

  return { initialWebUrl }
}
