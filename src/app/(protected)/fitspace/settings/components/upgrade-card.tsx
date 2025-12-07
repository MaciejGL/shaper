'use client'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useStripePrice } from '@/hooks/use-stripe-price'

import { PREMIUM_BENEFITS } from '@/constants/product-copy'

import { PremiumBenefitsList } from './premium-benefits-list'

interface Package {
  id: string
  name: string
  duration: string
  description?: string
  stripeLookupKey?: string | null
}

interface UpgradeCardProps {
  monthlyPackage?: Package
  yearlyPackage?: Package
  isUpgrading: boolean
  onUpgrade: (packageId?: string) => void
}

function PackagePriceDisplay({
  stripeLookupKey,
}: {
  stripeLookupKey?: string | null
}) {
  const { usdPrice, isLoading, error } = useStripePrice(stripeLookupKey || null)

  if (isLoading) {
    return (
      <div className="text-3xl font-semibold text-gray-400 masked-placeholder-text">
        Loading...
      </div>
    )
  }

  if (error || !usdPrice) {
    return (
      <div className="text-3xl font-semibold text-gray-400">
        Price unavailable
      </div>
    )
  }

  return <div className="text-3xl font-semibold">{usdPrice}</div>
}

export function UpgradeCard({
  monthlyPackage,
  yearlyPackage,
  isUpgrading,
  onUpgrade,
}: UpgradeCardProps) {
  return (
    <div className="space-y-6">
      {/* Benefits Overview */}
      <div className="bg-card-on-card p-6 rounded-lg text-white mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="size-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shrink-0 self-start">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h5 className="text-lg font-bold">Premium Features</h5>
        </div>
        <PremiumBenefitsList benefits={PREMIUM_BENEFITS} variant="secondary" />
      </div>

      {/* Pricing Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-8 mt-8">
        {/* Monthly Plan */}
        {monthlyPackage && (
          <Card className="h-full bg-card-on-card rounded-lg text-white mb-6 flex flex-col relative outline-1 outline-blue-500 bg-gradient-to-br from-blue-500/5 to-blue-600/10 hover:from-blue-500/10 hover:to-blue-600/15 transition-all">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                Most Flexible
              </div>
            </div>
            <CardContent className="text-center grow flex-center flex-col pt-6">
              <h6 className="text-lg font-medium text-center">Monthly</h6>
              <PackagePriceDisplay
                stripeLookupKey={monthlyPackage.stripeLookupKey}
              />
              <p className="text-xs text-blue-400 mt-2">
                Cancel anytime, no commitment
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => onUpgrade(monthlyPackage.id)}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                loading={isUpgrading}
              >
                Subscribe Monthly
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Yearly Plan */}
        {yearlyPackage && (
          <Card className="h-full bg-card-on-card rounded-lg text-white mb-6 flex flex-col relative outline-1 outline-amber-500 bg-gradient-to-br from-amber-500/5 to-amber-600/10 hover:from-amber-500/10 hover:to-amber-600/15 transition-all">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                Best Value
              </div>
            </div>
            <CardContent className="text-center grow flex-center flex-col pt-6">
              <h6 className="text-lg font-medium">Yearly</h6>
              <PackagePriceDisplay
                stripeLookupKey={yearlyPackage.stripeLookupKey}
              />
              {monthlyPackage && (
                <div className="text-md text-green-400 font-medium mt-1">
                  3 months free
                </div>
              )}
              <p className="text-xs text-amber-400 mt-2">
                Best price for committed users
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => onUpgrade(yearlyPackage.id)}
                disabled={isUpgrading}
                className="w-full"
                loading={isUpgrading}
                variant="gradient"
              >
                Subscribe Annually
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* No packages available */}
      {!monthlyPackage && !yearlyPackage && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              No subscription packages are currently available.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
