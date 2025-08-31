/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handlePaymentFailed } from '@/app/api/stripe/webhooks/handlers/payment-failed'

// Import mocked modules
const mockPrisma = await import('@/lib/db')
const mockSendEmail = await import('@/lib/email/send-mail')

// Mock the email and config modules
vi.mock('@/lib/email/send-mail', () => ({
  sendEmail: {
    paymentFailed: vi.fn(),
    gracePeriodEnding: vi.fn(),
  },
}))

vi.mock('@/lib/stripe/config', () => ({
  SUBSCRIPTION_CONFIG: {
    GRACE_PERIOD_MS: 3 * 24 * 60 * 60 * 1000, // 3 days
    GRACE_PERIOD_DAYS: 3,
    MAX_PAYMENT_RETRIES: 3,
  },
}))

// Mock factories
const createMockInvoice = (overrides: any = {}) => ({
  id: 'in_test123',
  subscription: 'sub_test123',
  amount_due: 1500,
  currency: 'usd',
  status: 'open',
  attempt_count: 1,
  ...overrides,
})

const createMockUserSubscription = (overrides: any = {}) => ({
  id: 'sub_123',
  userId: 'user_123',
  packageId: 'pkg_123',
  stripeSubscriptionId: 'sub_test123',
  status: 'ACTIVE',
  failedPaymentRetries: 0,
  isInGracePeriod: false,
  gracePeriodEnd: null,
  package: {
    id: 'pkg_123',
    name: 'Premium Package',
  },
  ...overrides,
})

const createMockUser = (overrides: any = {}) => ({
  id: 'user_123',
  email: 'user@test.com',
  profile: {
    firstName: 'John',
  },
  ...overrides,
})

