/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handlePaymentSucceeded } from '@/app/api/stripe/webhooks/handlers/payment-succeeded'
import { handleSubscriptionCreated } from '@/app/api/stripe/webhooks/handlers/subscription-created'
import { handleSubscriptionDeleted } from '@/app/api/stripe/webhooks/handlers/subscription-deleted'
import { handleSubscriptionUpdated } from '@/app/api/stripe/webhooks/handlers/subscription-updated'
import {
  pauseClientCoachingSubscription,
  resumeClientCoachingSubscription,
} from '@/server/models/subscription/factory'
import { GQLContext } from '@/types/gql-context'

const mockPrisma = await import('@/lib/db')
const mockStripe = await import('@/lib/stripe/stripe')
const mockAccessControl = await import('@/lib/access-control')
const mockLookupKeys = await import('@/lib/stripe/lookup-keys')
const mockWebhookUtils = await import('@/app/api/stripe/webhooks/utils/shared')

vi.mock('@/lib/access-control', () => ({
  ensureTrainerClientAccess: vi.fn(),
}))

// Mock factories
const createMockContext = (trainerId = 'trainer_123'): GQLContext =>
  ({
    user: {
      user: {
        id: trainerId,
        email: `${trainerId}@test.com`,
      },
    },
  }) as any

const createMockSubscription = (overrides: any = {}) => ({
  id: 'sub_test123',
  customer: 'cus_test123',
  status: 'active',
  items: {
    data: [
      {
        id: 'si_test123',
        price: {
          id: 'price_monthly',
          lookup_key: 'premium_monthly',
        },
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
      },
    ],
  },
  current_period_start: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
  metadata: {},
  pause_collection: null,
  ...overrides,
})

