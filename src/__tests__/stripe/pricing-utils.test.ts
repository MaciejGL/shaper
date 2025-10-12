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
      vi.mocked(mockStripe.stripe.prices.list).mockResolvedValue({
        data: [mockPrice],
      } as any)

      // Act
      const result = await getStripePricingInfo('lookup_key_123')

      // Assert
      expect(result).toEqual({
        amount: 5000,
        currency: 'USD',
        type: 'one-time',
        recurring: null,
      })
      expect(mockStripe.stripe.prices.list).toHaveBeenCalledWith({
        lookup_keys: ['lookup_key_123'],
        limit: 1,
      })
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
      vi.mocked(mockStripe.stripe.prices.list).mockResolvedValue({
        data: [mockPrice],
      } as any)

      // Act
      const result = await getStripePricingInfo('lookup_key_456')

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
      vi.mocked(mockStripe.stripe.prices.list).mockResolvedValue({
        data: [mockPrice],
      } as any)

      // Act
      const result = await getStripePricingInfo('lookup_key_free')

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
      vi.mocked(mockStripe.stripe.prices.list).mockRejectedValue(
        new Error('Price not found'),
      )

      // Act
      const result = await getStripePricingInfo('invalid_lookup_key')

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

      vi.mocked(mockStripe.stripe.prices.list)
        .mockResolvedValueOnce({ data: [mockPrices[0]] } as any)
        .mockResolvedValueOnce({ data: [mockPrices[1]] } as any)

      // Act
      const result = await getMultipleStripePrices([
        'lookup_key_1',
        'lookup_key_2',
      ])

      // Assert
      expect(result).toEqual({
        lookup_key_1: {
          amount: 1000,
          currency: 'USD',
          type: 'one-time',
          recurring: null,
        },
        lookup_key_2: {
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

      vi.mocked(mockStripe.stripe.prices.list)
        .mockResolvedValueOnce({ data: [mockPrice] } as any)
        .mockRejectedValueOnce(new Error('Price not found'))

      // Act
      const result = await getMultipleStripePrices([
        'lookup_key_1',
        'invalid_lookup_key',
      ])

      // Assert
      expect(result).toEqual({
        lookup_key_1: {
          amount: 1000,
          currency: 'USD',
          type: 'one-time',
          recurring: null,
        },
        invalid_lookup_key: null,
      })
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)

      consoleErrorSpy.mockRestore()
    })

    it('should process large batches without rate limit issues', async () => {
      // Arrange
      const lookupKeys = Array.from({ length: 25 }, (_, i) => `lookup_key_${i}`)
      const mockPrice = {
        id: 'price_0',
        unit_amount: 1000,
        currency: 'usd',
        type: 'one_time',
        recurring: null,
      }

      vi.mocked(mockStripe.stripe.prices.list).mockResolvedValue({
        data: [mockPrice],
      } as any)

      // Act
      const result = await getMultipleStripePrices(lookupKeys)

      // Assert
      expect(Object.keys(result)).toHaveLength(25)
      expect(mockStripe.stripe.prices.list).toHaveBeenCalledTimes(25)
    })

    it('should return empty object for empty input', async () => {
      // Act
      const result = await getMultipleStripePrices([])

      // Assert
      expect(result).toEqual({})
      expect(mockStripe.stripe.prices.list).not.toHaveBeenCalled()
    })
  })
})
