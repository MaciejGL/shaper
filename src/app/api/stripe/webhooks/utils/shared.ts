import { PackageTemplate, User, UserProfile } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

// Shared utility functions
export async function findUserByStripeCustomerId(
  customerId: string,
): Promise<(User & { profile?: UserProfile | null }) | null> {
  return await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    include: { profile: true },
  })
}

export async function findPackageByStripePriceId(
  priceId: string,
): Promise<PackageTemplate | null> {
  return await prisma.packageTemplate.findFirst({
    where: {
      stripePriceId: priceId,
    },
  })
}
