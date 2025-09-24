'use client'

import { useEffect, useState } from 'react'

import { getStripePriceData } from '@/actions/stripe-actions'

// Stripe price IDs for each offer - REPLACE WITH YOUR REAL PRICE IDS
const OFFER_PRICE_IDS = {
  'coaching-combo': process.env.NEXT_PUBLIC_STRIPE_PRICE_COACHING_COMBO!,
  'workout-plan': process.env.NEXT_PUBLIC_STRIPE_PRICE_WORKOUT_PLAN!,
  'meal-plan': process.env.NEXT_PUBLIC_STRIPE_PRICE_MEAL_PLAN!,
  'in-person': process.env.NEXT_PUBLIC_STRIPE_PRICE_IN_PERSON_SESSION!,
} as const

// Country to currency mapping
const COUNTRY_CURRENCY = {
  NO: 'NOK',
  SE: 'SEK',
  DK: 'DKK',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  US: 'USD',
  CA: 'CAD',
} as const

interface OfferPrices {
  country: string
  currency: string
  prices: Record<string, string | null>
  isLoading: boolean
}

export function useOfferPrices(): OfferPrices {
  const [userCountry, setUserCountry] = useState<string>()
  const [data, setData] = useState<OfferPrices>({
    country: 'US',
    currency: 'USD',
    prices: {},
    isLoading: true,
  })

  // Exact method from Medium article
  const fetchUserCountry = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      const userIP = data.ip

      const countryResponse = await fetch(`https://ipapi.co/${userIP}/country/`)
      const country = await countryResponse.text()

      setUserCountry(country.trim().toUpperCase())
    } catch (error) {
      console.error('Error fetching user country:', error)
      setUserCountry('US') // Fallback
    }
  }

  // Fetch prices based on detected country
  const fetchPrices = async (country: string) => {
    const currency =
      COUNTRY_CURRENCY[country as keyof typeof COUNTRY_CURRENCY] || 'USD'

    const offers = await Promise.all(
      Object.entries(OFFER_PRICE_IDS).map(async ([offerId, priceId]) => {
        try {
          const priceData = await getStripePriceData(priceId)
          if (!priceData) return { offerId, price: null }

          // Get localized price if available
          const currencyOptions = priceData.price.currency_options
          if (currencyOptions?.[currency.toLowerCase()]) {
            const amount = currencyOptions[currency.toLowerCase()].unit_amount
            const localPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
            }).format(amount / 100)

            return { offerId, price: localPrice }
          }

          // Fallback to primary price
          return { offerId, price: priceData.formatted.primary }
        } catch {
          return { offerId, price: null }
        }
      }),
    )

    setData({
      country,
      currency,
      prices: Object.fromEntries(offers.map((o) => [o.offerId, o.price])),
      isLoading: false,
    })
  }

  useEffect(() => {
    fetchUserCountry()
  }, []) // Fetch user country once when component mounts

  useEffect(() => {
    if (userCountry) {
      fetchPrices(userCountry)
    }
  }, [userCountry])

  return data
}
