'use client'

import { useState } from 'react'

import { ServiceType } from '@/generated/prisma/client'

interface OfferPageProps {
  offer: {
    id: string
    token: string
    trainerId: string
    clientEmail: string
    quantity: number
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
  }
  prices: {
    usd: number
    eur: number
    nok: number
    type: 'one-time' | 'monthly'
  }
  clientEmail: string
}

export function OfferPage({ offer, prices, clientEmail }: OfferPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<
    'USD' | 'EUR' | 'NOK'
  >('USD')

  const trainerName = offer.trainer.profile?.firstName
    ? `${offer.trainer.profile.firstName} ${offer.trainer.profile.lastName || ''}`.trim()
    : offer.trainer.name || 'Your Trainer'

  const basePrice = prices[
    selectedCurrency.toLowerCase() as keyof typeof prices
  ] as number

  // Calculate total price with quantity (only for one-time purchases)
  const currentPrice =
    prices.type === 'one-time' ? basePrice * offer.quantity : basePrice
  const currencySymbol =
    selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : 'kr'

  const handleProceedToCheckout = async () => {
    setIsLoading(true)

    try {
      // Create Stripe checkout session with trainer assignment
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Training Offer</h1>
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

        {/* Package Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {offer.quantity > 1 ? `${offer.quantity}× ` : ''}
            {offer.package.name}
          </h3>

          {offer.package.description && (
            <p className="text-gray-700 mb-4">{offer.package.description}</p>
          )}

          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-gray-900">What's included:</h4>
            {offer.package.services.map((service, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">
                  {serviceLabels[service.serviceType]}
                  {service.quantity > 1 && ` (${service.quantity}x)`}
                </span>
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

          {/* Pricing */}
          <div className="text-center py-6 border-t">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {currencySymbol}
              {currentPrice.toFixed(2)}
              {prices.type === 'monthly' && (
                <span className="text-lg text-gray-600">/month</span>
              )}
            </div>
            <p className="text-gray-600">
              {prices.type === 'one-time' ? (
                offer.quantity > 1 ? (
                  <>
                    One-time payment for {offer.quantity} sessions
                    <br />
                    <span className="text-sm text-gray-500">
                      ({currencySymbol}
                      {basePrice.toFixed(2)} × {offer.quantity})
                    </span>
                  </>
                ) : (
                  'One-time payment'
                )
              ) : (
                'Monthly subscription'
              )}
            </p>
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
            `Proceed to Checkout - ${currencySymbol}${currentPrice.toFixed(2)}`
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
