/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleCustomerDeleted } from '@/app/api/stripe/webhooks/handlers/customer-deleted'
import { handleSubscriptionDeleted } from '@/app/api/stripe/webhooks/handlers/subscription-deleted'
import { handleSubscriptionUpdated } from '@/app/api/stripe/webhooks/handlers/subscription-updated'

// Import mocked modules
const mockPrisma = await import('@/lib/db')
const mockStripe = await import('@/lib/stripe/stripe')
const mockSendEmail = await import('@/lib/email/send-mail')
const mockLookupKeys = await import('@/lib/stripe/lookup-keys')

// Mock the email module
vi.mock('@/lib/email/send-mail', () => ({
  sendEmail: {
    subscriptionDeleted: vi.fn(),
  },
}))

// Mock factories
const createMockSubscription = (overrides: any = {}) => ({
  id: 'sub_test123',
  customer: 'cus_test123',
  status: 'active',
  items: {
    data: [
      {
        price: {
          id: 'price_test123',
        },
      },
    ],
  },
  current_period_start: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
  metadata: {
    userId: 'user_123',
    packageId: 'pkg_123',
  },
  ...overrides,
})

const createMockCustomer = (overrides: any = {}) => ({
  id: 'cus_test123',
  email: 'customer@test.com',
  metadata: {
    userId: 'user_123',
  },
  ...overrides,
})

const createMockUserSubscription = (overrides: any = {}) => ({
  id: 'sub_123',
  userId: 'user_123',
  stripeSubscriptionId: 'sub_test123',
  status: 'ACTIVE',
  user: {
    id: 'user_123',
    email: 'user@test.com',
    profile: {
      firstName: 'John',
    },
  },
  package: {
    id: 'pkg_123',
    name: 'Premium Package',
  },
  ...overrides,
})

