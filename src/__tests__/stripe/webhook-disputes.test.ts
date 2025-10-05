/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleDisputeCreated } from '@/app/api/stripe/webhooks/handlers/dispute-created'

// Import mocked modules
const mockPrisma = await import('@/lib/db')
const mockStripe = await import('@/lib/stripe/stripe')
const mockSendEmail = await import('@/lib/email/send-mail')

// Mock the email module
vi.mock('@/lib/email/send-mail', () => ({
  sendEmail: {
    disputeAlert: vi.fn(),
  },
}))

// Mock factories
const createMockDispute = (overrides: any = {}) => ({
  id: 'dp_test123',
  object: 'dispute',
  amount: 10000, // $100.00
  currency: 'usd',
  charge: 'ch_test123',
  status: 'needs_response',
  reason: 'fraudulent',
  evidence_details: {
    due_by: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days from now
  },
  ...overrides,
})

const createMockCharge = (overrides: any = {}) => ({
  id: 'ch_test123',
  object: 'charge',
  payment_intent: 'pi_test123',
  ...overrides,
})

const createMockDelivery = (overrides: any = {}) => ({
  id: 'delivery_123',
  clientId: 'client_123',
  trainerId: 'trainer_123',
  packageId: 'pkg_123',
  packageName: 'Premium Package',
  stripePaymentIntentId: 'pi_test123',
  disputedAt: null,
  disputeStatus: null,
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

const createMockAdmin = (overrides: any = {}) => ({
  email: 'admin@test.com',
  name: 'Admin User',
  ...overrides,
})

describe('Dispute Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleDisputeCreated', () => {
    it('should mark service delivery as disputed', async () => {
      // Arrange
      const dispute = createMockDispute()
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should update delivery with dispute data
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery_123' },
        data: {
          disputedAt: expect.any(Date),
          disputeStatus: 'needs_response',
        },
      })
    })

    it('should send dispute alert emails to all admins', async () => {
      // Arrange
      const dispute = createMockDispute()
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin1 = createMockAdmin({
        email: 'admin1@test.com',
        name: 'Admin 1',
      })
      const admin2 = createMockAdmin({
        email: 'admin2@test.com',
        name: 'Admin 2',
      })

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin1 as any,
        admin2 as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should send emails to both admins
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledTimes(2)
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledWith(
        'admin1@test.com',
        expect.objectContaining({
          adminName: 'Admin 1',
          disputeId: 'dp_test123',
          chargeId: 'ch_test123',
          amount: '100.00',
          currency: 'USD',
          reason: 'Fraudulent',
          trainerName: 'John',
          clientName: 'Jane',
        }),
      )
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledWith(
        'admin2@test.com',
        expect.objectContaining({
          adminName: 'Admin 2',
        }),
      )
    })

    it('should include Stripe dashboard URL in alert', async () => {
      // Arrange
      const dispute = createMockDispute({ id: 'dp_specific123' })
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should include correct dashboard URL
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledWith(
        'admin@test.com',
        expect.objectContaining({
          stripeDashboardUrl:
            'https://dashboard.stripe.com/disputes/dp_specific123',
        }),
      )
    })

    it('should format evidence due date correctly', async () => {
      // Arrange
      const dueDate = new Date('2025-02-01')
      const dispute = createMockDispute({
        evidence_details: {
          due_by: Math.floor(dueDate.getTime() / 1000),
        },
      })
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should format date
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledWith(
        'admin@test.com',
        expect.objectContaining({
          evidenceDueBy: expect.stringContaining('2025'),
        }),
      )
    })

    it('should handle dispute without evidence due date', async () => {
      // Arrange
      const dispute = createMockDispute({
        evidence_details: null,
      })
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should show N/A for missing due date
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledWith(
        'admin@test.com',
        expect.objectContaining({
          evidenceDueBy: 'N/A',
        }),
      )
    })

    it('should format different dispute reasons correctly', async () => {
      // Arrange
      const dispute = createMockDispute({
        reason: 'product_not_received',
      })
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should format reason
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledWith(
        'admin@test.com',
        expect.objectContaining({
          reason: 'Product not received',
        }),
      )
    })

    it('should handle multiple service deliveries for one payment', async () => {
      // Arrange
      const dispute = createMockDispute()
      const charge = createMockCharge()
      const delivery1 = createMockDelivery({ id: 'delivery_1' })
      const delivery2 = createMockDelivery({ id: 'delivery_2' })
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery1 as any,
        delivery2 as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

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
    })

    it('should handle missing charge ID gracefully', async () => {
      // Arrange
      const dispute = createMockDispute({ charge: null })

      // Act & Assert - Should not throw
      await expect(handleDisputeCreated(dispute as any)).resolves.not.toThrow()

      // Should not attempt Stripe charge retrieval
      expect(mockStripe.stripe.charges.retrieve).not.toHaveBeenCalled()
    })

    it('should handle charge as object instead of string', async () => {
      // Arrange
      const dispute = createMockDispute({
        charge: {
          id: 'ch_test123',
          object: 'charge',
        },
      })
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should extract ID from object
      expect(mockStripe.stripe.charges.retrieve).toHaveBeenCalledWith(
        'ch_test123',
      )
    })

    it('should handle charge without payment intent', async () => {
      // Arrange
      const dispute = createMockDispute()
      const charge = createMockCharge({ payment_intent: null })

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )

      // Act & Assert - Should not throw
      await expect(handleDisputeCreated(dispute as any)).resolves.not.toThrow()

      // Should not query for deliveries
      expect(mockPrisma.prisma.serviceDelivery.findMany).not.toHaveBeenCalled()
    })

    it('should handle no service deliveries found (log warning)', async () => {
      // Arrange
      const dispute = createMockDispute()
      const charge = createMockCharge()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue(
        [],
      )

      // Act & Assert - Should not throw
      await expect(handleDisputeCreated(dispute as any)).resolves.not.toThrow()

      // Should not attempt to update or send emails
      expect(mockPrisma.prisma.serviceDelivery.update).not.toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.disputeAlert).not.toHaveBeenCalled()
    })

    it('should handle no admin users found', async () => {
      // Arrange
      const dispute = createMockDispute()
      const charge = createMockCharge()
      const delivery = createMockDelivery()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([])

      // Act & Assert - Should not throw
      await expect(handleDisputeCreated(dispute as any)).resolves.not.toThrow()

      // Should update deliveries but not send emails
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.disputeAlert).not.toHaveBeenCalled()
    })

    it('should continue processing even if email fails for one admin', async () => {
      // Arrange
      const dispute = createMockDispute()
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin1 = createMockAdmin({ email: 'admin1@test.com' })
      const admin2 = createMockAdmin({ email: 'admin2@test.com' })

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin1 as any,
        admin2 as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert)
        .mockRejectedValueOnce(new Error('Email send failed'))
        .mockResolvedValueOnce(undefined)

      // Act & Assert - Should not throw
      await expect(handleDisputeCreated(dispute as any)).resolves.not.toThrow()

      // Should still attempt to send to second admin
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledTimes(2)
    })

    it('should handle different currencies correctly', async () => {
      // Arrange
      const dispute = createMockDispute({
        currency: 'nok',
        amount: 50000, // 500 NOK
      })
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should show currency as uppercase
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledWith(
        'admin@test.com',
        expect.objectContaining({
          amount: '500.00',
          currency: 'NOK',
        }),
      )
    })

    it('should handle different dispute statuses', async () => {
      // Arrange
      const dispute = createMockDispute({
        status: 'under_review',
      })
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should store correct status
      expect(mockPrisma.prisma.serviceDelivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery_123' },
        data: {
          disputedAt: expect.any(Date),
          disputeStatus: 'under_review',
        },
      })
    })

    it('should handle missing trainer/client profile data', async () => {
      // Arrange
      const dispute = createMockDispute()
      const charge = createMockCharge()
      const delivery = createMockDelivery({
        trainer: {
          id: 'trainer_123',
          email: 'trainer@test.com',
          name: null,
          profile: null,
        },
        client: {
          id: 'client_123',
          email: 'client@test.com',
          name: null,
          profile: null,
        },
      })
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should handle undefined names
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledWith(
        'admin@test.com',
        expect.objectContaining({
          trainerName: undefined,
          clientName: undefined,
        }),
      )
    })

    it('should handle Stripe API failure when retrieving charge', async () => {
      // Arrange
      const dispute = createMockDispute()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockRejectedValue(
        new Error('Stripe API error'),
      )

      // Act & Assert - Should not crash
      await expect(handleDisputeCreated(dispute as any)).resolves.not.toThrow()

      // Should not proceed with delivery updates
      expect(mockPrisma.prisma.serviceDelivery.findMany).not.toHaveBeenCalled()
    })

    it('should handle database update failure gracefully', async () => {
      // Arrange
      const dispute = createMockDispute()
      const charge = createMockCharge()
      const delivery = createMockDelivery()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockRejectedValue(
        new Error('Database error'),
      )

      // Act & Assert - Should not crash but log error
      await expect(handleDisputeCreated(dispute as any)).resolves.not.toThrow()
    })

    it('should handle unknown dispute reason', async () => {
      // Arrange
      const dispute = createMockDispute({
        reason: 'some_new_reason_type',
      })
      const charge = createMockCharge()
      const delivery = createMockDelivery()
      const admin = createMockAdmin()

      vi.mocked(mockStripe.stripe.charges.retrieve).mockResolvedValue(
        charge as any,
      )
      vi.mocked(mockPrisma.prisma.serviceDelivery.findMany).mockResolvedValue([
        delivery as any,
      ])
      vi.mocked(mockPrisma.prisma.serviceDelivery.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockPrisma.prisma.user.findMany).mockResolvedValue([
        admin as any,
      ])
      vi.mocked(mockSendEmail.sendEmail.disputeAlert).mockResolvedValue(
        undefined,
      )

      // Act
      await handleDisputeCreated(dispute as any)

      // Assert - Should format unknown reason by replacing underscores
      expect(mockSendEmail.sendEmail.disputeAlert).toHaveBeenCalledWith(
        'admin@test.com',
        expect.objectContaining({
          reason: 'some new reason type',
        }),
      )
    })
  })
})
