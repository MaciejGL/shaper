'use client'

import { CreditCard, ExternalLink, Lock, Mail } from 'lucide-react'
import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { CoachingServiceTerms } from '@/components/subscription/coaching-service-terms'
import { PromotionalDiscountBanner } from '@/components/subscription/promotional-discount-banner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { usePaymentRules } from '@/hooks/use-payment-rules'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import { FreezeSubscriptionSection } from './freeze-subscription-section/freeze-subscription-section'
import { PremiumPricingSelector } from './premium-pricing-selector'

export function SubscriptionManagementSection() {
  const { user } = useUser()
  const rules = usePaymentRules()
  const { isNativeApp, platform, getExternalOfferToken, openExternalCheckout } =
    useMobileApp()
  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useCurrentSubscription(user?.id)

  const isLoading = isLoadingSubscription
  const hasError = subscriptionError

  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSendingBillingLink, setIsSendingBillingLink] = useState(false)
  const [billingLinkSent, setBillingLinkSent] = useState(false)

  const handleSubscribe = async (lookupKey: string) => {
    if (!user?.id) return

    setIsSubscribing(true)

    try {
      // For Android in-app, get alternative billing token for Google compliance
      const { token: extToken, diagnostics: extDiagnostics } =
        await getExternalOfferToken(lookupKey)

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          lookupKey,
          returnUrl: `${window.location.origin}/account-management`,
          cancelUrl: `${window.location.origin}/account-management`,
          platform: isNativeApp ? platform : undefined,
          extToken,
          extDiagnostics,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      openExternalCheckout(checkoutUrl)
    } catch (error) {
      console.error('Subscription error:', error)
      setIsSubscribing(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          returnUrl: `${window.location.origin}/account-management`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    }
  }

  const handleSendBillingLink = async () => {
    setIsSendingBillingLink(true)
    try {
      const response = await fetch('/api/account/send-access-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'access' }),
      })
      if (response.ok) {
        setBillingLinkSent(true)
      }
    } catch (error) {
      console.error('Failed to send billing link:', error)
    } finally {
      setIsSendingBillingLink(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton count={2} variant="lg" />
      </div>
    )
  }

  if (hasError) {
    return (
      <Card className="bg-card-on-card">
        <CardContent className="py-8 text-center space-y-4">
          <p className="text-muted-foreground">
            Failed to load subscription information
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            Reload Page
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Companion mode: Show simple "Manage your account" section only
  // No subscription details, pricing, or billing UI - just email link to dashboard
  if (!rules.canShowUpgradeUI && !rules.canLinkToPayment) {
    return (
      <Card className="bg-card-on-card">
        <CardContent className="py-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              Manage your Hypertro account
            </h3>
            <p className="text-sm text-muted-foreground">
              You can manage your Hypertro account (profile, security, plan
              details and data) in your browser. We can send you a secure
              sign-in link by email.
            </p>
          </div>

          {billingLinkSent ? (
            <p className="text-sm text-green-600 text-center py-2">
              Link sent to your email
            </p>
          ) : (
            <Button
              onClick={handleSendBillingLink}
              variant="secondary"
              className="w-full"
              iconStart={<Mail />}
              loading={isSendingBillingLink}
              disabled={isSendingBillingLink}
            >
              Send account management link
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            Some features depend on your Hypertro plan. Plans are set up and
            managed outside this app.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getSubscriptionTypeInfo = () => {
    if (!subscriptionData?.subscription) {
      return {
        type: 'None',
        title: 'No Active Subscription',
        description: 'You currently have no active subscription.',
        canUpgrade: true,
      }
    }

    const lookupKey = subscriptionData.subscription.package.stripeLookupKey
    const packageName = subscriptionData.subscription.package.name

    // Check for Premium Coaching subscription
    if (lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING) {
      return {
        type: 'Coaching',
        title: 'Premium Coaching',
        description:
          'Full access to training plans, nutrition plans, and coaching sessions.',
        canUpgrade: true, // Can upgrade to Premium
      }
    }

    // Check for Premium subscription
    if (
      lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY ||
      lookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY
    ) {
      return {
        type: 'Premium',
        title: 'Premium',
        description: 'Premium platform access with enhanced features.',
        canUpgrade: false, // Already the highest tier
      }
    }

    // Default case
    return {
      type: 'Active',
      title: packageName,
      description: 'Active subscription with premium features.',
      canUpgrade: true,
    }
  }

  const getNextBillingInfo = () => {
    if (!subscriptionData?.subscription?.endDate) return null

    const endDate = new Date(subscriptionData.subscription.endDate)
    const now = new Date()

    // Check if subscription is still active
    if (endDate <= now) return null

    const duration = subscriptionData.subscription.package.duration
    const isMonthly = duration === 'MONTHLY'
    const isYearly = duration === 'YEARLY'

    return {
      date: endDate.toLocaleDateString(),
      period: isMonthly ? 'Monthly' : isYearly ? 'Yearly' : duration,
    }
  }

  const subscriptionInfo = getSubscriptionTypeInfo()
  const nextBilling = getNextBillingInfo()
  const hasActiveSubscription = subscriptionData?.hasPremiumAccess
  const hasStripeHistory =
    !!subscriptionData?.subscription?.stripeSubscriptionId
  const promotionalDiscount = subscriptionData?.promotionalDiscount

  return (
    <div className="space-y-6">
      {/* Show current subscription status only if user has active subscription */}
      {hasActiveSubscription ? (
        <>
          {/* Current Subscription Status */}
          <Card className="bg-card-on-card">
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {subscriptionInfo.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        subscriptionData?.status === 'CANCELLED_ACTIVE'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}
                    >
                      {subscriptionData?.status === 'CANCELLED_ACTIVE'
                        ? 'Cancelled'
                        : 'Active'}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {subscriptionInfo.description}
                  </p>

                  {nextBilling && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {subscriptionData?.status === 'CANCELLED_ACTIVE'
                          ? `Access expires: ${nextBilling.date}`
                          : `Next billing: ${nextBilling.date}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subscriptionData?.status === 'CANCELLED_ACTIVE'
                          ? 'Subscription cancelled - no further charges will occur'
                          : `${nextBilling.period} subscription`}
                      </p>
                    </div>
                  )}

                  {subscriptionData?.status === 'TRIAL' &&
                    subscriptionData?.expiresAt && (
                      <p className="text-sm text-muted-foreground">
                        Trial expires:{' '}
                        {new Date(
                          subscriptionData.expiresAt,
                        ).toLocaleDateString()}
                      </p>
                    )}
                </div>
              </div>

              {promotionalDiscount && (
                <PromotionalDiscountBanner
                  discount={promotionalDiscount}
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Freeze Subscription (Premium Yearly only) */}
          {subscriptionData?.subscription?.package?.stripeLookupKey ===
            STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY && <FreezeSubscriptionSection />}

          {/* Manage Billing Button */}
          <div className="flex flex-col gap-2">
            {rules.canLinkToPayment ? (
              <Button
                onClick={handleManageSubscription}
                variant="secondary"
                className="w-full"
                iconStart={<CreditCard />}
                iconEnd={<ExternalLink />}
              >
                Manage Billing & Payment
              </Button>
            ) : billingLinkSent ? (
              <p className="text-sm text-green-600 text-center py-2">
                Account info sent to your email
              </p>
            ) : (
              <Button
                onClick={handleSendBillingLink}
                variant="secondary"
                className="w-full"
                iconStart={<Mail />}
                loading={isSendingBillingLink}
                disabled={isSendingBillingLink}
              >
                Email Me My Account Info
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* No subscription - show upgrade options or companion mode message */}
          <div className="space-y-6">
            {rules.canShowUpgradeUI ? (
              <PremiumPricingSelector
                hasPremium={subscriptionData?.hasPremiumAccess}
                hasUsedTrial={subscriptionData?.hasUsedTrial}
                isSubscribing={isSubscribing}
                onSubscribe={handleSubscribe}
                showTrialBadge={true}
                showTermsLink={true}
                onShowTerms={() => setShowTermsModal(true)}
              />
            ) : (
              <Card className="bg-card-on-card">
                <CardContent className="py-8 text-center space-y-4">
                  <Lock className="size-8 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {rules.premiumGateText}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Show billing portal access if user has previous Stripe subscription */}
            {hasStripeHistory && (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="w-full"
                  iconStart={<CreditCard />}
                  iconEnd={<ExternalLink />}
                >
                  Manage Payment Methods
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Terms Modal */}
      <CoachingServiceTerms
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setShowTermsModal(false)}
        serviceType="premium"
        packages={[]}
        readOnly={true}
      />
    </div>
  )
}
