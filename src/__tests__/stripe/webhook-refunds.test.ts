/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleChargeRefunded } from '@/app/api/stripe/webhooks/handlers/charge-refunded'

// Import mocked modules
const mockPrisma = await import('@/lib/db')
const mockSendEmail = await import('@/lib/email/send-mail')

// Mock the email module
vi.mock('@/lib/email/send-mail', () => ({
  sendEmail: {
    refundNotification: vi.fn(),
  },
}))

// Mock factories
const createMockCharge = (overrides: any = {}) => ({
  id: 'ch_test123',
  object: 'charge',
  amount: 10000, // $100.00
  amount_refunded: 10000,
  currency: 'usd',
  payment_intent: 'pi_test123',
  refunds: {
    data: [
      {
        id: 're_test123',
        reason: 'requested_by_customer',
        amount: 10000,
      },
    ],
  },
  ...overrides,
})

const createMockDelivery = (overrides: any = {}) => ({
  id: 'delivery_123',
  clientId: 'client_123',
  trainerId: 'trainer_123',
  packageId: 'pkg_123',
  packageName: 'Premium Package',
  stripePaymentIntentId: 'pi_test123',
  refundedAt: null,
  refundReason: null,
  trainer: {
    id: 'trainer_123',
    email: 'trainer@test.com',
    name: 'John Trainer',
    profile: {
      firstName: 'John',
    },
  },
  client: {
    id: 'client_123',
    email: 'client@test.com',
    name: 'Jane Client',
    profile: {
      firstName: 'Jane',
    },
  },
  ...overrides,
})

