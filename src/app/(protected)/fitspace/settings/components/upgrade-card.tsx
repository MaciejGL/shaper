'use client'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useStripePrice } from '@/hooks/use-stripe-price'

import { PremiumBenefitsList, UPGRADE_BENEFITS } from './premium-benefits-list'

interface Package {
  id: string
  name: string
  duration: string
  description?: string
  stripePriceId?: string | null
}

interface UpgradeCardProps {
  monthlyPackage?: Package
  yearlyPackage?: Package
  isUpgrading: boolean
  onUpgrade: (packageId?: string) => void
}

function PackagePriceDisplay({
  stripePriceId,
}: {
  stripePriceId?: string | null
}) {
  const { usdPrice, isLoading, error } = useStripePrice(stripePriceId || null)

  if (isLoading) {
    return (
      <div className="text-3xl font-semibold text-gray-400">Loading...</div>
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
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h5 className="text-lg font-bold">Premium Features</h5>
        </div>
        <PremiumBenefitsList benefits={UPGRADE_BENEFITS} variant="secondary" />
      </div>

      {/* Pricing Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Plan */}
        {monthlyPackage && (
          <Card className="h-full bg-card-on-card rounded-lg text-white mb-6 flex flex-col">
            <CardContent className="text-center grow flex-center flex-col">
              <h6 className="text-lg font-medium text-center">Monthly</h6>
              <PackagePriceDisplay
                stripePriceId={monthlyPackage.stripePriceId}
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => onUpgrade(monthlyPackage.id)}
                disabled={isUpgrading}
                className="w-full"
                loading={isUpgrading}
                variant="default"
              >
                Subscribe Monthly
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Yearly Plan */}
        {yearlyPackage && (
          <Card className="h-full bg-card-on-card rounded-lg text-white mb-6 flex flex-col mt-2 outline-1 outline-amber-500 bg-gradient-to-br from-amber-500/2 to-amber-600/7">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Best Value
              </div>
            </div>
            <CardContent className="text-center grow flex-center flex-col">
              <h6 className="text-lg font-medium">Yearly</h6>
              <PackagePriceDisplay
                stripePriceId={yearlyPackage.stripePriceId}
              />
              {monthlyPackage && (
                <div className="text-xs text-green-600 font-medium mt-1">
                  Save with annual billing
                </div>
              )}
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
