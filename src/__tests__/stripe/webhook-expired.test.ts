/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleCheckoutExpired } from '@/app/api/stripe/webhooks/handlers/checkout-expired'

// Import mocked modules
const mockPrisma = await import('@/lib/db')
const mockSendEmail = await import('@/lib/email/send-mail')

// Mock the email module
vi.mock('@/lib/email/send-mail', () => ({
  sendEmail: {
    offerExpired: vi.fn(),
  },
}))

// Mock factories
const createMockSession = (overrides: any = {}) => ({
  id: 'cs_test123',
  object: 'checkout.session',
  metadata: {
    offerToken: 'offer_abc123',
    ...overrides.metadata,
  },
  ...overrides,
})

const createMockOffer = (overrides: any = {}) => ({
  id: 'offer_123',
  token: 'offer_abc123',
  status: 'PROCESSING',
  clientEmail: 'client@test.com',
  trainerId: 'trainer_123',
  expiresAt: new Date('2025-02-01'),
  packageSummary: [
    {
      packageId: 'pkg_1',
      quantity: 2,
      name: 'Premium Training',
    },
    {
      packageId: 'pkg_2',
      quantity: 1,
      name: 'Nutrition Plan',
    },
  ],
  trainer: {
    id: 'trainer_123',
    email: 'trainer@test.com',
    name: 'John Trainer',
    profile: {
      firstName: 'John',
    },
  },
  ...overrides,
})

