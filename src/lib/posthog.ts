import { PostHog } from 'posthog-js'

let posthogInstance: PostHog | null = null

export function getPostHogInstance(): PostHog | null {
  if (typeof window === 'undefined') {
    return null
  }
  return posthogInstance
}

export async function initPostHog(): Promise<PostHog | null> {
  if (typeof window === 'undefined') {
    return null
  }

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn('PostHog key not found in environment variables')
    return null
  }

  if (!posthogInstance) {
    // Import PostHog dynamically to avoid SSR issues
    const posthog = (await import('posthog-js')).default

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      // Enable session recordings
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
      // Enable feature flags
      // Capture page views automatically
      capture_pageview: false, // We'll handle this manually for better control
      // Other useful options
      persistence: 'localStorage+cookie',
      autocapture: true,
      disable_session_recording: false,
      verbose: false,
      enable_recording_console_log: true,
      loaded: (posthog: PostHog) => {
        // Only enable debug mode in development

        posthog.debug(false)
      },
    })

    posthogInstance = posthog
  }

  return posthogInstance
}

export function captureEvent(
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, any>,
) {
  const posthog = getPostHogInstance()
  if (posthog) {
    posthog.capture(eventName, properties)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function identifyUser(userId: string, properties?: Record<string, any>) {
  const posthog = getPostHogInstance()
  if (posthog) {
    posthog.identify(userId, properties)
  }
}

export function resetUser() {
  const posthog = getPostHogInstance()
  if (posthog) {
    posthog.reset()
  }
}

export function capturePageView(path?: string) {
  const posthog = getPostHogInstance()
  if (posthog) {
    posthog.capture('$pageview', {
      $current_url: path || window.location.href,
    })
  }
}

export function getFeatureFlag(flagKey: string): boolean | string | undefined {
  const posthog = getPostHogInstance()
  if (posthog) {
    return posthog.getFeatureFlag(flagKey)
  }
  return undefined
}

export function isFeatureEnabled(flagKey: string): boolean {
  const posthog = getPostHogInstance()
  if (posthog) {
    return posthog.isFeatureEnabled(flagKey) ?? false
  }
  return false
}
