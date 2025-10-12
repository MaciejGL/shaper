import { useEffect, useState } from 'react'

import { getStripePriceData } from '@/actions/stripe-actions'

interface StripePriceData {
  price: {
    id: string
    currency: string
    unit_amount: number
    currency_options?: Record<
      string,
      {
        unit_amount: number
        tax_behavior?: string
      }
    >
    type: string
    recurring?: {
      interval: string
      interval_count: number
    }
    product: string
    active: boolean
    metadata: Record<string, string>
  }
  formatted: {
    usd: string | null
    primary: string
  }
}

export function useStripePrice(lookupKey: string | null) {
  const [data, setData] = useState<StripePriceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lookupKey) {
      setData(null)
      setIsLoading(false)
      setError(null)
      return
    }

    const fetchPrice = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const priceData = await getStripePriceData(lookupKey)
        setData(priceData)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch price data',
        )
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrice()
  }, [lookupKey])

  return {
    priceData: data,
    isLoading,
    error,
    refetch: () => {
      if (lookupKey) {
        const fetchPrice = async () => {
          setIsLoading(true)
          try {
            const priceData = await getStripePriceData(lookupKey)
            setData(priceData)
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Failed to fetch price data',
            )
          } finally {
            setIsLoading(false)
          }
        }
        fetchPrice()
      }
    },
    // Helper to get formatted USD price
    usdPrice: data?.formatted?.usd,
    // Helper to get primary currency price
    primaryPrice: data?.formatted?.primary,
    // Helper to check if multi-currency is available
    hasMultipleCurrencies:
      data?.price?.currency_options &&
      Object.keys(data.price.currency_options).length > 0,
  }
}