describe('Subscription Switching Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks for webhook helpers
    vi.mocked(mockWebhookUtils.findUserByStripeCustomerId).mockResolvedValue({
      id: 'user_123',
      email: 'user@test.com',
    } as any)
    vi.mocked(mockWebhookUtils.findPackageByStripePriceId).mockResolvedValue({
      id: 'pkg_123',
      stripeLookupKey: 'premium_monthly',
    } as any)
    vi.mocked(mockLookupKeys.resolvePriceIdToLookupKey).mockResolvedValue(
      'premium_monthly',
    )
    vi.mocked(mockStripe.stripe.customers.update).mockResolvedValue({} as any)
  })

  describe('Monthly Premium → Coaching (subscription.updated with proration)', () => {
    it('should detect plan change and update to coaching', async () => {
      // Arrange
      const subscription = createMockSubscription({
        id: 'sub_monthly',
        items: {
          data: [
            {
              id: 'si_test',
              price: { id: 'price_coaching', lookup_key: 'premium_coaching' },
              current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
            },
          ],
        },
        metadata: { trainerId: 'trainer_456' },
      })

      const existingUserSub = {
        id: 'user_sub_123',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_monthly',
        package: {
          name: 'Premium Monthly',
          stripeLookupKey: 'premium_monthly',
        },
      }

      const coachingPackage = {
        id: 'pkg_coaching',
        name: 'Premium Coaching',
        stripeLookupKey: 'premium_coaching',
        trainerId: 'trainer_456',
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        existingUserSub as any,
      )
      vi.mocked(mockStripe.stripe.prices.list).mockResolvedValue({
        data: [{ id: 'price_monthly' }],
      } as any)
      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue({
        id: 'price_coaching',
        lookup_key: 'premium_coaching',
      } as any)
      vi.mocked(mockPrisma.prisma.packageTemplate.findFirst).mockResolvedValue(
        coachingPackage as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.update).mockResolvedValue({} as any)

      // Act
      await handleSubscriptionUpdated(subscription as any)

      // Assert - Should update to coaching package
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'user_sub_123' },
        data: expect.objectContaining({
          packageId: 'pkg_coaching',
          stripeLookupKey: 'premium_coaching',
          trainerId: 'trainer_456',
        }),
      })

      // Assert - Should assign trainer
      expect(mockPrisma.prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        data: { trainerId: 'trainer_456' },
      })
    })
  })

  describe('Yearly Premium + Coaching (pause/resume)', () => {
    it('should pause yearly when coaching starts', async () => {
      // Arrange
      const currentTime = Math.floor(Date.now() / 1000)
      const coachingSubscription = createMockSubscription({
        id: 'sub_coaching',
        customer: 'cus_test123',
        metadata: {}, // No offerToken to avoid trainerOffer.update call
        items: {
          data: [
            {
              price: { id: 'price_coaching', lookup_key: 'premium_coaching' },
              current_period_start: currentTime,
              current_period_end: currentTime + 86400 * 30,
            },
          ],
        },
        current_period_end: currentTime + 86400 * 30,
      })

      const user = {
        id: 'user_123',
        email: 'user@test.com',
        profile: { firstName: 'Test' },
      }
      const coachingPackage = {
        id: 'pkg_coaching',
        name: 'Premium Coaching',
        stripeLookupKey: 'premium_coaching',
        trainerId: null,
      }
      const yearlySubscription = {
        id: 'user_sub_yearly',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_yearly123',
        status: 'ACTIVE',
        packageId: 'pkg_yearly',
        package: {
          id: 'pkg_yearly',
          name: 'Premium Yearly',
          stripeLookupKey: 'premium_yearly',
          duration: 'YEARLY',
        },
      }

      // Override mocks for this test
      vi.mocked(mockWebhookUtils.findUserByStripeCustomerId).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockWebhookUtils.findPackageByStripePriceId).mockResolvedValue(
        coachingPackage as any,
      )
      vi.mocked(mockLookupKeys.resolvePriceIdToLookupKey).mockResolvedValue(
        'premium_coaching',
      )

      // Mock findFirst to return yearly subscription for pause logic
      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        yearlySubscription as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.create).mockResolvedValue({
        id: 'new_sub_id',
      } as any)
      vi.mocked(
        mockPrisma.prisma.userSubscription.updateMany,
      ).mockResolvedValue({
        count: 0,
      } as any)
      vi.mocked(mockStripe.stripe.subscriptions.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionCreated(coachingSubscription as any)

      // Assert - Should create coaching subscription first
      expect(mockPrisma.prisma.userSubscription.create).toHaveBeenCalled()

      // Assert - Should pause yearly
      expect(mockStripe.stripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_yearly123',
        expect.objectContaining({
          pause_collection: { behavior: 'void' },
          metadata: expect.objectContaining({
            pausedForCoaching: 'true',
          }),
        }),
      )
    })

    it('should resume yearly when coaching ends', async () => {
      // Arrange
      const coachingSubscription = createMockSubscription({
        id: 'sub_coaching',
      })

      const coachingUserSub = {
        id: 'user_sub_coaching',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_coaching',
        trainerId: 'trainer_456',
        user: {
          id: 'user_123',
          email: 'user@test.com',
          profile: { firstName: 'Test' },
        },
        package: { stripeLookupKey: 'premium_coaching', name: 'Coaching' },
      }

      const yearlyUserSub = {
        id: 'user_sub_yearly',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_yearly123',
        status: 'ACTIVE',
        package: { stripeLookupKey: 'premium_yearly' },
      }

      const pausedYearlyStripe = {
        id: 'sub_yearly123',
        pause_collection: { behavior: 'void' },
        metadata: { pausedForCoaching: 'true' },
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        coachingUserSub as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.findMany).mockResolvedValue([
        yearlyUserSub as any,
      ])
      vi.mocked(
        mockPrisma.prisma.userSubscription.updateMany,
      ).mockResolvedValue({
        count: 1,
      } as any)
      vi.mocked(mockStripe.stripe.subscriptions.retrieve).mockResolvedValue(
        pausedYearlyStripe as any,
      )
      vi.mocked(mockStripe.stripe.subscriptions.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.update).mockResolvedValue({} as any)

      // Act
      await handleSubscriptionDeleted(coachingSubscription as any)

      // Assert - Should resume yearly
      expect(mockStripe.stripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_yearly123',
        expect.objectContaining({
          pause_collection: null,
          metadata: expect.objectContaining({
            pausedForCoaching: null,
            resumedAt: expect.any(String),
          }),
        }),
      )

      // Assert - Should remove trainer
      // expect(mockPrisma.prisma.user.update).toHaveBeenCalledWith({
      //   where: { id: 'user_123' },
      //   data: { trainerId: null },
      // })
    })

    it('should extend yearly pause on each coaching payment', async () => {
      // Arrange
      const invoice = {
        id: 'in_test',
        subscription: 'sub_coaching',
        amount_paid: 10000,
        currency: 'usd',
      }

      const coachingUserSub = {
        id: 'user_sub_coaching',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_coaching',
        package: { stripeLookupKey: 'premium_coaching' },
      }

      const yearlyUserSub = {
        id: 'user_sub_yearly',
        userId: 'user_123',
        stripeSubscriptionId: 'sub_yearly123',
        package: { stripeLookupKey: 'premium_yearly' },
      }

      const pausedYearlyStripe = {
        id: 'sub_yearly123',
        pause_collection: { behavior: 'void' },
        metadata: { pausedForCoaching: 'true' },
      }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst)
        .mockResolvedValueOnce(coachingUserSub as any)
        .mockResolvedValueOnce(coachingUserSub as any)
      vi.mocked(mockPrisma.prisma.userSubscription.findMany).mockResolvedValue([
        yearlyUserSub as any,
      ])
      vi.mocked(mockStripe.stripe.subscriptions.retrieve).mockResolvedValue(
        pausedYearlyStripe as any,
      )
      vi.mocked(mockStripe.stripe.subscriptions.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handlePaymentSucceeded(invoice as any)

      // Assert - Should update yearly metadata
      expect(mockStripe.stripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_yearly123',
        expect.objectContaining({
          metadata: expect.objectContaining({
            lastCoachingPayment: expect.any(String),
          }),
        }),
      )
    })
  })
})

