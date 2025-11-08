'use client'

import { JsonValue } from '@prisma/client/runtime/client'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Info,
  Package,
  Shield,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { BiggyIcon } from '@/components/biggy-icon'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { CoachingServiceTerms } from '@/components/subscription/coaching-service-terms'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
import { SectionIcon } from '@/components/ui/section-icon'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { getBaseUrl } from '@/lib/get-base-url'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { cn } from '@/lib/utils'
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
  userId: string
}

export function OfferPage({
  offer,
  clientEmail,
  userId,
}: BundleOfferPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)
  const { isNativeApp } = useMobileApp()

  // Check if user has active platform premium subscription (not coaching)
  const { data: subscriptionData } = useCurrentSubscription(userId, {
    type: 'platform',
  })

  // Check if user has active coaching subscription for in-person discounts
  const { data: coachingSubscriptionData } = useCurrentSubscription(userId, {
    lookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
  })

  const hasCoachingSubscription =
    coachingSubscriptionData?.subscription?.package?.stripeLookupKey ===
      STRIPE_LOOKUP_KEYS.PREMIUM_COACHING &&
    (coachingSubscriptionData?.status === 'ACTIVE' ||
      coachingSubscriptionData?.status === 'CANCELLED_ACTIVE')

  const packageSummary = offer.packageSummary as unknown as PackageSummaryItem[]

  const trainerName = offer.trainer.profile?.firstName
    ? `${offer.trainer.profile.firstName} ${offer.trainer.profile.lastName || ''}`.trim()
    : offer.trainer.name || 'Your Trainer'

  // If user has active platform premium subscription, show refund notice
  const hasActivePlatformPremium =
    subscriptionData?.subscription?.package?.stripeLookupKey ===
      STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY ||
    subscriptionData?.subscription?.package?.stripeLookupKey ===
      STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY

  // Check if offer includes coaching (premium_coaching lookup key)
  const offerIncludesCoaching = packageSummary.some(
    (item) => item.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
  )

  // Check if user qualifies for in-person discount (either has subscription OR offer includes coaching)
  const qualifiesForInPersonDiscount =
    hasCoachingSubscription || offerIncludesCoaching

  // Show refund notice only when user has platform premium AND offer includes coaching
  const shouldShowRefundNotice =
    hasActivePlatformPremium && offerIncludesCoaching

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

  const handleReturnToApp = useCallback(() => {
    const url = `${getBaseUrl()}/fitspace/my-trainer?tab=purchased-services`

    // Universal link - opens in app if installed, otherwise in browser
    if (isNativeApp) {
      window.location.href = url
    } else {
      window.open(url, '_blank')
    }
  }, [isNativeApp])

  // Check if offer is expired
  if (offer.expiresAt < new Date()) {
    return (
      <div className="dark min-h-screen w-full bg-background">
        <div className="container-hypertro mx-auto max-w-md">
          <div className="flex items-center justify-center min-h-screen p-4">
            <Card variant="secondary" className="w-full text-center">
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
        <div className="pt-20 pb-4 px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Training Offer</h1>
          <p className="text-muted-foreground">from {trainerName}</p>
        </div>

        <div className="space-y-4 p-4">
          {/* Personal Message */}
          {offer.personalMessage && (
            <Card variant="secondary">
              <CardContent className="p-4 border-l-4 border-l-primary">
                <p className="text-primary font-medium text-sm mb-2">
                  Personal message from {trainerName}:
                </p>
                <p className="text-foreground">{offer.personalMessage}</p>
              </CardContent>
            </Card>
          )}

          <Card variant="secondary" className="mb-8">
            <CardContent className="space-y-4">
              {/* Show Premium Coaching badge if user qualifies for discount */}
              {qualifiesForInPersonDiscount && (
                <Badge variant="secondary" className="w-fit">
                  Premium Coaching
                </Badge>
              )}

              {/* Package Items */}
              <div className="space-y-4">
                {packageSummary.map((item) => {
                  // Check if this is an in-person item
                  const isInPersonItem =
                    item.stripeLookupKey ===
                    STRIPE_LOOKUP_KEYS.IN_PERSON_SESSION
                  const hasDiscount =
                    isInPersonItem && qualifiesForInPersonDiscount

                  return (
                    <div
                      key={item.packageId}
                      className="border-l-2 border-amber-500 pl-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground text-base">
                          {item.name.replaceAll('[TEST]', ' ')}
                        </h4>
                        <div className="flex items-center gap-2">
                          {hasDiscount && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700"
                            >
                              50% off
                            </Badge>
                          )}
                          {item.quantity > 1 && (
                            <Badge variant="secondary">x{item.quantity}</Badge>
                          )}
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-muted-foreground text-sm">
                          {item.description.replaceAll(
                            '[TEST ENVIRONMENT]',
                            ' ',
                          )}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Premium Subscription Refund Notice */}
          {shouldShowRefundNotice && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem
                value="subscription-info"
                className="bg-card px-4 rounded-xl"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Info className="size-4 text-blue-500" />
                    <span className="font-medium text-sm text-foreground">
                      About Your Current Subscription
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
                  <p>
                    You currently have an active{' '}
                    <span className="font-medium">
                      {subscriptionData?.subscription?.package?.name}
                    </span>{' '}
                    subscription. When you purchase this coaching package, your
                    current premium subscription will be automatically refunded
                    for the unused period and replaced with this personalized
                    coaching subscription.
                  </p>
                  <p>
                    Your coaching subscription includes all premium features
                    plus direct access to your trainer.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Terms Agreement & Checkout */}
          <div className="space-y-3">
            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-3 my-6">
              <Checkbox
                id="terms-agreement"
                checked={hasAgreedToTerms}
                onCheckedChange={(checked) => {
                  setHasAgreedToTerms(checked === true)
                  if (checked === true) {
                    setShowTermsError(false)
                  }
                }}
                className={cn('mt-1', showTermsError && 'border-destructive')}
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
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="size-4" />
                <span>Please agree to the terms and conditions to proceed</span>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleCheckoutClick}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
              className="w-full"
              iconStart={<CreditCard />}
            >
              Proceed to Checkout
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
          <div className="text-center space-y-2 mt-12">
            <p className="text-sm text-muted-foreground">
              Secure payment powered by Stripe
            </p>
            <div className="flex justify-center flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="size-3" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="size-3" />
                <span>All Cards Accepted</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="size-3" />
                <span>Buyer Protection</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              Having issues? Contact {trainerName} directly or email{' '}
              <a
                href="mailto:support@hypro.app"
                className="text-primary hover:text-primary/80 underline"
              >
                support@hypro.app
              </a>
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
