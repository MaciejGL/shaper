/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getMultipleStripePrices,
  getStripePricingInfo,
} from '@/lib/stripe/pricing-utils'

// Import mocked modules
const mockStripe = await import('@/lib/stripe/stripe')

describe('Stripe Pricing Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStripePricingInfo', () => {
    it('should return pricing info for one-time payment', async () => {
      // Arrange
      const mockPrice = {
        id: 'price_123',
        unit_amount: 5000,
        currency: 'usd',
        type: 'one_time',
        recurring: null,
      }
      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue(
        mockPrice as any,
      )

      // Act
      const result = await getStripePricingInfo('price_123')

      // Assert
      expect(result).toEqual({
        amount: 5000,
        currency: 'USD',
        type: 'one-time',
        recurring: null,
      })
      expect(mockStripe.stripe.prices.retrieve).toHaveBeenCalledWith(
        'price_123',
      )
    })

    it('should return pricing info for recurring subscription', async () => {
      // Arrange
      const mockPrice = {
        id: 'price_456',
        unit_amount: 1500,
        currency: 'eur',
        type: 'recurring',
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
      }
      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue(
        mockPrice as any,
      )

      // Act
      const result = await getStripePricingInfo('price_456')

      // Assert
      expect(result).toEqual({
        amount: 1500,
        currency: 'EUR',
        type: 'subscription',
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
      })
    })

    it('should handle zero amount gracefully', async () => {
      // Arrange
      const mockPrice = {
        id: 'price_free',
        unit_amount: null,
        currency: 'usd',
        type: 'one_time',
        recurring: null,
      }
      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue(
        mockPrice as any,
      )

      // Act
      const result = await getStripePricingInfo('price_free')

      // Assert
      expect(result).toEqual({
        amount: 0,
        currency: 'USD',
        type: 'one-time',
        recurring: null,
      })
    })

    it('should return null when Stripe API fails', async () => {
      // Arrange
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      vi.mocked(mockStripe.stripe.prices.retrieve).mockRejectedValue(
        new Error('Price not found'),
      )

      // Act
      const result = await getStripePricingInfo('invalid_price')

      // Assert
      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching Stripe price:',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('getMultipleStripePrices', () => {
    it('should fetch multiple prices successfully', async () => {
      // Arrange
      const mockPrices = [
        {
          id: 'price_1',
          unit_amount: 1000,
          currency: 'usd',
          type: 'one_time',
          recurring: null,
        },
        {
          id: 'price_2',
          unit_amount: 2000,
          currency: 'eur',
          type: 'recurring',
          recurring: { interval: 'month', interval_count: 1 },
        },
      ]

      vi.mocked(mockStripe.stripe.prices.retrieve)
        .mockResolvedValueOnce(mockPrices[0] as any)
        .mockResolvedValueOnce(mockPrices[1] as any)

      // Act
      const result = await getMultipleStripePrices(['price_1', 'price_2'])

      // Assert
      expect(result).toEqual({
        price_1: {
          amount: 1000,
          currency: 'USD',
          type: 'one-time',
          recurring: null,
        },
        price_2: {
          amount: 2000,
          currency: 'EUR',
          type: 'subscription',
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
        },
      })
    })

    it('should handle mix of successful and failed price fetches', async () => {
      // Arrange
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const mockPrice = {
        id: 'price_1',
        unit_amount: 1000,
        currency: 'usd',
        type: 'one_time',
        recurring: null,
      }

      vi.mocked(mockStripe.stripe.prices.retrieve)
        .mockResolvedValueOnce(mockPrice as any)
        .mockRejectedValueOnce(new Error('Price not found'))

      // Act
      const result = await getMultipleStripePrices(['price_1', 'invalid_price'])

      // Assert
      expect(result).toEqual({
        price_1: {
          amount: 1000,
          currency: 'USD',
          type: 'one-time',
          recurring: null,
        },
        invalid_price: null,
      })
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)

      consoleErrorSpy.mockRestore()
    })

    it('should process large batches without rate limit issues', async () => {
      // Arrange
      const priceIds = Array.from({ length: 25 }, (_, i) => `price_${i}`)
      const mockPrice = {
        id: 'price_0',
        unit_amount: 1000,
        currency: 'usd',
        type: 'one_time',
        recurring: null,
      }

      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue(
        mockPrice as any,
      )

      // Act
      const result = await getMultipleStripePrices(priceIds)

      // Assert
      expect(Object.keys(result)).toHaveLength(25)
      expect(mockStripe.stripe.prices.retrieve).toHaveBeenCalledTimes(25)
    })

    it('should return empty object for empty input', async () => {
      // Act
      const result = await getMultipleStripePrices([])

      // Assert
      expect(result).toEqual({})
      expect(mockStripe.stripe.prices.retrieve).not.toHaveBeenCalled()
    })
  })
})
