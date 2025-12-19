/**
 * Server-side PostHog client for backend event tracking
 *
 * Use this for tracking events from API routes, webhooks, and background jobs.
 * Events are sent with a distinctId (userId) for user attribution.
 */
import { PostHog } from 'posthog-node'

let client: PostHog | null = null

function getClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null
  }

  if (!client) {
    client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      flushAt: 1, // Send events immediately (important for serverless)
      flushInterval: 0,
    })
  }

  return client
}

/**
 * Server-side event names
 */
export enum ServerEvent {
  // Google Play reporting
  GOOGLE_REPORT_SUCCESS = 'google_report_success',
  GOOGLE_REPORT_ERROR = 'google_report_error',
  GOOGLE_REPORT_SKIPPED = 'google_report_skipped',
}

interface CaptureParams {
  distinctId: string
  event: ServerEvent
  properties?: Record<string, unknown>
}

/**
 * Capture a server-side event
 */
export function captureServerEvent({
  distinctId,
  event,
  properties,
}: CaptureParams): void {
  const posthog = getClient()
  if (!posthog) return

  posthog.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      source: 'server',
    },
  })
}

/**
 * Shutdown the client (call on app termination)
 */
export async function shutdownPostHog(): Promise<void> {
  if (client) {
    await client.shutdown()
    client = null
  }
}
