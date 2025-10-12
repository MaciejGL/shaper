import { PackageTemplate, User, UserProfile } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { resolvePriceIdToLookupKey } from '@/lib/stripe/lookup-keys'

// Shared utility functions
export async function findUserByStripeCustomerId(
  customerId: string,
): Promise<(User & { profile?: UserProfile | null }) | null> {
  return await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    include: { profile: true },
  })
}

/**
 * Find package by Stripe price ID (from webhook)
 * Resolves price ID to lookup key and queries by lookup key
 */
export async function findPackageByStripePriceId(
  priceId: string,
): Promise<PackageTemplate | null> {
  // Resolve price ID to lookup key
  const lookupKey = await resolvePriceIdToLookupKey(priceId)

  if (!lookupKey) {
    console.error(`Could not resolve price ID ${priceId} to lookup key`)
    return null
  }

  return await prisma.packageTemplate.findFirst({
    where: {
      stripeLookupKey: lookupKey,
    },
  })
}
