/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server'
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// We'll test the webhook route directly since it contains the signature verification
import { POST } from '@/app/api/stripe/webhooks/route'

// Mock Stripe
const mockStripe = await import('@/lib/stripe/stripe')

// Import mocked handlers
const mockCheckoutHandlers = await import(
  '@/app/api/stripe/webhooks/handlers/checkout-completed'
)
const mockSubscriptionHandlers = await import(
  '@/app/api/stripe/webhooks/handlers/subscription-created'
)
const mockPaymentHandlers = await import(
  '@/app/api/stripe/webhooks/handlers/payment-succeeded'
)

// Mock all webhook handlers (using vi.fn() directly to avoid hoisting issues)
vi.mock('@/app/api/stripe/webhooks/handlers/checkout-completed', () => ({
  handleCheckoutCompleted: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/subscription-created', () => ({
  handleSubscriptionCreated: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/payment-succeeded', () => ({
  handlePaymentSucceeded: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/subscription-updated', () => ({
  handleSubscriptionUpdated: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/subscription-deleted', () => ({
  handleSubscriptionDeleted: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/payment-failed', () => ({
  handlePaymentFailed: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/checkout-expired', () => ({
  handleCheckoutExpired: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/payment-intent-succeeded', () => ({
  handlePaymentIntentSucceeded: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/payment-intent-failed', () => ({
  handlePaymentIntentFailed: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/trial-will-end', () => ({
  handleTrialWillEnd: vi.fn(),
}))
vi.mock('@/app/api/stripe/webhooks/handlers/customer-deleted', () => ({
  handleCustomerDeleted: vi.fn(),
}))

// Mock environment variables
const originalEnv = process.env

// Set environment before importing
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123'

beforeEach(() => {
  process.env = {
    ...originalEnv,
    STRIPE_WEBHOOK_SECRET: 'whsec_test123',
  }
  vi.clearAllMocks()
})

afterEach(() => {
  // Ensure webhook secret is always available
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123'
})

// Helper to create mock request
const createMockRequest = (body: string, signature?: string) => {
  const headers = new Headers()
  if (signature) {
    headers.set('stripe-signature', signature)
  }

  return {
    text: vi.fn().mockResolvedValue(body),
    headers,
  } as unknown as NextRequest
}

describe('Webhook Security', () => {
  describe('signature verification', () => {
    it('should reject requests without stripe-signature header', async () => {
      // Arrange
      const request = createMockRequest('{"type": "test"}')

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing signature')
    })

    it('should reject requests with invalid signature', async () => {
      // Arrange
      const request = createMockRequest('{"type": "test"}', 'invalid_signature')

      vi.mocked(mockStripe.stripe.webhooks.constructEvent).mockImplementation(
        () => {
          throw new Error('Invalid signature')
        },
      )

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid signature')
    })

    it('should process requests with valid signature', async () => {
      // Arrange
      const eventBody =
        '{"type": "checkout.session.completed", "data": {"object": {"id": "cs_test"}}}'
      const request = createMockRequest(eventBody, 'valid_signature')

      const mockEvent = {
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test' } },
      }

      vi.mocked(mockStripe.stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any,
      )

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockStripe.stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        eventBody,
        'valid_signature',
        'whsec_test123',
      )
      expect(
        vi.mocked(mockCheckoutHandlers.handleCheckoutCompleted),
      ).toHaveBeenCalledWith({
        id: 'cs_test',
      })
    })

    it('should handle missing webhook secret gracefully', async () => {
      // Arrange
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET
      delete process.env.STRIPE_WEBHOOK_SECRET
      const request = createMockRequest('{"type": "test"}', 'signature')

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook not configured')

      // Restore for next tests
      process.env.STRIPE_WEBHOOK_SECRET = originalSecret
    })
  })

  describe('event handling', () => {
    beforeEach(() => {
      // Mock successful signature verification for these tests
      vi.mocked(mockStripe.stripe.webhooks.constructEvent).mockImplementation(
        (body) => {
          return JSON.parse(body.toString())
        },
      )
    })

    it('should handle checkout.session.completed events', async () => {
      // Arrange
      const eventBody = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test', mode: 'payment' } },
      })
      const request = createMockRequest(eventBody, 'valid_signature')

      // Act
      await POST(request)

      // Assert
      expect(
        vi.mocked(mockCheckoutHandlers.handleCheckoutCompleted),
      ).toHaveBeenCalledWith({
        id: 'cs_test',
        mode: 'payment',
      })
    })

    it('should handle customer.subscription.created events', async () => {
      // Arrange
      const eventBody = JSON.stringify({
        type: 'customer.subscription.created',
        data: { object: { id: 'sub_test', status: 'active' } },
      })
      const request = createMockRequest(eventBody, 'valid_signature')

      // Act
      await POST(request)

      // Assert
      expect(
        mockSubscriptionHandlers.handleSubscriptionCreated,
      ).toHaveBeenCalledWith({
        id: 'sub_test',
        status: 'active',
      })
    })

    it('should handle invoice.payment_succeeded events', async () => {
      // Arrange
      const eventBody = JSON.stringify({
        type: 'invoice.payment_succeeded',
        data: { object: { id: 'in_test', subscription: 'sub_test' } },
      })
      const request = createMockRequest(eventBody, 'valid_signature')

      // Act
      await POST(request)

      // Assert
      expect(mockPaymentHandlers.handlePaymentSucceeded).toHaveBeenCalledWith({
        id: 'in_test',
        subscription: 'sub_test',
      })
    })

    it('should log unhandled event types without throwing', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      const eventBody = JSON.stringify({
        type: 'unknown.event.type',
        data: { object: { id: 'test' } },
      })
      const request = createMockRequest(eventBody, 'valid_signature')

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Unhandled event type: unknown.event.type',
      )

      consoleSpy.mockRestore()
    })

    it('should handle handler errors gracefully', async () => {
      // Arrange
      vi.mocked(mockCheckoutHandlers.handleCheckoutCompleted).mockRejectedValue(
        new Error('Handler failed'),
      )

      const eventBody = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test' } },
      })
      const request = createMockRequest(eventBody, 'valid_signature')

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook handler failed')
    })
  })

  describe('idempotency and reliability', () => {
    beforeEach(() => {
      // Ensure environment is set up for this test group
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123'
      vi.mocked(mockStripe.stripe.webhooks.constructEvent).mockImplementation(
        (body) => JSON.parse(body.toString()),
      )
    })

    it('should process duplicate events without issues', async () => {
      // Arrange
      // Ensure mock handler doesn't throw errors
      vi.mocked(mockCheckoutHandlers.handleCheckoutCompleted).mockResolvedValue(
        undefined,
      )

      const eventBody = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_duplicate' } },
      })
      const request = createMockRequest(eventBody, 'valid_signature')

      // Act - Process same event twice
      const response1 = await POST(request)
      const response2 = await POST(request)

      // Assert - Both should succeed
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(
        vi.mocked(mockCheckoutHandlers.handleCheckoutCompleted),
      ).toHaveBeenCalledTimes(2)
    })

    it('should handle malformed JSON gracefully', async () => {
      // Arrange
      const request = createMockRequest('invalid json', 'valid_signature')

      vi.mocked(mockStripe.stripe.webhooks.constructEvent).mockImplementation(
        () => {
          throw new SyntaxError('Invalid JSON')
        },
      )

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid signature')
    })
  })
})

// Restore environment after tests
afterAll(() => {
  process.env = originalEnv
})
