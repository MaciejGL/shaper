'use client'

import { JsonValue } from '@prisma/client/runtime/client'
import { CheckCircle, Clock, CreditCard, Shield } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { BiggyIcon } from '@/components/biggy-icon'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { CoachingServiceTerms } from '@/components/subscription/coaching-service-terms'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { createDeepLink } from '@/lib/deep-links'
import { getBaseUrl } from '@/lib/get-base-url'
import { PackageSummaryItem } from '@/types/trainer-offer'

interface BundleOfferPageProps {
  offer: {
    id: string
    token: string
    trainerId: string
    clientEmail: string
    personalMessage: string | null
    expiresAt: Date
    trainer: {
      name: string | null
      image: string | null
      profile: {
        firstName: string | null
        lastName: string | null
        bio: string | null
        specialization: string[]
        credentials: string[]
      } | null
    }
    packageSummary: JsonValue
  }

  clientEmail: string
}

export function OfferPage({ offer, clientEmail }: BundleOfferPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)
  const { isNativeApp } = useMobileApp()

  const packageSummary = offer.packageSummary as unknown as PackageSummaryItem[]

  const trainerName = offer.trainer.profile?.firstName
    ? `${offer.trainer.profile.firstName} ${offer.trainer.profile.lastName || ''}`.trim()
    : offer.trainer.name || 'Your Trainer'

  const handleShowTerms = () => {
    setShowTermsDialog(true)
  }

  const handleCheckoutClick = () => {
    setShowTermsError(false)
    if (!hasAgreedToTerms) {
      setShowTermsError(true)
      return
    }
    handleProceedToCheckout()
  }

  const handleProceedToCheckout = async () => {
    setIsLoading(true)

    try {
      // Generate session token if in native app
      let sessionToken: string | null = null
      if (isNativeApp) {
        try {
          const tokenResponse = await fetch(
            '/api/auth/generate-session-token',
            {
              method: 'POST',
            },
          )
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json()
            sessionToken = tokenData.sessionToken
          }
        } catch (error) {
          console.error('Failed to generate session token:', error)
        }
      }

      // Prepare success and cancel URLs with session token if available
      let successUrl = `${window.location.origin}/offer/${offer.token}/success`
      let cancelUrl = window.location.href

      if (sessionToken) {
        successUrl += `?session_token=${encodeURIComponent(sessionToken)}`
        const cancelSeparator = cancelUrl.includes('?') ? '&' : '?'
        cancelUrl += `${cancelSeparator}session_token=${encodeURIComponent(sessionToken)}`
      }

      // Create Stripe checkout session for bundle
      const response = await fetch('/api/stripe/create-trainer-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerToken: offer.token,
          clientEmail,
          // Return URLs for web checkout
          successUrl,
          cancelUrl,
        }),
      })

      const result = await response.json()

      if (result.error) {
        // Handle detailed error messages for mixed payment types
        if (result.message && result.details) {
          const detailsText = `\n\nOne-time items: ${result.details.oneTimeItems?.join(', ')}\nSubscriptions: ${result.details.subscriptionItems?.join(', ')}`
          throw new Error(result.message + detailsText)
        } else {
          throw new Error(result.error)
        }
      }

      const { checkoutUrl } = result

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)

      // Handle specific error types
      if (error instanceof Error) {
        toast.error('Failed to start checkout. Please try again.')
      } else {
        toast.error('Failed to start checkout. Please try again.')
      }

      setIsLoading(false)
    } finally {
      setShowTermsDialog(false)
    }
  }

  const appDeepLink = createDeepLink(
    'fitspace/my-trainer?tab=purchased-services',
  )
  const url = `${getBaseUrl()}/fitspace/my-trainer?tab=purchased-services`

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

  // Check if offer is expired
  if (offer.expiresAt < new Date()) {
    return (
      <div className="dark min-h-screen w-full bg-background">
        <div className="container-hypertro mx-auto max-w-md">
          <div className="flex items-center justify-center min-h-screen p-4">
            <Card borderless variant="secondary" className="w-full text-center">
              <CardHeader>
                <div className="flex-center w-full">
                  <BiggyIcon icon={Clock} variant="default" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  Offer Expired
                </h1>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    This training offer has expired. Please contact your trainer
                    for a new offer.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Offers are valid for 72 hours from creation.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleReturnToApp}
                  size="lg"
                  className="w-full"
                >
                  Return to App
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dark bg-background min-h-screen w-full flex-center">
      <div className="container-hypertro mx-auto max-w-lg">
        {/* Header */}
        <div className="pt-12 pb-6 px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Training Offer</h1>
          <p className="text-muted-foreground">from {trainerName}</p>
        </div>

        <div className="space-y-6 p-4">
          <Card borderless variant="secondary">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="size-16">
                  <AvatarImage src={offer.trainer.image || ''} />
                  <AvatarFallback>
                    {trainerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">
                    {trainerName}
                  </h2>
                  {offer.trainer.profile?.credentials &&
                    offer.trainer.profile.credentials.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {offer.trainer.profile.credentials.join(', ')}
                      </p>
                    )}
                </div>
              </div>

              {offer.trainer.profile?.bio && (
                <p className="text-muted-foreground text-sm">
                  {offer.trainer.profile.bio}
                </p>
              )}

              {offer.trainer.profile?.specialization &&
                offer.trainer.profile.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {offer.trainer.profile.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Personal Message */}
          {offer.personalMessage && (
            <Card
              borderless
              variant="secondary"
              className="border-l-4 border-l-primary"
            >
              <CardContent>
                <p className="text-primary font-medium text-sm mb-2">
                  Personal message from {trainerName}:
                </p>
                <p className="text-foreground">{offer.personalMessage}</p>
              </CardContent>
            </Card>
          )}

          {/* Bundle Details */}
          <Card borderless variant="secondary">
            <CardHeader>
              <CardTitle className="text-xl">Training Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Package Items */}
              <div className="space-y-4">
                {packageSummary.map((item) => (
                  <div
                    key={item.packageId}
                    className="border-l-2 border-green-500 pl-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-base">
                        {item.name.replaceAll('[TEST]', ' ')}
                      </h4>
                      {item.quantity > 1 && (
                        <Badge variant="outline">x {item.quantity}</Badge>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-muted-foreground text-sm">
                        {item.description.replaceAll('[TEST ENVIRONMENT]', ' ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Terms Agreement & Checkout */}
          <div className="space-y-3">
            {/* Terms Agreement Checkbox */}
            <div className="flex items-start space-x-3 my-8">
              <Checkbox
                id="terms-agreement"
                checked={hasAgreedToTerms}
                onCheckedChange={(checked) => {
                  setHasAgreedToTerms(checked === true)
                  if (checked === true) {
                    setShowTermsError(false)
                  }
                }}
                className={`mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${
                  showTermsError ? 'border-red-500 ring-red-500' : ''
                }`}
              />
              <label
                htmlFor="terms-agreement"
                className="text-sm text-foreground leading-5 max-w-[50ch]"
              >
                I agree to the{' '}
                <button
                  type="button"
                  onClick={handleShowTerms}
                  className="text-primary hover:text-primary/80 underline font-medium"
                >
                  coaching service terms
                </button>
                {', '}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-primary hover:text-primary/80 underline"
                >
                  terms of service
                </a>
                {', and '}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-primary hover:text-primary/80 underline"
                >
                  privacy policy
                </a>
              </label>
            </div>

            {/* Terms Error Message */}
            {showTermsError && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Please agree to the terms and conditions to proceed</span>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleCheckoutClick}
              loading={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </>
              )}
            </Button>
            <Button
              onClick={handleReturnToApp}
              size="lg"
              className="w-full"
              variant="tertiary"
            >
              Return to App
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="text-center space-y-3 mt-20">
            <p className="text-sm text-muted-foreground">
              Secure payment powered by Stripe
            </p>
            <div className="flex justify-center flex-wrap space-x-6 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="w-3 h-3" />
                <span>All Cards Accepted</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Buyer Protection</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              Having issues? Contact {trainerName} directly or email
              support@hypertro.com
            </p>
          </div>
        </div>

        {/* Coaching Service Terms Dialog */}
        <CoachingServiceTerms
          isOpen={showTermsDialog}
          onClose={() => setShowTermsDialog(false)}
          onAccept={() => setShowTermsDialog(false)}
          serviceType="coaching"
          trainerName={trainerName}
          packages={packageSummary.map((item) => ({
            name: item.name,
            description: item.description || undefined,
          }))}
          readOnly={true}
        />
      </div>
    </div>
  )
}
