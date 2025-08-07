import { PushNotificationManager } from '@/components/push-notification-manager'

export default function PushTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Push Notifications Test</h1>
        <p className="text-muted-foreground mb-4">
          Test push notifications for your Shaper fitness app. This is a
          complete implementation following Next.js best practices.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            🔑 Setup Required:
          </h3>
          <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
            <li>
              Add the generated VAPID keys to your{' '}
              <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                .env
              </code>{' '}
              file
            </li>
            <li>
              Replace the email in{' '}
              <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                NEXT_PUBLIC_VAPID_SUBJECT
              </code>{' '}
              with your actual email
            </li>
            <li>Test on HTTPS (required for push notifications)</li>
            <li>
              Try on your phone by visiting this page in your mobile browser
            </li>
          </ol>
        </div>
      </div>

      <div className="flex justify-center">
        <PushNotificationManager />
      </div>

      <div className="mt-8 max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold">How to Test:</h2>
        <div className="grid gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">📱 Mobile Testing</h3>
            <p className="text-sm text-muted-foreground">
              Open this page on your phone's browser, subscribe to
              notifications, then minimize the browser or switch to another app.
              Send a test notification and it should appear in your phone's
              notification center.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">💻 Desktop Testing</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to notifications, then minimize your browser or switch
              to another tab. Send a test notification and it should appear as a
              system notification.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">🍎 iOS Testing</h3>
            <p className="text-sm text-muted-foreground">
              On iOS Safari, you need to "Add to Home Screen" to enable push
              notifications. After adding to home screen, open the app and
              subscribe to notifications.
            </p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            ✅ What's Implemented:
          </h3>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
            <li>Service Worker with push event handlers</li>
            <li>VAPID key authentication</li>
            <li>Subscription management</li>
            <li>Server actions for sending notifications</li>
            <li>
              Pre-built notification types (workout, meal, coaching,
              achievements)
            </li>
            <li>Cross-platform support (Android, iOS PWA, Desktop)</li>
            <li>Integration-ready for your existing notification system</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