describe('Coaching Pause/Resume by Trainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('pauseClientCoachingSubscription', () => {
    it('should pause coaching subscription', async () => {
      // Arrange
      const context = createMockContext()
      const clientId = 'client_123'
      const coachingSub = {
        id: 'user_sub_coaching',
        userId: 'client_123',
        stripeSubscriptionId: 'sub_coaching',
        trainerId: 'trainer_123',
        status: 'ACTIVE',
        package: { stripeLookupKey: 'premium_coaching' },
      }
      const stripeSub = {
        id: 'sub_coaching',
        pause_collection: null,
        metadata: {},
      }

      vi.mocked(mockAccessControl.ensureTrainerClientAccess).mockResolvedValue()
      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        coachingSub as any,
      )
      vi.mocked(mockStripe.stripe.subscriptions.retrieve).mockResolvedValue(
        stripeSub as any,
      )
      vi.mocked(mockStripe.stripe.subscriptions.update).mockResolvedValue(
        {} as any,
      )

      // Act
      const result = await pauseClientCoachingSubscription(clientId, context)

      // Assert - Verify access check
      expect(mockAccessControl.ensureTrainerClientAccess).toHaveBeenCalledWith(
        'trainer_123',
        'client_123',
      )

      // Assert - Should pause in Stripe
      expect(mockStripe.stripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_coaching',
        expect.objectContaining({
          pause_collection: { behavior: 'mark_uncollectible' },
          metadata: expect.objectContaining({
            manuallyPausedByTrainer: 'true',
            trainerId: 'trainer_123',
          }),
        }),
      )

      // Assert - Should return success
      expect(result.success).toBe(true)
    })

    it('should throw error if subscription already paused', async () => {
      // Arrange
      const context = createMockContext()
      const clientId = 'client_123'
      const coachingSub = {
        id: 'user_sub_coaching',
        stripeSubscriptionId: 'sub_coaching',
        package: { stripeLookupKey: 'premium_coaching' },
      }
      const pausedStripeSub = {
        id: 'sub_coaching',
        pause_collection: { behavior: 'mark_uncollectible' },
      }

      vi.mocked(mockAccessControl.ensureTrainerClientAccess).mockResolvedValue()
      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        coachingSub as any,
      )
      vi.mocked(mockStripe.stripe.subscriptions.retrieve).mockResolvedValue(
        pausedStripeSub as any,
      )

      // Act & Assert
      await expect(
        pauseClientCoachingSubscription(clientId, context),
      ).rejects.toThrow('already paused')
    })

    it('should throw error if no permission', async () => {
      // Arrange
      const context = createMockContext()
      const clientId = 'client_123'

      vi.mocked(mockAccessControl.ensureTrainerClientAccess).mockRejectedValue(
        new Error('No permission'),
      )

      // Act & Assert
      await expect(
        pauseClientCoachingSubscription(clientId, context),
      ).rejects.toThrow('No permission')
    })
  })

  describe('resumeClientCoachingSubscription', () => {
    it('should resume coaching subscription', async () => {
      // Arrange
      const context = createMockContext()
      const clientId = 'client_123'
      const coachingSub = {
        id: 'user_sub_coaching',
        userId: 'client_123',
        stripeSubscriptionId: 'sub_coaching',
        package: { stripeLookupKey: 'premium_coaching' },
      }
      const pausedStripeSub = {
        id: 'sub_coaching',
        pause_collection: { behavior: 'mark_uncollectible' },
        metadata: { manuallyPausedByTrainer: 'true' },
      }

      vi.mocked(mockAccessControl.ensureTrainerClientAccess).mockResolvedValue()
      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        coachingSub as any,
      )
      vi.mocked(mockStripe.stripe.subscriptions.retrieve).mockResolvedValue(
        pausedStripeSub as any,
      )
      vi.mocked(mockStripe.stripe.subscriptions.update).mockResolvedValue(
        {} as any,
      )

      // Act
      const result = await resumeClientCoachingSubscription(clientId, context)

      // Assert - Should resume in Stripe
      expect(mockStripe.stripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_coaching',
        expect.objectContaining({
          pause_collection: null,
          metadata: expect.objectContaining({
            manuallyPausedByTrainer: null,
            resumedAt: expect.any(String),
          }),
        }),
      )

      // Assert - Should return success
      expect(result.success).toBe(true)
    })

    it('should throw error if subscription not paused', async () => {
      // Arrange
      const context = createMockContext()
      const clientId = 'client_123'
      const coachingSub = {
        id: 'user_sub_coaching',
        stripeSubscriptionId: 'sub_coaching',
        package: { stripeLookupKey: 'premium_coaching' },
      }
      const activeStripeSub = {
        id: 'sub_coaching',
        pause_collection: null,
      }

      vi.mocked(mockAccessControl.ensureTrainerClientAccess).mockResolvedValue()
      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        coachingSub as any,
      )
      vi.mocked(mockStripe.stripe.subscriptions.retrieve).mockResolvedValue(
        activeStripeSub as any,
      )

      // Act & Assert
      await expect(
        resumeClientCoachingSubscription(clientId, context),
      ).rejects.toThrow('not paused')
    })
  })
})
