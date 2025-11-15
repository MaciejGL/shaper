'use client'

import { Check, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getStripePriceData } from '@/actions/stripe-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { cn } from '@/lib/utils'

import { PREMIUM_BENEFITS } from '../../fitspace/settings/components/premium-benefits-list'

interface PriceInfo {
  lookupKey: string
  priceId: string | null
  formattedPrice: string | null
  interval: string | null
}

interface PremiumPricingSelectorProps {
  hasPremium?: boolean
  hasUsedTrial?: boolean
  isSubscribing?: boolean
  onSubscribe: (lookupKey: string) => Promise<void>
  showTrialBadge?: boolean
  showTermsLink?: boolean
  onShowTerms?: () => void
}

export function PremiumPricingSelector({
  hasPremium = false,
  hasUsedTrial = false,
  isSubscribing = false,
  onSubscribe,
  showTrialBadge = true,
  showTermsLink = true,
  onShowTerms,
}: PremiumPricingSelectorProps) {
  const [isYearly, setIsYearly] = useState(true)
  const [monthlyPrice, setMonthlyPrice] = useState<PriceInfo | null>(null)
  const [yearlyPrice, setYearlyPrice] = useState<PriceInfo | null>(null)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

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

  const selectedPrice = isYearly ? yearlyPrice : monthlyPrice
  const selectedLookupKey = selectedPrice?.lookupKey || ''

  const calculateMonthlyEquivalent = (yearlyTotal: number) => {
    return (yearlyTotal / 12).toFixed(2)
  }

  const getYearlyTotal = (formattedPrice: string) => {
    const match = formattedPrice.match(/[\d,]+/)
    if (!match) return 0
    return parseFloat(match[0].replace(',', ''))
  }

  const calculateSavingsPercentage = () => {
    if (!monthlyPrice?.formattedPrice || !yearlyPrice?.formattedPrice) {
      return null
    }

    const monthlyTotal = getYearlyTotal(monthlyPrice.formattedPrice)
    const yearlyTotal = getYearlyTotal(yearlyPrice.formattedPrice)
    const yearlyAtMonthlyRate = monthlyTotal * 12

    if (yearlyAtMonthlyRate === 0) return null

    const savings =
      ((yearlyAtMonthlyRate - yearlyTotal) / yearlyAtMonthlyRate) * 100
    return Math.round(savings)
  }

  if (isLoadingPrices) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-1/2 mx-auto" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showTrialBadge && !hasUsedTrial && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Sparkles className="size-4" />
            7-Day Free Trial
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <Label
          htmlFor="plan-toggle"
          className={cn(
            'text-base font-medium transition-colors cursor-pointer',
            !isYearly ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          Monthly
        </Label>
        <Switch
          id="plan-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
          size="lg"
        />
        <Label
          htmlFor="plan-toggle"
          className={cn(
            'text-base font-medium transition-colors cursor-pointer',
            isYearly ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          Yearly
        </Label>
      </div>

      <div className="max-w-md mx-auto">
        {selectedPrice && (
          <Card className={cn('relative', isYearly && 'border-primary')}>
            {isYearly && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                Best Value
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">
                {isYearly ? 'Yearly' : 'Monthly'}
              </CardTitle>
              <div className="space-y-2">
                {isYearly && yearlyPrice ? (
                  <>
                    <div className="text-3xl font-bold">
                      NOK{' '}
                      {calculateMonthlyEquivalent(
                        getYearlyTotal(yearlyPrice.formattedPrice || '1149'),
                      )}
                      <span className="text-lg font-normal text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Billed annually {yearlyPrice.formattedPrice}/year
                    </p>
                    {calculateSavingsPercentage() && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Save {calculateSavingsPercentage()}% compared to monthly
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold">
                      {monthlyPrice?.formattedPrice || 'NOK 149.00'}
                      <span className="text-lg font-normal text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Billed monthly, cancel anytime
                    </p>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {PREMIUM_BENEFITS.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="size-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant="default"
                onClick={() => onSubscribe(selectedLookupKey)}
                disabled={isSubscribing || hasPremium}
                loading={isSubscribing}
              >
                {hasPremium
                  ? 'Already Subscribed'
                  : hasUsedTrial
                    ? 'Subscribe Now'
                    : 'Start Free Trial'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {hasUsedTrial
                  ? isYearly && yearlyPrice
                    ? `${yearlyPrice.formattedPrice}/year. Cancel anytime.`
                    : `${monthlyPrice?.formattedPrice || 'NOK 149.00'}/month. Cancel anytime.`
                  : isYearly && yearlyPrice
                    ? `7-day free trial, then ${yearlyPrice.formattedPrice}/year. Cancel anytime.`
                    : `7-day free trial, then ${monthlyPrice?.formattedPrice || 'NOK 149.00'}/month. Cancel anytime.`}
              </p>
            </CardContent>
          </Card>
        )}

        {showTermsLink && (
          <div className="text-center text-sm text-muted-foreground space-y-2 pt-6">
            <p>
              By subscribing, you agree to our{' '}
              <button
                onClick={onShowTerms}
                className="text-primary hover:underline"
              >
                Terms of Service
              </button>
            </p>
            {!hasUsedTrial && (
              <p>No commitment. Cancel anytime before trial ends.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
