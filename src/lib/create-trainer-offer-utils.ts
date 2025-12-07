import { NextRequest } from 'next/server'

import { GQLNotificationType } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { getBaseUrl } from '@/lib/get-base-url'
import { sendPushForNotification } from '@/lib/notifications/push-integration'
import { CreateOfferPackageInput, PackageSummary } from '@/types/trainer-offer'

/**
 * Input interface for creating trainer offers
 */
export interface CreateOfferInput {
  trainerId: string
  clientEmail: string
  packages: CreateOfferPackageInput[]
  personalMessage?: string | null
}

/**
 * Validates and parses the request input for creating trainer offers
 */
export async function validateCreateOfferInput(
  request: NextRequest,
): Promise<CreateOfferInput> {
  const body = await request.json()
  const { trainerId, clientEmail, packages, personalMessage } = body

  if (
    !trainerId ||
    !clientEmail ||
    !packages ||
    !Array.isArray(packages) ||
    packages.length === 0
  ) {
    throw new Error(
      'Trainer ID, client email, and at least one package are required',
    )
  }

  return {
    trainerId,
    clientEmail,
    packages,
    personalMessage,
  }
}

/**
 * Validates package items structure and constraints
 */
export function validatePackages(packages: CreateOfferPackageInput[]): void {
  for (const pkg of packages) {
    if (!pkg.packageId || typeof pkg.quantity !== 'number') {
      throw new Error('Each package must have packageId and quantity')
    }

    if (pkg.quantity < 1 || pkg.quantity > 20) {
      throw new Error('Quantity must be between 1 and 20 for each package')
    }

    // Validate discount if provided (both values must be set together)
    if (pkg.discountPercent !== undefined || pkg.discountMonths !== undefined) {
      if (!pkg.discountPercent || !pkg.discountMonths) {
        throw new Error(
          'Both discountPercent and discountMonths must be provided together',
        )
      }

      if (pkg.discountPercent < 1 || pkg.discountPercent > 50) {
        throw new Error('Discount percentage must be between 1 and 50')
      }

      if (pkg.discountMonths < 1 || pkg.discountMonths > 12) {
        throw new Error('Discount duration must be between 1 and 12 months')
      }
    }
  }
}

/**
 * Fetches trainer and package templates data
 */
export async function fetchOfferData(input: CreateOfferInput) {
  // Find trainer
  const trainer = await prisma.user.findUnique({
    where: { id: input.trainerId },
    include: { profile: true },
  })

  if (!trainer) {
    throw new Error('Trainer not found')
  }

  // Find all package templates with services information
  const packageIds = input.packages.map((pkg) => pkg.packageId)
  const packageTemplates = await prisma.packageTemplate.findMany({
    where: {
      id: { in: packageIds },
      stripeLookupKey: { not: null }, // Must have Stripe integration
    },
  })

  if (packageTemplates.length !== packageIds.length) {
    const foundIds = packageTemplates.map((p) => p.id)
    const missingIds = packageIds.filter((id) => !foundIds.includes(id))
    throw new Error(
      `Packages not found or not configured for payments: ${missingIds.join(', ')}`,
    )
  }

  return { trainer, packageTemplates }
}

/**
 * Creates enriched package summary with template details
 * Includes custom discount data if provided
 */
export function createPackageSummary(
  packages: CreateOfferPackageInput[],
  packageTemplates: Awaited<
    ReturnType<typeof fetchOfferData>
  >['packageTemplates'],
): PackageSummary {
  return packages.map((pkg) => {
    const template = packageTemplates.find((t) => t.id === pkg.packageId)!
    return {
      packageId: pkg.packageId,
      quantity: pkg.quantity,
      name: template.name,
      description: template.description,
      stripeLookupKey: template.stripeLookupKey,
      // Include custom discount if set
      ...(pkg.discountPercent &&
        pkg.discountMonths && {
          discountPercent: pkg.discountPercent,
          discountMonths: pkg.discountMonths,
        }),
    }
  })
}

/**
 * Generates a secure offer token
 */
