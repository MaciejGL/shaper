'use client'

import { useState } from 'react'

import { ServiceType } from '@/generated/prisma/client'

interface BundleOfferPageProps {
  offer: {
    id: string
    token: string
    trainerId: string
    clientEmail: string
    personalMessage: string | null
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
    items: {
      id: string
      quantity: number
      package: {
        id: string
        name: string
        description: string | null
        stripePriceId: string | null
        services: {
          serviceType: ServiceType
          quantity: number
        }[]
      }
    }[]
  }
  bundlePricing: {
    items: {
      packageId: string
      packageName: string
      quantity: number
      unitPrice: {
        usd: number
        eur: number
        nok: number
        type: 'one-time' | 'monthly'
      }
      totalPrice: {
        usd: number
        eur: number
        nok: number
        type: 'one-time' | 'monthly'
      }
      services: { serviceType: string }[]
    }[]
    totals: {
      oneTime: { usd: number; eur: number; nok: number }
      monthly: { usd: number; eur: number; nok: number }
    }
    hasOneTime: boolean
    hasMonthly: boolean
    packageCount: number
  }
  clientEmail: string
}

export function OfferPage({
  offer,
  bundlePricing,
  clientEmail,
}: BundleOfferPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<
    'USD' | 'EUR' | 'NOK'
  >('USD')

  const trainerName = offer.trainer.profile?.firstName
    ? `${offer.trainer.profile.firstName} ${offer.trainer.profile.lastName || ''}`.trim()
    : offer.trainer.name || 'Your Trainer'

  const currencySymbol =
    selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : 'kr'

  const currencyKey = selectedCurrency.toLowerCase() as 'usd' | 'eur' | 'nok'

  const oneTimeTotal = bundlePricing.totals.oneTime[currencyKey]
  const monthlyTotal = bundlePricing.totals.monthly[currencyKey]

  const handleProceedToCheckout = async () => {
    setIsLoading(true)

    try {
      // Create Stripe checkout session for bundle
      const response = await fetch('/api/stripe/create-trainer-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerToken: offer.token,
          clientEmail,
          currency: selectedCurrency,
          // Return URLs for web checkout
          successUrl: `${window.location.origin}/offer/${offer.token}/success`,
          cancelUrl: window.location.href,
        }),
      })

      const { checkoutUrl, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  const serviceLabels: Record<ServiceType, string> = {
    MEAL_PLAN: '🍽️ Custom Meal Plan',
    TRAINING_PLAN: '💪 Personalized Workout Plan',
    COACHING: '🎯 Personal Coaching Sessions',
    IN_PERSON_MEETING: '🤝 In-Person Training',
    PREMIUM_ACCESS: '⭐ Premium Platform Access',
  }

  const formatPrice = (amount: number) => {
    if (selectedCurrency === 'NOK') {
      return `${amount.toFixed(2)} ${currencySymbol}`
    }
    return `${currencySymbol}${amount.toFixed(2)}`
  }

  const getBundleTitle = () => {
    if (bundlePricing.packageCount === 1) {
      return offer.items[0].quantity > 1
        ? `${offer.items[0].quantity}× ${offer.items[0].package.name}`
        : offer.items[0].package.name
    }
    return `Training Bundle (${bundlePricing.packageCount} packages)`
  }

  const getTotalPriceText = () => {
    if (bundlePricing.hasOneTime && bundlePricing.hasMonthly) {
      return `${formatPrice(oneTimeTotal)} + ${formatPrice(monthlyTotal)}/month`
    } else if (bundlePricing.hasOneTime) {
      return formatPrice(oneTimeTotal)
    } else if (bundlePricing.hasMonthly) {
      return `${formatPrice(monthlyTotal)}/month`
    }
    return formatPrice(0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {bundlePricing.packageCount > 1
              ? 'Training Bundle'
              : 'Training Offer'}
          </h1>
          <p className="text-gray-600">from {trainerName}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Trainer Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            {offer.trainer.image ? (
              <img
                src={offer.trainer.image}
                alt={trainerName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-xl">
                  {trainerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {trainerName}
              </h2>
              {offer.trainer.profile?.credentials &&
                offer.trainer.profile.credentials.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {offer.trainer.profile.credentials.join(', ')}
                  </p>
                )}
            </div>
          </div>

          {offer.trainer.profile?.bio && (
            <p className="text-gray-700 mb-4">{offer.trainer.profile.bio}</p>
          )}

          {offer.trainer.profile?.specialization &&
            offer.trainer.profile.specialization.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {offer.trainer.profile.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
        </div>

        {/* Personal Message */}
        {offer.personalMessage && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-blue-800">
              <span className="font-medium">
                Personal message from {trainerName}:
              </span>
            </p>
            <p className="text-blue-700 mt-1">{offer.personalMessage}</p>
          </div>
        )}

        {/* Bundle Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {getBundleTitle()}
          </h3>

          {/* Package Items */}
          <div className="space-y-6 mb-6">
            {offer.items.map((item, itemIndex) => (
              <div key={item.id} className="border-l-2 border-blue-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {item.quantity > 1 ? `${item.quantity}× ` : ''}
                    {item.package.name}
                  </h4>
                  <span className="text-sm text-green-600 font-medium">
                    {formatPrice(
                      bundlePricing.items[itemIndex]?.totalPrice[currencyKey] ||
                        0,
                    )}
                    {bundlePricing.items[itemIndex]?.totalPrice.type ===
                      'monthly' && '/month'}
                  </span>
                </div>

                {item.package.description && (
                  <p className="text-gray-600 text-sm mb-3">
                    {item.package.description}
                  </p>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">
                    What's included:
                  </p>
                  {item.package.services.map((service, serviceIndex) => (
                    <div
                      key={serviceIndex}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {serviceLabels[service.serviceType]}
                        {service.quantity > 1 && ` (${service.quantity}x)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Currency Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Currency:
            </label>
            <div className="flex space-x-4">
              {(['USD', 'EUR', 'NOK'] as const).map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-4 py-2 rounded-md border ${
                    selectedCurrency === currency
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Bundle Pricing Summary */}
          <div className="text-center py-6 border-t">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {getTotalPriceText()}
            </div>
            <div className="text-gray-600 space-y-1">
              {bundlePricing.hasOneTime && bundlePricing.hasMonthly ? (
                <div>
                  <p>One-time payment: {formatPrice(oneTimeTotal)}</p>
                  <p>Monthly subscription: {formatPrice(monthlyTotal)}/month</p>
                </div>
              ) : bundlePricing.hasOneTime ? (
                <p>
                  One-time payment for {bundlePricing.packageCount} package
                  {bundlePricing.packageCount > 1 ? 's' : ''}
                </p>
              ) : (
                <p>Monthly subscription bundle</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProceedToCheckout}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </span>
          ) : (
            `Proceed to Checkout - ${getTotalPriceText()}`
          )}
        </button>

        {/* Trust indicators */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Secure payment powered by Stripe
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <span>🔒 SSL Encrypted</span>
            <span>💳 All Cards Accepted</span>
            <span>🛡️ Buyer Protection</span>
          </div>
        </div>

        {/* Bundle Info */}
        {bundlePricing.hasOneTime && bundlePricing.hasMonthly && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-amber-400 text-xl mr-3">⚠️</div>
              <div>
                <h4 className="font-medium text-amber-800 mb-1">
                  Mixed Payment Bundle
                </h4>
                <p className="text-sm text-amber-700">
                  This bundle contains both one-time purchases and monthly
                  subscriptions. You'll be charged {formatPrice(oneTimeTotal)}{' '}
                  today and {formatPrice(monthlyTotal)} monthly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>
            Having issues? Contact {trainerName} directly or email
            support@hypertro.com
          </p>
        </div>
      </div>
    </div>
  )
}
