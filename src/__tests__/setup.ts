import { vi } from 'vitest'

// Mock Stripe module
vi.mock('@/lib/stripe/stripe', () => ({
  stripe: {
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
    },
    prices: {
      retrieve: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    paymentIntents: {
      retrieve: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

// Mock Prisma with comprehensive coverage
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userSubscription: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    trainerOffer: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    packageTemplate: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Mock email service
vi.mock('@/lib/email/send-mail', () => ({
  sendEmail: {
    paymentFailed: vi.fn(),
    gracePeriodEnding: vi.fn(),
    subscriptionDeleted: vi.fn(),
    subscriptionCreated: vi.fn(),
    subscriptionWelcome: vi.fn(),
  },
}))
