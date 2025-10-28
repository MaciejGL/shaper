'use client'

import { useEffect, useState } from 'react'

import { getStripePriceData } from '@/actions/stripe-actions'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

// Map offer slugs to lookup keys
const OFFER_LOOKUP_KEY_MAP = {
  'premium-coaching': STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
  'workout-plan': STRIPE_LOOKUP_KEYS.WORKOUT_PLAN,
  'nutrition-plan': STRIPE_LOOKUP_KEYS.NUTRITION_PLAN,
  'in-person': STRIPE_LOOKUP_KEYS.IN_PERSON_SESSION,
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
      Object.entries(OFFER_LOOKUP_KEY_MAP).map(async ([offerId, lookupKey]) => {
        try {
          const priceData = await getStripePriceData(lookupKey)
          if (!priceData) return { offerId, price: null }

          // Use formatted prices from Stripe
          const formattedPrice =
            priceData.formatted[
              currency.toLowerCase() as keyof typeof priceData.formatted
            ] || priceData.formatted.primary

          return { offerId, price: formattedPrice }
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