describe('Refund Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleChargeRefunded', () => {
    it('should mark service delivery as refunded', async () => {
      // Arrange
      const charge = createMockCharge()
      const delivery = createMockDelivery()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockResolvedValue(
        undefined,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should update delivery with refund data
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery_123' },
        data: {
          refundedAt: expect.any(Date),
          refundReason: 'requested_by_customer',
        },
      })
    })

    it('should send refund notification email to trainer', async () => {
      // Arrange
      const charge = createMockCharge()
      const delivery = createMockDelivery()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockResolvedValue(
        undefined,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should send email with correct details
      expect(mockSendEmail.sendEmail.refundNotification).toHaveBeenCalledWith(
        'trainer@test.com',
        {
          trainerName: 'John',
          clientName: 'Jane',
          packageName: 'Premium Package',
          refundAmount: '100.00',
          currency: 'USD',
          refundReason: 'Requested by customer',
        },
      )
    })

    it('should handle partial refunds correctly', async () => {
      // Arrange
      const charge = createMockCharge({
        amount: 10000, // Original $100
        amount_refunded: 5000, // $50 refunded
        refunds: {
          data: [
            {
              id: 're_test123',
              reason: 'requested_by_customer',
              amount: 5000,
            },
          ],
        },
      })
      const delivery = createMockDelivery()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockResolvedValue(
        undefined,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should show partial refund amount
      expect(mockSendEmail.sendEmail.refundNotification).toHaveBeenCalledWith(
        'trainer@test.com',
        expect.objectContaining({
          refundAmount: '50.00', // Half the original amount
        }),
      )
    })

    it('should handle multiple service deliveries for one payment', async () => {
      // Arrange
      const charge = createMockCharge()
      const delivery1 = createMockDelivery({ id: 'delivery_1' })
      const delivery2 = createMockDelivery({ id: 'delivery_2' })

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery1 as any,
        delivery2 as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockResolvedValue(
        undefined,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should update both deliveries
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalledTimes(2)
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery_1' },
        data: expect.any(Object),
      })
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery_2' },
        data: expect.any(Object),
      })

      // Should send 2 emails (one per delivery)
      expect(mockSendEmail.sendEmail.refundNotification).toHaveBeenCalledTimes(
        2,
      )
    })

    it('should handle missing payment intent gracefully', async () => {
      // Arrange
      const charge = createMockCharge({ payment_intent: null })

      // Act & Assert - Should not throw
      await expect(handleChargeRefunded(charge as any)).resolves.not.toThrow()

      // Should not attempt any database operations
      expect(mockPrisma.prisma.serviceDelivery.findMany).not.toHaveBeenCalled()
    })

    it('should handle no service deliveries found (log warning)', async () => {
      // Arrange
      const charge = createMockCharge()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue(
        [],
      )

      // Act & Assert - Should not throw
      await expect(handleChargeRefunded(charge as any)).resolves.not.toThrow()

      // Should not attempt to update or send emails
      expect(mockPrisma.prisma.serviceDelivery.update).not.toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.refundNotification).not.toHaveBeenCalled()
    })

    it('should continue processing even if email fails', async () => {
      // Arrange
      const charge = createMockCharge()
      const delivery = createMockDelivery()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockRejectedValue(
        new Error('Email send failed'),
      )

      // Act & Assert - Should not throw even if email fails
      await expect(handleChargeRefunded(charge as any)).resolves.not.toThrow()

      // Should still update the database
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalled()
    })

    it('should handle trainer without email', async () => {
      // Arrange
      const charge = createMockCharge()
      const delivery = createMockDelivery({
        trainer: {
          id: 'trainer_123',
          email: null, // No email
          name: 'John Trainer',
          profile: { firstName: 'John' },
        },
      })

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should update delivery but not send email
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.refundNotification).not.toHaveBeenCalled()
    })

    it('should format different refund reasons correctly', async () => {
      // Arrange
      const charge = createMockCharge({
        refunds: {
          data: [
            {
              id: 're_test123',
              reason: 'fraudulent',
              amount: 10000,
            },
          ],
        },
      })
      const delivery = createMockDelivery()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockResolvedValue(
        undefined,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should format the refund reason
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery_123' },
        data: {
          refundedAt: expect.any(Date),
          refundReason: 'fraudulent',
        },
      })
    })

    it('should handle different currencies correctly', async () => {
      // Arrange
      const charge = createMockCharge({
        currency: 'nok', // Norwegian currency
        amount_refunded: 50000, // 500 NOK
      })
      const delivery = createMockDelivery()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockResolvedValue(
        undefined,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should show currency as uppercase
      expect(mockSendEmail.sendEmail.refundNotification).toHaveBeenCalledWith(
        'trainer@test.com',
        expect.objectContaining({
          refundAmount: '500.00',
          currency: 'NOK',
        }),
      )
    })

    it('should handle charge with payment_intent as object', async () => {
      // Arrange
      const charge = createMockCharge({
        payment_intent: {
          id: 'pi_test123',
          object: 'payment_intent',
        },
      })
      const delivery = createMockDelivery()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockResolvedValue(
        undefined,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should extract ID from object correctly
      expect(mockPrisma.prisma.serviceDelivery.findMany).toHaveBeenCalledWith({
        where: { stripePaymentIntentId: 'pi_test123' },
        include: expect.any(Object),
      })
    })

    it('should handle database update failure gracefully', async () => {
      // Arrange
      const charge = createMockCharge()
      const delivery = createMockDelivery()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockRejectedValue(
        new Error('Database error'),
      )

      // Act & Assert - Should not crash but log error
      await expect(handleChargeRefunded(charge as any)).resolves.not.toThrow()
    })

    it('should handle refund without reason (default to requested_by_customer)', async () => {
      // Arrange
      const charge = createMockCharge({
        refunds: {
          data: [
            {
              id: 're_test123',
              reason: null, // No reason provided
              amount: 10000,
            },
          ],
        },
      })
      const delivery = createMockDelivery()

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockResolvedValue(
        undefined,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should default to requested_by_customer
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery_123' },
        data: {
          refundedAt: expect.any(Date),
          refundReason: 'requested_by_customer',
        },
      })
    })

    it('should handle trainer/client with missing profile data', async () => {
      // Arrange
      const charge = createMockCharge()
      const delivery = createMockDelivery({
        trainer: {
          id: 'trainer_123',
          email: 'trainer@test.com',
          name: null,
          profile: null, // No profile
        },
        client: {
          id: 'client_123',
          email: 'client@test.com',
          name: null,
          profile: null,
        },
      })

      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.refundNotification).mockResolvedValue(
        undefined,
      )

      // Act
      await handleChargeRefunded(charge as any)

      // Assert - Should use fallback names
      expect(mockSendEmail.sendEmail.refundNotification).toHaveBeenCalledWith(
        'trainer@test.com',
        expect.objectContaining({
          trainerName: 'Trainer', // Fallback
          clientName: 'Client', // Fallback
        }),
      )
    })
  })
})
