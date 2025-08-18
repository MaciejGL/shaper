'use client'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/types/subscription'

import { PremiumBenefitsList, UPGRADE_BENEFITS } from './premium-benefits-list'

interface UpgradeCardProps {
  premiumPackage?: {
    priceNOK: number
  }
  isUpgrading: boolean
  onUpgrade: () => void
}

export function UpgradeCard({
  premiumPackage,
  isUpgrading,
  onUpgrade,
}: UpgradeCardProps) {
  return (
    <div className="space-y-6">
      <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Upgrade to Premium
      </h4>

      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 p-8 rounded-lg text-white">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-2xl font-bold">Premium Features</h5>
              {premiumPackage && (
                <p className="text-white/80 text-sm">
                  {formatPrice(premiumPackage.priceNOK)}/month
                </p>
              )}
            </div>
          </div>

          {/* Benefits List */}
          <div className="mb-8">
            <PremiumBenefitsList benefits={UPGRADE_BENEFITS} variant="white" />
          </div>

          {/* Upgrade Button */}
          <Button
            onClick={onUpgrade}
            disabled={isUpgrading || !premiumPackage}
            variant="outline"
            className="w-full h-12 text-white border-white/30 hover:bg-white/10 disabled:opacity-50"
          >
            {isUpgrading
              ? 'Upgrading...'
              : premiumPackage
                ? `Upgrade to Premium - ${formatPrice(premiumPackage.priceNOK)}/month`
                : 'Loading...'}
          </Button>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>
    </div>
  )
}
