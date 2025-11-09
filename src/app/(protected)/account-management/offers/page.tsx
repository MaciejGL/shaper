'use client'

import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getStripePriceData } from '@/actions/stripe-actions'
import { CoachingServiceTerms } from '@/components/subscription/coaching-service-terms'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { cn } from '@/lib/utils'

interface PriceInfo {
  lookupKey: string
  priceId: string | null
  formattedPrice: string | null
  interval: string | null
}

export default function OffersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirectUrl')
  const { user } = useUser()

  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [monthlyPrice, setMonthlyPrice] = useState<PriceInfo | null>(null)
  const [yearlyPrice, setYearlyPrice] = useState<PriceInfo | null>(null)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useCurrentSubscription(user?.id)

  const isLoading = isLoadingSubscription || isLoadingPrices
  const hasPremium = subscriptionData?.hasPremiumAccess

  // Fetch Stripe prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoadingPrices(true)

        const [monthlyData, yearlyData] = await Promise.all([
          getStripePriceData(STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY),
          getStripePriceData(STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY),
        ])

        if (monthlyData) {
          setMonthlyPrice({
            lookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_MONTHLY,
            priceId: monthlyData.price.id,
            formattedPrice: monthlyData.formatted.primary,
            interval: monthlyData.price.recurring?.interval || null,
          })
        }

        if (yearlyData) {
          setYearlyPrice({
            lookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_YEARLY,
            priceId: yearlyData.price.id,
            formattedPrice: yearlyData.formatted.primary,
            interval: yearlyData.price.recurring?.interval || null,
          })
        }
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      } finally {
        setIsLoadingPrices(false)
      }
    }

    fetchPrices()
  }, [])

  const handleSubscribe = async (lookupKey: string) => {
    if (!user?.id) return

    setIsSubscribing(true)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          lookupKey,
          returnUrl: redirectUrl
            ? `${window.location.origin}${redirectUrl}`
            : `${window.location.origin}/fitspace/my-plans`,
          cancelUrl: `${window.location.origin}/account-management/offers${redirectUrl ? `?redirectUrl=${encodeURIComponent(redirectUrl)}` : ''}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Subscription error:', error)
      setIsSubscribing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="h-96 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (redirectUrl ? router.push(redirectUrl) : router.back())}
        iconStart={<ArrowLeft />}
      >
        Back
      </Button>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
          <Sparkles className="size-4" />
          7-Day Free Trial
        </div>
        <h1 className="text-4xl font-bold">Unlock Premium Features</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start your 7-day free trial and get unlimited access to premium
          training plans, advanced analytics, and exclusive content.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        {monthlyPrice && (
          <Card className={cn('relative')}>
            <CardHeader>
              <CardTitle className="text-2xl">Monthly</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {monthlyPrice.formattedPrice || '$9.99'}
                  <span className="text-lg font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Billed monthly, cancel anytime
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {[
                  'Unlimited premium training plans',
                  'Advanced workout analytics',
                  'Exercise video library',
                  'Progress tracking & PRs',
                  'Meal planning tools',
                  'Priority support',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="size-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                onClick={() => handleSubscribe(monthlyPrice.lookupKey)}
                disabled={isSubscribing || hasPremium}
                loading={isSubscribing}
              >
                {hasPremium ? 'Already Subscribed' : 'Start Free Trial'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                7-day free trial, then {monthlyPrice.formattedPrice || '$9.99'}
                /month. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        )}

        {yearlyPrice && (
          <Card className={cn('relative border-primary')}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
              Best Value
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Yearly</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {yearlyPrice.formattedPrice || '$99'}
                  <span className="text-lg font-normal text-muted-foreground">
                    /year
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Save 17% compared to monthly
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {[
                  'Everything in Monthly',
                  '2 months free (17% savings)',
                  'Priority feature access',
                  'Exclusive yearly content',
                  'Annual training review',
                  'VIP community access',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="size-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant="default"
                onClick={() => handleSubscribe(yearlyPrice.lookupKey)}
                disabled={isSubscribing || hasPremium}
                loading={isSubscribing}
              >
                {hasPremium ? 'Already Subscribed' : 'Start Free Trial'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                7-day free trial, then {yearlyPrice.formattedPrice || '$99'}
                /year. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-center space-y-4 pt-8">
        <h3 className="text-lg font-semibold">What you get with Premium:</h3>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="text-3xl">🏋️</div>
            <h4 className="font-medium">Unlimited Plans</h4>
            <p className="text-sm text-muted-foreground">
              Access hundreds of expertly designed training programs
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">📊</div>
            <h4 className="font-medium">Advanced Analytics</h4>
            <p className="text-sm text-muted-foreground">
              Track your progress with detailed insights and charts
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🎯</div>
            <h4 className="font-medium">Personalized Content</h4>
            <p className="text-sm text-muted-foreground">
              Get recommendations tailored to your fitness goals
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          By subscribing, you agree to our{' '}
          <button
            onClick={() => setShowTermsModal(true)}
            className="text-primary hover:underline"
          >
            Terms of Service
          </button>
        </p>
        <p>No commitment. Cancel anytime before trial ends.</p>
      </div>

      <CoachingServiceTerms
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  )
}
