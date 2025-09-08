'use client'

import { JsonValue } from '@prisma/client/runtime/client'
import { CheckIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { BiggyIcon } from '@/components/biggy-icon'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ServiceType } from '@/generated/prisma/client'
import { createDeepLink } from '@/lib/deep-links'
import { getBaseUrl } from '@/lib/get-base-url'
import { PackageSummaryItem } from '@/types/trainer-offer'

interface SuccessPageProps {
  offer: {
    id: string
    token: string
    trainerId: string
    clientEmail: string
    packageSummary: JsonValue
  }
  trainerName: string
  sessionId: string | undefined
}

export function SuccessPage({
  offer,
  trainerName,
  sessionId,
}: SuccessPageProps) {
  const [countdown, setCountdown] = useState(30)
  const { isNativeApp } = useMobileApp()

  const packageSummary = offer.packageSummary as unknown as PackageSummaryItem[]

  const packageIds = packageSummary.map((item) => item.packageId).join(',')
  // ✅ Use bulletproof deep link utility with query parameters
  const appDeepLink = createDeepLink('fitspace/workout', {
    token: offer.token,
    trainer: offer.trainerId,
    packages: packageIds,
  })
  const url = `${getBaseUrl()}/fitspace/workout`

  const handleReturnToApp = useCallback(() => {
    // Try to open the mobile app with deep link
    if (isNativeApp) {
      // Already in mobile app, navigate within app
      window.location.href = appDeepLink
    } else {
      // On web browser, try to open mobile app via deep link
      try {
        window.location.href = appDeepLink
        // Fallback to web if mobile app doesn't respond
        setTimeout(() => {
          window.open(url, '_blank')
        }, 1000)
      } catch {
        window.open(url, '_blank')
      }
    }
  }, [appDeepLink, isNativeApp, url])

  // Auto-redirect countdown for mobile
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      handleReturnToApp()
    }
  }, [countdown, handleReturnToApp])

  const serviceLabels: Record<ServiceType, string> = {
    MEAL_PLAN: 'Personalized Meal Plan',
    WORKOUT_PLAN: 'Personalized Workout Plan',
    COACHING_COMPLETE: 'Personalized Coaching Sessions',
    IN_PERSON_MEETING: 'In-Person Training',
    PREMIUM_ACCESS: 'Premium Platform Access',
  }

  return (
    <div className="min-h-screen mx-auto flex-center">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex-center">
            <BiggyIcon icon={CheckIcon} variant="success" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          <p className="text-lg text-gray-700 mb-6">
            Congratulations! You've successfully purchased{' '}
            {packageSummary.length === 1 ? (
              <strong>{packageSummary[0].name}</strong>
            ) : (
              <strong>
                a training bundle ({packageSummary.length} packages)
              </strong>
            )}{' '}
            from {trainerName}.
          </p>

          {/* Package Details */}
          <Card className="p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">
              What happens next:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 shrink-0 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">
                    Trainer Notification
                  </p>
                  <p className="text-gray-600 text-sm">
                    {trainerName} has been notified of your purchase and will
                    reach out within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 shrink-0 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Service Delivery</p>
                  <p className="text-gray-600 text-sm">
                    Your personalized training materials will be prepared and
                    delivered through the app.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 shrink-0 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Get Started</p>
                  <p className="text-gray-600 text-sm">
                    Check your email and the Hypertro app for updates and next
                    steps.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Service Included */}
          <Card variant="gradient" className="p-6 mb-8 text-left">
            <h4 className="font-semibold text-gray-900 mb-3">
              Your {packageSummary.length === 1 ? 'Package' : 'Bundle'}{' '}
              Includes:
            </h4>
            {packageSummary.length === 1 ? (
              // Single package - show services directly
              <div className="space-y-2">
                {packageSummary[0]?.serviceType && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">
                      {serviceLabels[packageSummary[0].serviceType]}
                      {packageSummary[0].quantity > 1 &&
                        ` (${packageSummary[0].quantity}x)`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              packageSummary.map((packageItem) => (
                // Multiple packages - show grouped by package
                <div key={packageItem.packageId}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h5 className="font-medium text-gray-800">
                      {packageItem.name}
                    </h5>
                    {packageItem.quantity > 1 && (
                      <Badge variant="outline">x{packageItem.quantity}</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </Card>

          {/* Mobile App Redirect */}

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Redirecting you back to the Hypertro app in {countdown} seconds...
            </p>
          </div>

          <Button onClick={handleReturnToApp} size="lg" className="w-full mb-6">
            Return to App Now
          </Button>

          {/* Support */}
          <div className="pt-6 border-t">
            <p className="text-sm text-gray-500">
              Questions? Contact {trainerName} directly or email{' '}
              <a
                href="mailto:support@hypertro.com"
                className="text-blue-600 hover:underline"
              >
                support@hypertro.com
              </a>
            </p>

            {sessionId && (
              <p className="text-xs text-gray-400 mt-2">
                Payment ID: {sessionId}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
