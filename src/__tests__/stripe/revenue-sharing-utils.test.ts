/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type PayoutDestination,
  type RevenueCalculation,
  calculateRevenueSharing,
  createPaymentIntentData,
  getPayoutDestination,
} from '@/lib/stripe/revenue-sharing-utils'

// Import mocked modules
const mockPrisma = await import('@/lib/db')
const mockStripe = await import('@/lib/stripe/stripe')

// Clean mock factories
const createMockUser = (overrides: any = {}) => ({
  id: 'user-123',
  email: 'trainer@test.com',
  name: 'Test Trainer',
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'TRAINER',
  trainerId: null,
  featured: false,
  stripeCustomerId: null,
  stripeConnectedAccountId: null,
  teamMemberships: [],
  ...overrides,
})

const createLineItem = (data: any) => ({
  price_data: {
    currency: 'usd',
    unit_amount: 10000,
    ...data.price_data,
  },
  quantity: 1,
  ...data,
})

describe('Revenue Sharing Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPayoutDestination', () => {
    it('should prioritize team account over individual trainer account', async () => {
      // Arrange
      const mockUser = createMockUser({
        stripeConnectedAccountId: 'acct_individual123',
        teamMemberships: [
          {
            team: {
              id: 'team-123',
              name: 'Awesome Team',
              stripeConnectedAccountId: 'acct_team123',
            },
          },
        ],
      })
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await getPayoutDestination('trainer-123')

      // Assert
      expect(result).toEqual({
        connectedAccountId: 'acct_team123',
        destination: 'team',
        displayName: 'team:Awesome Team',
      })
      expect(mockPrisma.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'trainer-123' },
        select: {
          stripeConnectedAccountId: true,
          teamMemberships: {
            select: {
              team: {
                select: {
                  id: true,
                  name: true,
                  stripeConnectedAccountId: true,
                },
              },
            },
            take: 1,
          },
        },
      })
    })

    it('should fallback to individual account when no team', async () => {
      // Arrange
      const mockUser = createMockUser({
        stripeConnectedAccountId: 'acct_individual123',
      })
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await getPayoutDestination('trainer-123')

      // Assert
      expect(result).toEqual({
        connectedAccountId: 'acct_individual123',
        destination: 'individual',
        displayName: 'individual',
      })
    })

    it('should return none when no connected accounts exist', async () => {
      // Arrange
      const mockUser = createMockUser()
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await getPayoutDestination('trainer-123')

      // Assert
      expect(result).toEqual({
        connectedAccountId: null,
        destination: 'none',
        displayName: 'none',
      })
    })
  })

  describe('calculateRevenueSharing', () => {
    it('should calculate 10% platform fee, minus Stripe fees for trainer', async () => {
      // Arrange
      const lineItems = [
        createLineItem({ price_data: { unit_amount: 10000 }, quantity: 1 }), // $100
        createLineItem({ price_data: { unit_amount: 5000 }, quantity: 2 }), // $50 x 2 = $100
      ] as any

      // Act
      const result = await calculateRevenueSharing(lineItems)

      // Assert - $200 total, $20 platform (10%), $30.5 Stripe fees (1.4% + 25¢), $149.5 trainer
      expect(result).toEqual({
        totalAmount: 20000, // $200 total
        applicationFeeAmount: 2000, // $20 (10% platform fee)
        stripeFeeAmount: 305, // $3.05 (1.4% + 25¢ Stripe fees)
        trainerPayoutAmount: 17695, // $176.95 (remainder after platform fee + Stripe fees)
      })
    })

    it('should calculate revenue for Stripe price IDs', async () => {
      // Arrange
      const mockPrice = { unit_amount: 15000 } // $150

      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue(
        mockPrice as any,
      )

      const lineItems = [{ price: 'price_test123', quantity: 1 }] as any

      // Act
      const result = await calculateRevenueSharing(lineItems)

      // Assert - $150 total, $15 platform (10%), $2.35 Stripe fees (1.4% + 25¢), $132.65 trainer
      expect(result).toEqual({
        totalAmount: 15000, // $150
        applicationFeeAmount: 1500, // $15 (10% platform fee)
        stripeFeeAmount: 235, // $2.35 (1.4% + 25¢ Stripe fees)
        trainerPayoutAmount: 13265, // $132.65 (remainder)
      })
      expect(mockStripe.stripe.prices.retrieve).toHaveBeenCalledWith(
        'price_test123',
      )
    })

    it('should handle mixed line items (dynamic + price IDs)', async () => {
      // Arrange
      const mockPrice = { unit_amount: 8000 } // $80

      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue(
        mockPrice as any,
      )

      const lineItems = [
        createLineItem({ price_data: { unit_amount: 5000 }, quantity: 2 }), // $50 x 2 = $100
        { price: 'price_test123', quantity: 1 }, // $80
      ] as any

      // Act
      const result = await calculateRevenueSharing(lineItems)

      // Assert - $180 total, $18 platform (10%), $2.77 Stripe fees (1.4% + 25¢), $159.23 trainer
      expect(result).toEqual({
        totalAmount: 18000, // $180 total
        applicationFeeAmount: 1800, // $18 (10% platform fee)
        stripeFeeAmount: 277, // $2.77 (1.4% + 25¢ Stripe fees)
        trainerPayoutAmount: 15923, // $159.23 (remainder)
      })
    })

    it('should handle zero amounts gracefully', async () => {
      // Arrange
      const lineItems: any[] = []

      // Act
      const result = await calculateRevenueSharing(lineItems)

      // Assert
      expect(result).toEqual({
        totalAmount: 0,
        applicationFeeAmount: 0,
        stripeFeeAmount: 25, // Fixed fee still applies (25 øre minimum)
        trainerPayoutAmount: -25, // Negative because only fixed fee applies
      })
    })
  })

  describe('createPaymentIntentData', () => {
    it('should create payment intent data with application fee', () => {
      // Arrange
      const payout: PayoutDestination = {
        connectedAccountId: 'acct_team123',
        destination: 'team',
        displayName: 'team:Awesome Team',
      }
      const revenue: RevenueCalculation = {
        totalAmount: 10000,
        applicationFeeAmount: 1000,
        trainerPayoutAmount: 8800,
        stripeFeeAmount: 200,
      }
      const trainerId = 'trainer-123'

      // Act
      const result = createPaymentIntentData(payout, revenue, trainerId)

      // Assert
      expect(result).toEqual({
        application_fee_amount: 1000,
        on_behalf_of: 'acct_team123',
        transfer_data: {
          destination: 'acct_team123',
        },
        metadata: {
          trainerId: 'trainer-123',
          platformFeeAmount: '1000',
          trainerPayoutAmount: '8800',
          stripeFeeAmount: '200',
          revenueShareApplied: 'true',
          payoutDestination: 'team:Awesome Team',
        },
      })
    })

    it('should return undefined when no connected account', () => {
      // Arrange
      const payout: PayoutDestination = {
        connectedAccountId: null,
        destination: 'none',
        displayName: 'none',
      }
      const revenue: RevenueCalculation = {
        totalAmount: 10000,
        applicationFeeAmount: 1000,
        trainerPayoutAmount: 8800,
        stripeFeeAmount: 200,
      }

      // Act
      const result = createPaymentIntentData(payout, revenue, 'trainer-123')

      // Assert
      expect(result).toBeUndefined()
    })

    it('should return undefined when application fee is zero', () => {
      // Arrange
      const payout: PayoutDestination = {
        connectedAccountId: 'acct_team123',
        destination: 'team',
        displayName: 'team:Awesome Team',
      }
      const revenue: RevenueCalculation = {
        totalAmount: 0,
        applicationFeeAmount: 0,
        trainerPayoutAmount: -25,
        stripeFeeAmount: 25,
      }

      // Act
      const result = createPaymentIntentData(payout, revenue, 'trainer-123')

      // Assert
      expect(result).toBeUndefined()
    })
  })
})