export function generateOfferToken(): string {
  return `offer_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

/**
 * Creates trainer offer in database
 */
export async function createTrainerOffer(
  input: CreateOfferInput,
  packageSummary: PackageSummary,
) {
  const offerToken = generateOfferToken()

  return await prisma.trainerOffer.create({
    data: {
      token: offerToken,
      trainerId: input.trainerId,
      clientEmail: input.clientEmail,
      personalMessage: input.personalMessage,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      status: 'PENDING',
      packageSummary: JSON.parse(JSON.stringify(packageSummary)), // Convert to JSON for Prisma
    },
  })
}

/**
 * Generates offer URL for client access
 */
export function generateOfferUrl(token: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/offer/${token}`
}

/**
 * Gets formatted trainer name from user and profile data
 */
export function getTrainerName(
  trainer: Awaited<ReturnType<typeof fetchOfferData>>['trainer'],
): string {
  return trainer.profile?.firstName
    ? `${trainer.profile.firstName} ${trainer.profile.lastName || ''}`.trim()
    : trainer.name || 'Your trainer'
}

/**
 * Interface for notification parameters
 */
interface NotificationParams {
  input: CreateOfferInput
  offer: Awaited<ReturnType<typeof createTrainerOffer>>
  offerUrl: string
  trainer: Awaited<ReturnType<typeof fetchOfferData>>['trainer']
  packageSummary: PackageSummary
}

/**
 * Sends all notifications for the trainer offer (email, in-app, push)
 */
export async function sendOfferNotifications({
  input,
  offer,
  offerUrl,
  trainer,
  packageSummary,
}: NotificationParams): Promise<void> {
  const trainerName = getTrainerName(trainer)
  const bundleDescription = packageSummary
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(', ')

  // Find the client user by email
  const client = await prisma.user.findUnique({
    where: { email: input.clientEmail },
    include: { profile: true },
  })

  try {
    // Send email notification
    if (client?.profile) {
      const clientName =
        client.profile.firstName && client.profile.lastName
          ? `${client.profile.firstName} ${client.profile.lastName}`
          : client.name

      await sendEmail.trainerOffer(input.clientEmail, {
        clientName,
        trainerName,
        bundleItems: packageSummary.map((item) => ({
          quantity: item.quantity,
          packageName: item.name,
          services: item.serviceType ? [item.serviceType] : [],
        })),
        personalMessage: input.personalMessage,
        offerUrl,
        expiresAt: offer.expiresAt.toISOString(),
      })
    }

    // Create in-app notification for registered users
    if (client) {
      await prisma.notification.create({
        data: {
          userId: client.id,
          createdBy: input.trainerId,
          message: `${trainerName} created a training offer for you`,
          type: 'TRAINER_OFFER_RECEIVED',
          link: `/fitspace/my-trainer?tab=purchased-services`,
          relatedItemId: offer.token,
        },
      })

      // Send push notification
      await sendPushForNotification(
        client.id,
        GQLNotificationType.TrainerOfferReceived,
        `${trainerName} created a training offer for you`,
        `/fitspace/my-trainer?tab=purchased-services`,
        {
          trainerName,
          packageDescription: bundleDescription,
          offerToken: offer.token,
        },
      )
    }
  } catch (error) {
    // Log notification errors but don't fail the offer creation
    console.error('Failed to send offer notifications:', error)
  }
}

/**
 * Formats the success response for offer creation
 */
export function formatCreateOfferResponse(
  offer: Awaited<ReturnType<typeof createTrainerOffer>>,
  offerUrl: string,
  trainer: Awaited<ReturnType<typeof fetchOfferData>>['trainer'],
  packageSummary: PackageSummary,
) {
  const trainerName = getTrainerName(trainer)
  const bundleDescription = packageSummary
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(', ')

  return {
    success: true,
    message: 'Training bundle offer sent to client successfully',
    offerUrl,
    bundleDescription,
    itemCount: packageSummary.length,
    trainerName,
    offerToken: offer.token,
  }
}
