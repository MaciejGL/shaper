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
              platformFeePercent: 12, // Default team fee
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
        platformFeePercent: 12,
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
                  platformFeePercent: true,
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
        platformFeePercent: 11, // Default for individuals
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
        platformFeePercent: 11, // Default even when no account
      })
    })

    it('should use custom team fee (10%)', async () => {
      // Arrange
      const mockUser = createMockUser({
        teamMemberships: [
          {
            team: {
              id: 'team-456',
              name: 'Premium Team',
              stripeConnectedAccountId: 'acct_team456',
              platformFeePercent: 10, // Custom lower fee
            },
          },
        ],
      })
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await getPayoutDestination('trainer-456')

      // Assert
      expect(result).toEqual({
        connectedAccountId: 'acct_team456',
        destination: 'team',
        displayName: 'team:Premium Team',
        platformFeePercent: 10,
      })
    })

    it('should use custom team fee (15%)', async () => {
      // Arrange
      const mockUser = createMockUser({
        teamMemberships: [
          {
            team: {
              id: 'team-789',
              name: 'Starter Team',
              stripeConnectedAccountId: 'acct_team789',
              platformFeePercent: 15, // Custom higher fee
            },
          },
        ],
      })
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        mockUser as any,
      )

      // Act
      const result = await getPayoutDestination('trainer-789')

      // Assert
      expect(result).toEqual({
        connectedAccountId: 'acct_team789',
        destination: 'team',
        displayName: 'team:Starter Team',
        platformFeePercent: 15,
      })
    })
  })

  describe('calculateRevenueSharing', () => {
    it('should calculate 12% platform fee (default)', async () => {
      // Arrange
      const lineItems = [
        createLineItem({ price_data: { unit_amount: 10000 }, quantity: 1 }), // $100
        createLineItem({ price_data: { unit_amount: 5000 }, quantity: 2 }), // $50 x 2 = $100
      ] as any

      // Act
      const result = await calculateRevenueSharing(lineItems, 12) // 12% default

      // Assert - $200 total, $24 platform (12%)
      // Stripe handles processing fees automatically
      expect(result).toEqual({
        totalAmount: 20000, // $200 total
        applicationFeeAmount: 2400, // $24 (12% platform fee)
      })
    })

    it('should calculate custom 10% platform fee', async () => {
      // Arrange
      const lineItems = [
        createLineItem({ price_data: { unit_amount: 10000 }, quantity: 1 }), // $100
      ] as any

      // Act
      const result = await calculateRevenueSharing(lineItems, 10) // Custom 10%

      // Assert - $100 total, $10 platform (10%)
      expect(result).toEqual({
        totalAmount: 10000,
        applicationFeeAmount: 1000, // $10 (10% platform fee)
      })
    })

    it('should calculate custom 15% platform fee', async () => {
      // Arrange
      const lineItems = [
        createLineItem({ price_data: { unit_amount: 10000 }, quantity: 1 }), // $100
      ] as any

      // Act
      const result = await calculateRevenueSharing(lineItems, 15) // Custom 15%

      // Assert - $100 total, $15 platform (15%)
      expect(result).toEqual({
        totalAmount: 10000,
        applicationFeeAmount: 1500, // $15 (15% platform fee)
      })
    })

    it('should calculate revenue for Stripe price IDs with 12% fee', async () => {
      // Arrange
      const mockPrice = { unit_amount: 15000 } // $150

      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue(
        mockPrice as any,
      )

      const lineItems = [{ price: 'price_test123', quantity: 1 }] as any

      // Act
      const result = await calculateRevenueSharing(lineItems, 12)

      // Assert - $150 total, $18 platform (12%)
      expect(result).toEqual({
        totalAmount: 15000, // $150
        applicationFeeAmount: 1800, // $18 (12% platform fee)
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
      const result = await calculateRevenueSharing(lineItems, 12)

      // Assert - $180 total, $21.60 platform (12%)
      expect(result).toEqual({
        totalAmount: 18000, // $180 total
        applicationFeeAmount: 2160, // $21.60 (12% platform fee)
      })
    })

    it('should handle zero amounts gracefully', async () => {
      // Arrange
      const lineItems: any[] = []

      // Act
      const result = await calculateRevenueSharing(lineItems, 12)

      // Assert
      expect(result).toEqual({
        totalAmount: 0,
        applicationFeeAmount: 0,
      })
    })

    it('should handle very large amounts without overflow', async () => {
      // Arrange
      const lineItems = [
        createLineItem({ price_data: { unit_amount: 10000000 }, quantity: 1 }), // $100,000
      ] as any

      // Act
      const result = await calculateRevenueSharing(lineItems, 12)

      // Assert - $100,000 total, $12,000 platform (12%)
      expect(result).toEqual({
        totalAmount: 10000000,
        applicationFeeAmount: 1200000, // $12,000 (12%)
      })
    })

    it('should round application fee to nearest cent', async () => {
      // Arrange
      const lineItems = [
        createLineItem({ price_data: { unit_amount: 333 }, quantity: 1 }), // $3.33
      ] as any

      // Act
      const result = await calculateRevenueSharing(lineItems, 12)

      // Assert - Rounds 39.96 cents to 40 cents
      expect(result).toEqual({
        totalAmount: 333,
        applicationFeeAmount: 40, // Rounded from 39.96
      })
    })
  })

  describe('createPaymentIntentData', () => {
    it('should create payment intent data with 12% application fee', () => {
      // Arrange
      const payout: PayoutDestination = {
        connectedAccountId: 'acct_team123',
        destination: 'team',
        displayName: 'team:Awesome Team',
        platformFeePercent: 12,
      }
      const revenue: RevenueCalculation = {
        totalAmount: 10000,
        applicationFeeAmount: 1200,
      }
      const trainerId = 'trainer-123'

      // Act
      const result = createPaymentIntentData(payout, revenue, trainerId)

      // Assert
      expect(result).toEqual({
        application_fee_amount: 1200,
        transfer_data: {
          destination: 'acct_team123',
        },
        metadata: {
          trainerId: 'trainer-123',
          platformFeePercent: '12',
          payoutDestination: 'team:Awesome Team',
          revenueShareApplied: 'true',
        },
      })
    })

    it('should create payment intent data with custom 10% fee', () => {
      // Arrange
      const payout: PayoutDestination = {
        connectedAccountId: 'acct_team456',
        destination: 'team',
        displayName: 'team:Premium Team',
        platformFeePercent: 10,
      }
      const revenue: RevenueCalculation = {
        totalAmount: 10000,
        applicationFeeAmount: 1000,
      }

      // Act
      const result = createPaymentIntentData(payout, revenue, 'trainer-456')

      // Assert
      expect(result).toEqual({
        application_fee_amount: 1000,
        transfer_data: {
          destination: 'acct_team456',
        },
        metadata: {
          trainerId: 'trainer-456',
          platformFeePercent: '10',
          payoutDestination: 'team:Premium Team',
          revenueShareApplied: 'true',
        },
      })
    })

    it('should return undefined when no connected account', () => {
      // Arrange
      const payout: PayoutDestination = {
        connectedAccountId: null,
        destination: 'none',
        displayName: 'none',
        platformFeePercent: 12,
      }
      const revenue: RevenueCalculation = {
        totalAmount: 10000,
        applicationFeeAmount: 1200,
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
        platformFeePercent: 12,
      }
      const revenue: RevenueCalculation = {
        totalAmount: 0,
        applicationFeeAmount: 0,
      }

      // Act
      const result = createPaymentIntentData(payout, revenue, 'trainer-123')

      // Assert
      expect(result).toBeUndefined()
    })

    it('should handle individual trainer with default fee', () => {
      // Arrange
      const payout: PayoutDestination = {
        connectedAccountId: 'acct_individual789',
        destination: 'individual',
        displayName: 'individual',
        platformFeePercent: 12,
      }
      const revenue: RevenueCalculation = {
        totalAmount: 5000,
        applicationFeeAmount: 600,
      }

      // Act
      const result = createPaymentIntentData(payout, revenue, 'trainer-789')

      // Assert
      expect(result).toEqual({
        application_fee_amount: 600,
        transfer_data: {
          destination: 'acct_individual789',
        },
        metadata: {
          trainerId: 'trainer-789',
          platformFeePercent: '12',
          payoutDestination: 'individual',
          revenueShareApplied: 'true',
        },
      })
    })
  })
})
