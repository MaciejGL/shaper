/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleCheckoutCompleted } from '@/app/api/stripe/webhooks/handlers/checkout-completed'
import { handlePaymentSucceeded } from '@/app/api/stripe/webhooks/handlers/payment-succeeded'
import { handleSubscriptionCreated } from '@/app/api/stripe/webhooks/handlers/subscription-created'

// Import mocked modules
const mockPrisma = await import('@/lib/db')
const mockStripe = await import('@/lib/stripe/stripe')
const mockWebhookUtils = await import('@/app/api/stripe/webhooks/utils/shared')
const mockLookupKeys = await import('@/lib/stripe/lookup-keys')

// Mock factories
const createMockCheckoutSession = (overrides: any = {}) => ({
  id: 'cs_test123',
  customer: 'cus_test123',
  mode: 'payment',
  payment_status: 'paid',
  metadata: {
    offerToken: 'offer_123',
    trainerId: 'trainer_123',
    userId: 'user_123',
  },
  invoice: 'in_test123',
  payment_intent: 'pi_test123',
  line_items: {
    data: [
      {
        price: {
          id: 'price_test123',
        },
        quantity: 1,
      },
    ],
  },
  ...overrides,
})

const createMockUser = (overrides: any = {}) => ({
  id: 'user_123',
  email: 'user@test.com',
  name: 'Test User',
  stripeCustomerId: 'cus_test123',
  ...overrides,
})

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
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
      },
    ],
  },
  trial_end: null,
  metadata: {
    userId: 'user_123',
    packageId: 'pkg_123',
  },
  ...overrides,
})

describe('Stripe Webhook Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleCheckoutCompleted', () => {
    it('should process successful checkout with invoice', async () => {
      // Arrange
      const session = createMockCheckoutSession()
      const user = createMockUser()

      vi.mocked(mockWebhookUtils.findUserByStripeCustomerId).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockStripe.stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test123',
        amount: 10000,
        currency: 'usd',
      } as any)

      // Act
      await handleCheckoutCompleted(session as any)

      // Assert - Should find user by customer ID
      expect(mockWebhookUtils.findUserByStripeCustomerId).toHaveBeenCalledWith(
        'cus_test123',
      )
    })

    it('should handle missing customer gracefully', async () => {
      // Arrange
      const session = createMockCheckoutSession({ customer: null })

      // Act & Assert - Should not throw
      await expect(
        handleCheckoutCompleted(session as any),
      ).resolves.not.toThrow()
    })

    it('should handle payment mode without invoice', async () => {
      // Arrange
      const session = createMockCheckoutSession({
        mode: 'payment',
        invoice: null,
        payment_intent: 'pi_test123',
      })
      const user = createMockUser()

      vi.mocked(mockWebhookUtils.findUserByStripeCustomerId).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockStripe.stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test123',
        amount: 10000,
        currency: 'usd',
      } as any)

      // Act
      await handleCheckoutCompleted(session as any)

      // Assert
      expect(mockStripe.stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
        'pi_test123',
      )
    })
  })

  describe('handleSubscriptionCreated', () => {
    it('should create subscription record for new subscription', async () => {
      // Arrange
      const subscription = createMockSubscription()
      const user = createMockUser()
      const packageTemplate = {
        id: 'pkg_123',
        name: 'Test Package',
        stripeLookupKey: 'test_lookup_key',
      }

      // Mock stripe.prices.retrieve to return price with lookup_key
      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue({
        id: 'price_test123',
        lookup_key: 'test_lookup_key',
      } as any)

      vi.mocked(mockWebhookUtils.findUserByStripeCustomerId).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockWebhookUtils.findPackageByStripePriceId).mockResolvedValue(
        packageTemplate as any,
      )
      vi.mocked(mockLookupKeys.resolvePriceIdToLookupKey).mockResolvedValue(
        'test_lookup_key',
      )
      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        null,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.create).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionCreated(subscription as any)

      // Assert
      expect(mockPrisma.prisma.userSubscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_123',
            packageId: 'pkg_123',
            status: 'ACTIVE',
            stripeSubscriptionId: 'sub_test123',
            stripeLookupKey: 'test_lookup_key',
          }),
        }),
      )
    })

    it('should handle trial subscriptions correctly', async () => {
      // Arrange
      const trialEnd = Math.floor(Date.now() / 1000) + 86400 * 14 // 14 days
      const subscription = createMockSubscription({
        trial_end: trialEnd,
        status: 'trialing',
      })
      const user = createMockUser()
      const packageTemplate = {
        id: 'pkg_123',
        stripeLookupKey: 'test_lookup_key',
      }

      // Mock stripe.prices.retrieve to return price with lookup_key
      vi.mocked(mockStripe.stripe.prices.retrieve).mockResolvedValue({
        id: 'price_test123',
        lookup_key: 'test_lookup_key',
      } as any)

      vi.mocked(mockWebhookUtils.findUserByStripeCustomerId).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockWebhookUtils.findPackageByStripePriceId).mockResolvedValue(
        packageTemplate as any,
      )
      vi.mocked(mockLookupKeys.resolvePriceIdToLookupKey).mockResolvedValue(
        'test_lookup_key',
      )
      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        null,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.create).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleSubscriptionCreated(subscription as any)

      // Assert
      expect(mockPrisma.prisma.userSubscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isTrialActive: true,
            trialEnd: new Date(trialEnd * 1000),
          }),
        }),
      )
    })

    it('should handle missing package template gracefully', async () => {
      // Arrange
      const subscription = createMockSubscription()
      const user = createMockUser()

      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockPrisma.prisma.packageTemplate.findFirst).mockResolvedValue(
        null,
      )

      // Act & Assert - Should not throw
      await expect(
        handleSubscriptionCreated(subscription as any),
      ).resolves.not.toThrow()
    })
  })

  describe('handlePaymentSucceeded', () => {
    it('should update subscription status on successful payment', async () => {
      // Arrange
      const invoice = {
        id: 'in_test123',
        subscription: 'sub_test123',
        amount_paid: 10000,
        currency: 'usd',
      }
      const subscription = { id: 'sub_test123', userId: 'user_123' }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        subscription as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handlePaymentSucceeded(invoice as any)

      // Assert
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'sub_test123' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          isInGracePeriod: false,
          gracePeriodEnd: null,
          failedPaymentRetries: 0,
          lastPaymentAttempt: expect.any(Date),
        }),
      })
    })

    it('should handle invoice without subscription gracefully', async () => {
      // Arrange
      const invoice = {
        id: 'in_test123',
        subscription: null,
        amount_paid: 10000,
        currency: 'usd',
      }

      // Act & Assert - Should not throw
      await expect(
        handlePaymentSucceeded(invoice as any),
      ).resolves.not.toThrow()
    })
  })
})
