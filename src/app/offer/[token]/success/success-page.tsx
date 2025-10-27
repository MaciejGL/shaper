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
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)

  const packageSummary = offer.packageSummary as unknown as PackageSummaryItem[]

  const handleReturnToApp = useCallback(async () => {
    const packageIds = packageSummary.map((item) => item.packageId).join(',')
    const appDeepLink = createDeepLink(
      'fitspace/my-trainer?tab=purchased-services',
      {
        token: offer.token,
        trainer: offer.trainerId,
        packages: packageIds,
      },
    )
    const baseUrl = `${getBaseUrl()}/fitspace/my-trainer?tab=purchased-services`

    // Generate session token if not in native app (external browser scenario)
    let url = baseUrl
    if (!isNativeApp) {
      setIsGeneratingToken(true)
      try {
        const response = await fetch('/api/auth/generate-session-token', {
          method: 'POST',
        })
        if (response.ok) {
          const { sessionToken } = await response.json()
          url += `&session_token=${encodeURIComponent(sessionToken)}`
        }
      } catch (error) {
        console.error('Failed to generate session token:', error)
      }
      setIsGeneratingToken(false)
    }

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
  }, [isNativeApp, offer.token, offer.trainerId, packageSummary])

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
    <div className="dark bg-background size-full">
      <div className="min-h-screen mx-auto flex-center">
        <div className="max-w-2xl w-full md:py-12">
          <div className="rounded-lg shadow-lg px-4 py-8 text-center bg-background">
            {/* Success Icon */}
            <div className="flex-center mb-6">
              <BiggyIcon icon={CheckIcon} variant="success" />
            </div>

            {/* Success Message */}
            <h1 className="text-xl font-bold text-foreground mb-4">
              Payment Successful!
            </h1>

            <p className="text-base text-muted-foreground mb-6">
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
            <h3 className="font-semibold text-foreground mb-4 mt-12">
              What happens next:
            </h3>
            <Card variant="tertiary" className="p-4 mb-8 text-left">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 shrink-0 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">
                      Trainer Notification
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {trainerName} has been notified of your purchase and will
                      reach out within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 shrink-0 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">
                      Service Delivery
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Your personalized training materials will be prepared and
                      delivered through the app.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 shrink-0 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Get Started</p>
                    <p className="text-muted-foreground text-sm">
                      Check notifications in Hypro app for updates and next
                      steps.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Service Included */}
            <Card variant="tertiary" className="p-4 mb-8 text-left">
              <h4 className="font-semibold text-foreground mb-3">
                Your {packageSummary.length === 1 ? 'Package' : 'Bundle'}{' '}
                Includes:
              </h4>
              {packageSummary.length === 1 ? (
                // Single package - show services directly
                <div className="space-y-1">
                  {packageSummary[0]?.serviceType && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-foreground">
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
                      <h5 className="text-sm text-foreground">
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
              <p className="text-muted-foreground mb-4">
                Redirecting you back to the Hypro app in {countdown} seconds...
              </p>
            </div>

            <Button
              onClick={handleReturnToApp}
              size="lg"
              className="w-full mb-6"
              loading={isGeneratingToken}
              disabled={isGeneratingToken}
            >
              Return to App Now
            </Button>

            {/* Support */}
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Questions? Contact {trainerName} directly or email{' '}
                <a
                  href="mailto:support@hypro.app"
                  className="text-blue-600 hover:underline"
                >
                  support@hypro.app
                </a>
              </p>

              {sessionId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Payment ID: {sessionId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
