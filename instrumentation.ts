import { getPostHogServer } from '@/lib/posthog-server'

export function register() {
  // No-op for initialization
}

export const onRequestError = async (
  err: Error & { digest?: string },
  request: { headers: { cookie?: string | string[] } },
) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const posthog = getPostHogServer()
    if (!posthog) return

    let distinctId: string | undefined

    if (request.headers.cookie) {
      const cookieString = Array.isArray(request.headers.cookie)
        ? request.headers.cookie.join('; ')
        : request.headers.cookie

      const postHogCookieMatch = cookieString.match(
        /ph_phc_.*?_posthog=([^;]+)/,
      )

      if (postHogCookieMatch?.[1]) {
        try {
          const decodedCookie = decodeURIComponent(postHogCookieMatch[1])
          const postHogData = JSON.parse(decodedCookie) as {
            distinct_id?: string
          }
          distinctId = postHogData.distinct_id
        } catch {
          console.error('[INSTRUMENTATION] Error parsing PostHog cookie')
        }
      }
    }

    posthog.captureException(err, distinctId)
  }
}
