import { NextRequest } from 'next/server'

import { prisma } from '@/lib/db'
import { getMultipleStripePrices } from '@/lib/stripe/pricing-utils'
import { PackageSummary } from '@/types/trainer-offer'

/**
 * Validates trainer offer query parameters and user authorization
 */
export interface ValidateTrainerOfferParamsResult {
  clientEmail: string
  trainerId: string
  status?: string
}

export function validateTrainerOfferParams(
  req: NextRequest,
  currentUserId: string,
): ValidateTrainerOfferParamsResult {
  const { searchParams } = new URL(req.url)
  const clientEmail = searchParams.get('clientEmail')
  const trainerId = searchParams.get('trainerId')
  const status = searchParams.get('status')

  if (!clientEmail || !trainerId) {
    throw new Error('Missing clientEmail or trainerId')
  }

  // Verify the trainer is accessing their own offers
  if (currentUserId !== trainerId) {
    throw new Error('Forbidden: Cannot access other trainer offers')
  }

  return {
    clientEmail,
    trainerId,
    status: status || undefined,
  }
}

/**
 * Builds the where clause for trainer offer database query
 */
export function buildTrainerOfferWhereClause(
  params: ValidateTrainerOfferParamsResult,
) {
  const whereClause: {
    trainerId: string
    clientEmail: string
    status?: string
  } = {
    trainerId: params.trainerId,
    clientEmail: params.clientEmail,
  }

  if (params.status && params.status !== 'all') {
    whereClause.status = params.status.toUpperCase()
  }

  return whereClause
}

/**
 * Fetches trainer offers from database with related trainer info
 */
export async function fetchTrainerOffers(
  whereClause: ReturnType<typeof buildTrainerOfferWhereClause>,
) {
  return await prisma.trainerOffer.findMany({
    where: whereClause,
    include: {
      trainer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Extracts unique lookup keys from offers and fetches pricing data from Stripe
 */
export async function fetchOfferPricingData(
  offers: Awaited<ReturnType<typeof fetchTrainerOffers>>,
) {
  // Get unique lookup keys from packageSummary for Stripe lookup
  const lookupKeys = offers
    .flatMap((offer) => {
      const packageSummary = offer.packageSummary as PackageSummary | null
      return packageSummary?.map((item) => item.stripeLookupKey) || []
    })
    .filter((key): key is string => Boolean(key))

  // Fetch pricing data from Stripe
  return lookupKeys.length > 0 ? await getMultipleStripePrices(lookupKeys) : {}
}

/**
 * Creates a fallback offer item when packageSummary is missing or empty
 */
function createFallbackOfferItem(
  offer: Awaited<ReturnType<typeof fetchTrainerOffers>>[0],
) {
  return {
    id: offer.id,
    token: offer.token,
    packageName: 'Unknown Package',
    packageDescription: null,
    amount: 0,
    currency: 'USD',
    type: 'one-time' as const,
    recurring: null,
    status: offer.status.toLowerCase(),
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
    expiresAt: offer.expiresAt.toISOString(),
    completedAt: offer.completedAt?.toISOString() || null,
    personalMessage: offer.personalMessage,
    clientEmail: offer.clientEmail,
    services: [],
    stripeLookupKey: null,
    quantity: 1, // Default quantity for fallback
  }
}

/**
 * Creates an offer item from a package summary item with pricing data
 */
function createOfferItemFromPackage(
  offer: Awaited<ReturnType<typeof fetchTrainerOffers>>[0],
  packageItem: PackageSummary[0],
  index: number,
  pricingData: Awaited<ReturnType<typeof fetchOfferPricingData>>,
  totalPackages: number,
) {
  const stripeLookupKey = packageItem.stripeLookupKey
  const pricing = stripeLookupKey ? pricingData[stripeLookupKey] : null

  return {
    id: totalPackages === 1 ? offer.id : `${offer.id}-item-${index}`,
    token: offer.token,
    packageName: packageItem.name || 'Unknown Package',
    packageDescription: packageItem.description,
    amount: (pricing?.amount || 0) * packageItem.quantity,
    currency: pricing?.currency || 'USD',
    type: pricing?.type || 'one-time',
    recurring: pricing?.recurring,
    status: offer.status.toLowerCase(),
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
    expiresAt: offer.expiresAt.toISOString(),
    completedAt: offer.completedAt?.toISOString() || null,
    personalMessage: offer.personalMessage,
    clientEmail: offer.clientEmail,
    services: packageItem.serviceType
      ? [{ serviceType: packageItem.serviceType }]
      : [],
    stripeLookupKey: packageItem.stripeLookupKey,
    quantity: packageItem.quantity,
    // Custom discount applied by trainer
    discountPercent: packageItem.discountPercent,
    discountMonths: packageItem.discountMonths,
  }
}

/**
 * Transforms raw database offers into frontend-ready format
 */
export function transformTrainerOffers(
  offers: Awaited<ReturnType<typeof fetchTrainerOffers>>,
  pricingData: Awaited<ReturnType<typeof fetchOfferPricingData>>,
) {
  return offers.flatMap((offer) => {
    const packageSummary = offer.packageSummary as PackageSummary | null

    if (!packageSummary || packageSummary.length === 0) {
      // Fallback for offers without package summary
      return [createFallbackOfferItem(offer)]
    }

    // Create an entry for each package in the offer
    return packageSummary.map((packageItem, index) =>
      createOfferItemFromPackage(
        offer,
        packageItem,
        index,
        pricingData,
        packageSummary.length,
      ),
    )
  })
}