describe('Expired Checkout Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleCheckoutExpired', () => {
    it('should mark offer as EXPIRED when session expires', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer()

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockResolvedValue(
        undefined,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should update offer status to EXPIRED
      expect(mockPrisma.prisma.trainerOffer.update).toHaveBeenCalledWith({
        where: { id: 'offer_123' },
        data: {
          status: 'EXPIRED',
          updatedAt: expect.any(Date),
        },
      })
    })

    it('should send expiration notification email to trainer', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer()

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockResolvedValue(
        undefined,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should send email with correct details
      expect(mockSendEmail.sendEmail.offerExpired).toHaveBeenCalledWith(
        'trainer@test.com',
        {
          trainerName: 'John',
          clientEmail: 'client@test.com',
          bundleDescription: '2x Premium Training, 1x Nutrition Plan',
          expiresAt: expect.any(String),
        },
      )
    })

    it('should format package summary correctly', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        packageSummary: [
          { packageId: 'pkg_1', quantity: 5, name: 'Sessions' },
          { packageId: 'pkg_2', quantity: 3, name: 'Meal Plans' },
        ],
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockResolvedValue(
        undefined,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should format package summary
      expect(mockSendEmail.sendEmail.offerExpired).toHaveBeenCalledWith(
        'trainer@test.com',
        expect.objectContaining({
          bundleDescription: '5x Sessions, 3x Meal Plans',
        }),
      )
    })

    it('should use fallback description for empty package summary', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        packageSummary: [],
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockResolvedValue(
        undefined,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should use fallback
      expect(mockSendEmail.sendEmail.offerExpired).toHaveBeenCalledWith(
        'trainer@test.com',
        expect.objectContaining({
          bundleDescription: 'Training package',
        }),
      )
    })

    it('should use fallback description for null package summary', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        packageSummary: null,
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockResolvedValue(
        undefined,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should use fallback
      expect(mockSendEmail.sendEmail.offerExpired).toHaveBeenCalledWith(
        'trainer@test.com',
        expect.objectContaining({
          bundleDescription: 'Training package',
        }),
      )
    })

    it('should NOT mark offer as expired if already COMPLETED', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        status: 'COMPLETED',
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should not update or send email
      expect(mockPrisma.prisma.trainerOffer.update).not.toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.offerExpired).not.toHaveBeenCalled()
    })

    it('should NOT mark offer as expired if already EXPIRED', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        status: 'EXPIRED',
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should not update or send email
      expect(mockPrisma.prisma.trainerOffer.update).not.toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.offerExpired).not.toHaveBeenCalled()
    })

    it('should NOT mark offer as expired if CANCELLED', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        status: 'CANCELLED',
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should not update or send email
      expect(mockPrisma.prisma.trainerOffer.update).not.toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.offerExpired).not.toHaveBeenCalled()
    })

    it('should handle missing offer token in metadata gracefully', async () => {
      // Arrange
      const session = createMockSession({
        metadata: {}, // No offerToken
      })

      // Act & Assert - Should not throw
      await expect(handleCheckoutExpired(session as any)).resolves.not.toThrow()

      // Should not query for offer
      expect(mockPrisma.prisma.trainerOffer.findUnique).not.toHaveBeenCalled()
    })

    it('should handle offer not found gracefully', async () => {
      // Arrange
      const session = createMockSession()

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        null,
      )

      // Act & Assert - Should not throw
      await expect(handleCheckoutExpired(session as any)).resolves.not.toThrow()

      // Should not attempt update
      expect(mockPrisma.prisma.trainerOffer.update).not.toHaveBeenCalled()
    })

    it('should handle trainer without email gracefully', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        trainer: {
          id: 'trainer_123',
          email: null, // No email
          name: 'John Trainer',
          profile: { firstName: 'John' },
        },
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should update offer but not send email
      expect(mockPrisma.prisma.trainerOffer.update).toHaveBeenCalled()
      expect(mockSendEmail.sendEmail.offerExpired).not.toHaveBeenCalled()
    })

    it('should use fallback trainer name when profile is missing', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        trainer: {
          id: 'trainer_123',
          email: 'trainer@test.com',
          name: 'Full Name',
          profile: null, // No profile
        },
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockResolvedValue(
        undefined,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should use name as fallback
      expect(mockSendEmail.sendEmail.offerExpired).toHaveBeenCalledWith(
        'trainer@test.com',
        expect.objectContaining({
          trainerName: 'Full Name',
        }),
      )
    })

    it('should use generic trainer name when both profile and name are missing', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        trainer: {
          id: 'trainer_123',
          email: 'trainer@test.com',
          name: null,
          profile: null,
        },
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockResolvedValue(
        undefined,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should use 'Trainer' as fallback
      expect(mockSendEmail.sendEmail.offerExpired).toHaveBeenCalledWith(
        'trainer@test.com',
        expect.objectContaining({
          trainerName: 'Trainer',
        }),
      )
    })

    it('should continue processing even if email send fails', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer()

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockRejectedValue(
        new Error('Email send failed'),
      )

      // Act & Assert - Should not throw
      await expect(handleCheckoutExpired(session as any)).resolves.not.toThrow()

      // Should still update the offer
      expect(mockPrisma.prisma.trainerOffer.update).toHaveBeenCalled()
    })

    it('should handle database update failure gracefully', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer()

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockRejectedValue(
        new Error('Database error'),
      )

      // Act & Assert - Should not crash but log error
      await expect(handleCheckoutExpired(session as any)).resolves.not.toThrow()
    })

    it('should handle database query failure gracefully', async () => {
      // Arrange
      const session = createMockSession()

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockRejectedValue(
        new Error('Database connection lost'),
      )

      // Act & Assert - Should not crash but log error
      await expect(handleCheckoutExpired(session as any)).resolves.not.toThrow()
    })

    it('should format expiration date correctly', async () => {
      // Arrange
      const session = createMockSession()
      const expiresDate = new Date('2025-03-15')
      const offer = createMockOffer({
        expiresAt: expiresDate,
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockResolvedValue(
        undefined,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should format date
      expect(mockSendEmail.sendEmail.offerExpired).toHaveBeenCalledWith(
        'trainer@test.com',
        expect.objectContaining({
          expiresAt: expect.stringContaining('2025'),
        }),
      )
    })

    it('should handle PROCESSING status case-sensitively', async () => {
      // Arrange
      const session = createMockSession()
      const offer = createMockOffer({
        status: 'PROCESSING', // Exact match
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        offer as any,
      )
      vi.mocked(mockPrisma.prisma.trainerOffer.update).mockResolvedValue(
        {} as any,
      )
      vi.mocked(mockSendEmail.sendEmail.offerExpired).mockResolvedValue(
        undefined,
      )

      // Act
      await handleCheckoutExpired(session as any)

      // Assert - Should process
      expect(mockPrisma.prisma.trainerOffer.update).toHaveBeenCalled()
    })

    it('should handle offer with different token gracefully', async () => {
      // Arrange
      const session = createMockSession({
        metadata: {
          offerToken: 'different_token',
        },
      })

      vi.mocked(mockPrisma.prisma.trainerOffer.findUnique).mockResolvedValue(
        null, // Offer not found
      )

      // Act & Assert - Should not throw
      await expect(handleCheckoutExpired(session as any)).resolves.not.toThrow()

      // Should query with correct token
      expect(mockPrisma.prisma.trainerOffer.findUnique).toHaveBeenCalledWith({
        where: { token: 'different_token' },
        include: {
          trainer: { include: { profile: true } },
        },
      })
    })
  })
})
