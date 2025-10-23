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
      list: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    paymentIntents: {
      retrieve: vi.fn(),
    },
    charges: {
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
      findMany: vi.fn(),
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
    serviceDelivery: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
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
    refundNotification: vi.fn(),
    disputeAlert: vi.fn(),
    offerExpired: vi.fn(),
  },
}))

// Mock auth config
vi.mock('@lib/auth/config', () => ({
  authOptions: {},
}))

// Mock support chat
vi.mock('@/lib/support-chat', () => ({
  updateUserInSupportChat: vi.fn(),
  createSupportChatForUser: vi.fn(),
}))

// Mock lookup keys
vi.mock('@/lib/stripe/lookup-keys', () => ({
  STRIPE_LOOKUP_KEYS: {
    PREMIUM_MONTHLY: 'premium_monthly',
    PREMIUM_YEARLY: 'premium_yearly',
    PREMIUM_COACHING: 'premium_coaching',
  },
  getPremiumLookupKeys: vi.fn(() => [
    'premium_monthly',
    'premium_yearly',
    'premium_coaching',
  ]),
  resolvePriceIdToLookupKey: vi.fn(),
}))

// Mock webhook utils
vi.mock('@/app/api/stripe/webhooks/utils/shared', () => ({
  findUserByStripeCustomerId: vi.fn(),
  findPackageByStripePriceId: vi.fn(),
  resolvePriceIdToLookupKey: vi.fn(),
}))