describe('Payment Failure Webhook Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handlePaymentFailed', () => {
    it('should activate grace period on first payment failure', async () => {
      // Arrange
      const invoice = createMockInvoice()
      const subscription = createMockUserSubscription()
      const user = createMockUser()
      const packageTemplate = { id: 'pkg_123', name: 'Premium Package' }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        subscription as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockPrisma.prisma.packageTemplate.findUnique).mockResolvedValue(
        packageTemplate as any,
      )
      vi.mocked(mockSendEmail.sendEmail.paymentFailed).mockResolvedValue(
        undefined,
      )

      // Act
      await handlePaymentFailed(invoice as any)

      // Assert - Should activate grace period
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'sub_123' },
        data: {
          status: 'PENDING',
          isInGracePeriod: true,
          gracePeriodEnd: expect.any(Date),
          failedPaymentRetries: 1,
          lastPaymentAttempt: expect.any(Date),
        },
      })

      // Assert - Should send payment failed email
      expect(mockSendEmail.sendEmail.paymentFailed).toHaveBeenCalledWith(
        'user@test.com',
        {
          userName: 'John',
          gracePeriodDays: 3,
          packageName: 'Premium Package',
          updatePaymentUrl: expect.stringContaining('/fitspace/settings'),
        },
      )
    })

    it('should increment retry count on subsequent failures', async () => {
      // Arrange
      const invoice = createMockInvoice()
      const subscription = createMockUserSubscription({
        failedPaymentRetries: 1, // Previous failure
        isInGracePeriod: true,
      })
      const user = createMockUser()
      const packageTemplate = { id: 'pkg_123', name: 'Premium Package' }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        subscription as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockPrisma.prisma.packageTemplate.findUnique).mockResolvedValue(
        packageTemplate as any,
      )
      vi.mocked(mockSendEmail.sendEmail.paymentFailed).mockResolvedValue(
        undefined,
      )

      // Act
      await handlePaymentFailed(invoice as any)

      // Assert - Should increment retry count
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalledWith({
        where: { id: 'sub_123' },
        data: expect.objectContaining({
          failedPaymentRetries: 2,
        }),
      })
    })

    it('should send grace period ending warning on max retries', async () => {
      // Arrange
      const gracePeriodEnd = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      const invoice = createMockInvoice()
      const subscription = createMockUserSubscription({
        failedPaymentRetries: 2, // Will become 3 (max)
        isInGracePeriod: true,
        gracePeriodEnd,
      })
      const user = createMockUser()
      const packageTemplate = { id: 'pkg_123', name: 'Premium Package' }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        subscription as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue({
        ...subscription,
        failedPaymentRetries: 3,
        gracePeriodEnd,
      } as any)
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockPrisma.prisma.packageTemplate.findUnique).mockResolvedValue(
        packageTemplate as any,
      )
      vi.mocked(mockSendEmail.sendEmail.paymentFailed).mockResolvedValue(
        undefined,
      )
      vi.mocked(mockSendEmail.sendEmail.gracePeriodEnding).mockResolvedValue(
        undefined,
      )

      // Act
      await handlePaymentFailed(invoice as any)

      // Assert - Should send grace period ending email
      expect(mockSendEmail.sendEmail.gracePeriodEnding).toHaveBeenCalledWith(
        'user@test.com',
        {
          userName: 'John',
          packageName: 'Premium Package',
          daysRemaining: 1,
          updatePaymentUrl: expect.stringContaining('/fitspace/settings'),
        },
      )
    })

    it('should handle missing subscription gracefully', async () => {
      // Arrange
      const invoice = createMockInvoice()

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        null,
      )

      // Act & Assert - Should not throw
      await expect(handlePaymentFailed(invoice as any)).resolves.not.toThrow()

      // Should not attempt updates
      expect(mockPrisma.prisma.userSubscription.update).not.toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.paymentFailed).not.toHaveBeenCalled()
    })

    it('should handle invoice without subscription ID', async () => {
      // Arrange
      const invoice = createMockInvoice({ subscription: null })

      // Verify the mock is correct
      expect(invoice.subscription).toBeNull()

      // Act & Assert - Should not throw
      await expect(handlePaymentFailed(invoice as any)).resolves.not.toThrow()

      // Should not attempt any database operations
      expect(
        mockPrisma.prisma.userSubscription.findFirst,
      ).not.toHaveBeenCalled()
    })

    it('should handle email send failures gracefully', async () => {
      // Arrange
      const invoice = createMockInvoice()
      const subscription = createMockUserSubscription()
      const user = createMockUser()
      const packageTemplate = { id: 'pkg_123', name: 'Premium Package' }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        subscription as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockPrisma.prisma.packageTemplate.findUnique).mockResolvedValue(
        packageTemplate as any,
      )
      vi.mocked(mockSendEmail.sendEmail.paymentFailed).mockRejectedValue(
        new Error('Email send failed'),
      )

      // Act & Assert - Should not throw even if email fails
      await expect(handlePaymentFailed(invoice as any)).resolves.not.toThrow()

      // Should still update subscription status
      expect(mockPrisma.prisma.userSubscription.update).toHaveBeenCalled()
    })

    it('should calculate grace period correctly', async () => {
      // Arrange
      const invoice = createMockInvoice()
      const subscription = createMockUserSubscription()
      const user = createMockUser()
      const packageTemplate = { id: 'pkg_123', name: 'Premium Package' }

      vi.mocked(mockPrisma.prisma.userSubscription.findFirst).mockResolvedValue(
        subscription as any,
      )
      vi.mocked(mockPrisma.prisma.userSubscription.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findUnique).mockResolvedValue(
        user as any,
      )
      vi.mocked(mockPrisma.prisma.packageTemplate.findUnique).mockResolvedValue(
        packageTemplate as any,
      )
      vi.mocked(mockSendEmail.sendEmail.paymentFailed).mockResolvedValue(
        undefined,
      )

      const startTime = Date.now()

      // Act
      await handlePaymentFailed(invoice as any)

      // Assert - Grace period should be approximately 3 days from now
      const updateCall = vi.mocked(mockPrisma.prisma.userSubscription.update)
        .mock.calls[0]
      const gracePeriodEnd = updateCall[0].data.gracePeriodEnd as Date
      const gracePeriodMs = gracePeriodEnd.getTime() - startTime
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000

      // Allow 1-second tolerance for test execution time
      expect(gracePeriodMs).toBeGreaterThan(threeDaysMs - 1000)
      expect(gracePeriodMs).toBeLessThan(threeDaysMs + 1000)
    })
  })
})