describe('Advanced Stripe Webhook Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleSubscriptionUpdated', () => {
    it('should update subscription status to ACTIVE', async () => {
      // Arrange
      const subscription = createMockSubscription({
        status: 'active',
      })

      const dbSubscription = {
        id: 'user_sub_123',
        stripeSubscriptionId: 'sub_test123',
        package: { stripeLookupKey: 'premium_monthly' },
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        dbSubscription as any,
      )
      vi.mocked(mockStripe.stripe.prices.list).mockResolvedValue({
        data: [{ id: 'price_test123' }],
      } as any)
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionUpdated(subscription as any)

      // Assert
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'user_sub_123' },
        data: {
          status: 'ACTIVE',
          endDate: expect.any(Date),
        },
      })
    })

    it('should update subscription status to CANCELLED', async () => {
      // Arrange
      const subscription = createMockSubscription({
        status: 'canceled',
      })

      const dbSubscription = {
        id: 'user_sub_123',
        stripeSubscriptionId: 'sub_test123',
        package: { stripeLookupKey: 'premium_monthly' },
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        dbSubscription as any,
      )
      vi.mocked(mockStripe.stripe.prices.list).mockResolvedValue({
        data: [{ id: 'price_test123' }],
      } as any)
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionUpdated(subscription as any)

      // Assert
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'user_sub_123' },
        data: {
          status: 'CANCELLED',
          endDate: expect.any(Date),
        },
      })
    })

    it('should update subscription status to PENDING for past_due', async () => {
      // Arrange
      const subscription = createMockSubscription({
        status: 'past_due',
      })

      const dbSubscription = {
        id: 'user_sub_123',
        stripeSubscriptionId: 'sub_test123',
        package: { stripeLookupKey: 'premium_monthly' },
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        dbSubscription as any,
      )
      vi.mocked(mockStripe.stripe.prices.list).mockResolvedValue({
        data: [{ id: 'price_test123' }],
      } as any)
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionUpdated(subscription as any)

      // Assert
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'user_sub_123' },
        data: {
          status: 'PENDING',
          endDate: expect.any(Date),
        },
      })
    })

    it('should default to ACTIVE for unknown status', async () => {
      // Arrange
      const subscription = createMockSubscription({
        status: 'unknown_status',
      })

      const dbSubscription = {
        id: 'user_sub_123',
        stripeSubscriptionId: 'sub_test123',
        package: { stripeLookupKey: 'premium_monthly' },
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        dbSubscription as any,
      )
      vi.mocked(mockStripe.stripe.prices.list).mockResolvedValue({
        data: [{ id: 'price_test123' }],
      } as any)
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionUpdated(subscription as any)

      // Assert
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'user_sub_123' },
        data: {
          status: 'ACTIVE',
          endDate: expect.any(Date),
        },
      })
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const subscription = createMockSubscription()

      vi.mocked(
        mockPrisma.prisma.userSubscription.updateMany,
      ).mockRejectedValue(new Error('Database error'))

      // Act & Assert - Should not throw
      await expect(
        handleSubscriptionUpdated(subscription as any),
      ).resolves.not.toThrow()
    })

    it('should NOT switch packages when Stripe price has no lookup_key', async () => {
      // Arrange - Price without lookup_key (e.g., during pause_collection update)
      const subscription = createMockSubscription({
        status: 'active',
        items: {
          data: [
            {
              price: {
                id: 'price_without_lookup_key',
                // No lookup_key field
              },
              current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
            },
          ],
        },
      })

      const dbSubscription = {
        id: 'user_sub_123',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_test123',
        package: {
          id: 'pkg_coaching',
          name: 'Premium Coaching',
          stripeLookupKey: 'premium_coaching',
        },
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        dbSubscription as any,
      )
      // resolvePriceIdToLookupKey returns null (no lookup key found)
      vi.mocked(mockLookupKeys.resolvePriceIdToLookupKey).mockResolvedValue(
        null,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionUpdated(subscription as any)

      // Assert - Should only update status/endDate, NOT packageId
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'user_sub_123' },
        data: {
          status: 'ACTIVE',
          endDate: expect.any(Date),
        },
      })

      // Should NOT query for a new package
      expect(mockPrisma.prisma.packageTemplate.findFirst).not.toHaveBeenCalled()
    })

    it('should NOT switch packages when lookup_key is the same as current', async () => {
      // Arrange - Same lookup_key as current package
      const subscription = createMockSubscription({
        status: 'active',
        items: {
          data: [
            {
              price: {
                id: 'price_coaching',
                lookup_key: 'premium_coaching',
              },
              current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
            },
          ],
        },
      })

      const dbSubscription = {
        id: 'user_sub_123',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_test123',
        package: {
          id: 'pkg_coaching',
          name: 'Premium Coaching',
          stripeLookupKey: 'premium_coaching',
        },
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        dbSubscription as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionUpdated(subscription as any)

      // Assert - Should only update status/endDate, NOT packageId
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'user_sub_123' },
        data: {
          status: 'ACTIVE',
          endDate: expect.any(Date),
        },
      })

      // Should NOT query for a new package since lookup keys match
      expect(mockPrisma.prisma.packageTemplate.findFirst).not.toHaveBeenCalled()
    })

    it('should switch packages when lookup_key genuinely changes', async () => {
      // Arrange - Different lookup_key (real plan switch)
      const subscription = createMockSubscription({
        status: 'active',
        items: {
          data: [
            {
              price: {
                id: 'price_coaching',
                lookup_key: 'premium_coaching',
              },
              current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
            },
          ],
        },
        metadata: { trainerId: 'trainer_456' },
      })

      const dbSubscription = {
        id: 'user_sub_123',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_test123',
        package: {
          id: 'pkg_monthly',
          name: 'Premium Monthly',
          stripeLookupKey: 'premium_monthly',
        },
      }

      const newCoachingPackage = {
        id: 'pkg_coaching',
        name: 'Premium Coaching',
        stripeLookupKey: 'premium_coaching',
        trainerId: 'trainer_456',
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        dbSubscription as any,
      )
      vi.mocked(mockPrisma.prisma.packageTemplate.findFirst).mockResolvedValue(
        newCoachingPackage as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.update).mockResolvedValue({} as any)

      // Act
      await handleSubscriptionUpdated(subscription as any)

      // Assert - Should switch to coaching package
      expect(mockPrisma.prisma.packageTemplate.findFirst).toHaveBeenCalledWith({
        where: { stripeLookupKey: 'premium_coaching' },
      })
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'user_sub_123' },
        data: expect.objectContaining({
          packageId: 'pkg_coaching',
          stripeLookupKey: 'premium_coaching',
        }),
      })
    })

    it('should never query packageTemplate with undefined stripeLookupKey', async () => {
      // Arrange - This tests the specific bug where undefined was passed to Prisma
      const subscription = createMockSubscription({
        status: 'active',
        items: {
          data: [
            {
              price: {
                id: 'price_unknown',
                // No lookup_key
              },
              current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
            },
          ],
        },
      })

      const dbSubscription = {
        id: 'user_sub_123',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_test123',
        package: {
          id: 'pkg_coaching',
          name: 'Premium Coaching',
          stripeLookupKey: 'premium_coaching',
        },
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        dbSubscription as any,
      )
      // Simulate: resolvePriceIdToLookupKey returns null
      vi.mocked(mockLookupKeys.resolvePriceIdToLookupKey).mockResolvedValue(
        null,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionUpdated(subscription as any)

      // Assert - packageTemplate.findFirst should NEVER be called with undefined
      // This prevents accidentally selecting "Lifetime Premium" or other packages
      expect(mockPrisma.prisma.packageTemplate.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('handleSubscriptionDeleted', () => {
    it('should disable subscription access and send email', async () => {
      // Arrange
      const subscription = createMockSubscription()
      const userSubscription = createMockUserSubscription()

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        userSubscription as any,
      )
      vi.mocked(
        mockPrisma.prisma.userSubscription.updateMany,
      ).mockResolvedValue({
        count: 1,
      } as any)
      vi.mocked(mockSendEmail.sendEmail.subscriptionDeleted).mockResolvedValue(
        undefined,
      )

      // Act
      await handleSubscriptionDeleted(subscription as any)

      // Assert - Should disable access immediately
      expect(
        mockPrisma.prisma.userSubscription.updateMany,
      ).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_test123' },
        data: {
          status: 'CANCELLED',
          endDate: expect.any(Date),
          isInGracePeriod: false,
          gracePeriodEnd: null,
          failedPaymentRetries: 0,
          isTrialActive: false,
        },
      })

      // Assert - Should send cancellation email
      expect(mockSendEmail.sendEmail.subscriptionDeleted).toHaveBeenCalledWith(
        'user@test.com',
        {
          userName: 'John',
          packageName: 'Premium Package',
        },
      )
    })

    it('should handle missing subscription gracefully', async () => {
      // Arrange
      const subscription = createMockSubscription()

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        null,
      )

      // Act & Assert - Should not throw
      await expect(
        handleSubscriptionDeleted(subscription as any),
      ).resolves.not.toThrow()

      // Should not attempt to update or send email
      expect(
        mockPrisma.prisma.userSubscription.updateMany,
      ).not.toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.subscriptionDeleted).not.toHaveBeenCalled()
    })

    it('should handle email send failure gracefully', async () => {
      // Arrange
      const subscription = createMockSubscription()
      const userSubscription = createMockUserSubscription()

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        userSubscription as any,
      )
      vi.mocked(
        mockPrisma.prisma.userSubscription.updateMany,
      ).mockResolvedValue({
        count: 1,
      } as any)
      vi.mocked(mockSendEmail.sendEmail.subscriptionDeleted).mockRejectedValue(
        new Error('Email send failed'),
      )

      // Act & Assert - Should not throw even if email fails
      await expect(
        handleSubscriptionDeleted(subscription as any),
      ).resolves.not.toThrow()

      // Should still disable access
      expect(mockPrisma.prisma.userSubscription.updateMany).toHaveBeenCalled()
    })

    it('should handle user without email gracefully', async () => {
      // Arrange
      const subscription = createMockSubscription()
      const userSubscription = createMockUserSubscription({
        user: {
          ...createMockUserSubscription().user,
          email: null,
        },
      })

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        userSubscription as any,
      )
      vi.mocked(
        mockPrisma.prisma.userSubscription.updateMany,
      ).mockResolvedValue({
        count: 1,
      } as any)

      // Act
      await handleSubscriptionDeleted(subscription as any)

      // Assert - Should not attempt to send email
      expect(mockSendEmail.sendEmail.subscriptionDeleted).not.toHaveBeenCalled()

      // Should still disable access
      expect(mockPrisma.prisma.userSubscription.updateMany).toHaveBeenCalled()
    })
  })

  describe('handleCustomerDeleted', () => {
    it('should clean up user data when customer is deleted', async () => {
      // Arrange
      const customer = createMockCustomer()
      const user = {
        id: 'user_123',
        email: 'user@test.com',
        stripeCustomerId: 'cus_test123',
        subscriptions: [], // Add empty subscriptions array for cancelActiveSubscriptions
      }

      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockPrisma.prisma.user.update).mockResolvedValue(user as any)

      // Act
      await handleCustomerDeleted(customer as any)

      // Assert - Should clear Stripe customer ID
      expect(mockPrisma.prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        data: { stripeCustomerId: null },
      })
    })

    it('should handle missing user gracefully', async () => {
      // Arrange
      const customer = createMockCustomer()

      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(null)

      // Act & Assert - Should not throw
      await expect(
        handleCustomerDeleted(customer as any),
      ).resolves.not.toThrow()

      // Should not attempt to update
      expect(mockPrisma.prisma.user.update).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const customer = createMockCustomer()
      const user = {
        id: 'user_123',
        stripeCustomerId: 'cus_test123',
        subscriptions: [], // Add empty subscriptions array
      }

      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockPrisma.prisma.user.update).mockRejectedValue(
        new Error('Database error'),
      )

      // Act & Assert - Should not throw
      await expect(
        handleCustomerDeleted(customer as any),
      ).resolves.not.toThrow()
    })
  })
})
