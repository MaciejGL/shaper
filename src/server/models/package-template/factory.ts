import { ServiceType, SubscriptionDuration } from '@prisma/client'

import {
  GQLCreatePackageTemplateInput,
  GQLQueryGetActivePackageTemplatesArgs,
  GQLQueryGetPackageTemplateArgs,
  GQLQueryGetPackageTemplatesArgs,
  GQLUpdatePackageTemplateInput,
} from '@/generated/graphql-server'
import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'
import { PREDEFINED_PACKAGES } from '@/types/subscription'

import PackageTemplate from './model'

/**
 * Get all package templates, optionally filtered by trainer
 */
export async function getPackageTemplates(
  args: GQLQueryGetPackageTemplatesArgs,
  context: GQLContext,
): Promise<PackageTemplate[]> {
  const templates = await prisma.packageTemplate.findMany({
    where: {
      trainerId: args.trainerId || undefined,
    },
    include: {
      services: true,
      trainer: true,
      _count: {
        select: { subscriptions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return templates.map((template) => new PackageTemplate(template, context))
}

/**
 * Get only active package templates
 */
export async function getActivePackageTemplates(
  args: GQLQueryGetActivePackageTemplatesArgs,
  context: GQLContext,
): Promise<PackageTemplate[]> {
  const templates = await prisma.packageTemplate.findMany({
    where: {
      trainerId: args.trainerId || undefined,
      isActive: true,
    },
    include: {
      services: true,
      trainer: true,
      _count: {
        select: { subscriptions: true },
      },
    },
    orderBy: { priceNOK: 'asc' },
  })

  return templates.map((template) => new PackageTemplate(template, context))
}

/**
 * Get a specific package template by ID
 */
export async function getPackageTemplate(
  args: GQLQueryGetPackageTemplateArgs,
  context: GQLContext,
): Promise<PackageTemplate | null> {
  const template = await prisma.packageTemplate.findUnique({
    where: { id: args.id },
    include: {
      services: true,
      trainer: true,
      _count: {
        select: { subscriptions: true },
      },
    },
  })

  if (!template) return null

  return new PackageTemplate(template, context)
}

/**
 * Create a new package template
 */
export async function createPackageTemplate(
  input: GQLCreatePackageTemplateInput,
  context: GQLContext,
): Promise<PackageTemplate> {
  if (!isAdminUser()) {
    throw new Error('Unauthorized')
  }

  const { services, ...templateData } = input

  const template = await prisma.packageTemplate.create({
    data: {
      ...templateData,
      services: {
        create: services.map(
          (service: { serviceType: ServiceType; quantity: number }) => ({
            serviceType: service.serviceType as ServiceType, // Cast to Prisma enum
            quantity: service.quantity,
          }),
        ),
      },
    },
    include: {
      services: true,
      trainer: true,
      _count: {
        select: { subscriptions: true },
      },
    },
  })

  return new PackageTemplate(template, context)
}

/**
 * Update an existing package template
 */
export async function updatePackageTemplate(
  id: string,
  input: GQLUpdatePackageTemplateInput,
  context: GQLContext,
): Promise<PackageTemplate> {
  if (!isAdminUser()) {
    throw new Error('Unauthorized')
  }

  const { services, ...templateData } = input

  // Start a transaction to update template and services
  const template = await prisma.$transaction(async (tx) => {
    // Update the template with safe type casting
    await tx.packageTemplate.update({
      where: { id },
      data: {
        name: templateData.name || undefined,
        description: templateData.description || undefined,
        priceNOK: templateData.priceNOK || undefined,
        duration: (templateData.duration as SubscriptionDuration) || undefined,
        isActive: templateData.isActive || undefined,
      },
    })

    // If services are provided, replace them
    if (services) {
      // Delete existing services
      await tx.packageService.deleteMany({
        where: { packageId: id },
      })

      // Create new services
      await tx.packageService.createMany({
        data: services.map(
          (service: { serviceType: string; quantity: number }) => ({
            packageId: id,
            serviceType: service.serviceType as ServiceType, // Cast to Prisma enum
            quantity: service.quantity,
          }),
        ),
      })
    }

    // Return the updated template with includes
    return tx.packageTemplate.findUnique({
      where: { id },
      include: {
        services: true,
        trainer: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    })
  })

  if (!template) {
    throw new Error('Failed to update package template')
  }

  return new PackageTemplate(template, context)
}

/**
 * Delete a package template (only if no active subscriptions)
 */
export async function deletePackageTemplate(id: string): Promise<boolean> {
  if (!isAdminUser()) {
    throw new Error('Unauthorized')
  }

  try {
    // Check if there are any active subscriptions
    const activeSubscriptions = await prisma.userSubscription.count({
      where: {
        packageId: id,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
    })

    if (activeSubscriptions > 0) {
      throw new Error(
        'Cannot delete package template with active subscriptions',
      )
    }

    // Delete the template (services will be deleted due to cascade)
    await prisma.packageTemplate.delete({
      where: { id },
    })

    return true
  } catch (error) {
    console.error('Error deleting package template:', error)
    return false
  }
}

/**
 * Seed predefined package templates
 */
export async function seedPackageTemplates(): Promise<void> {
  console.info('Seeding package templates...')

  try {
    // Check if premium package exists first
    let premiumPackage = await prisma.packageTemplate.findFirst({
      where: { name: PREDEFINED_PACKAGES.PREMIUM.name },
    })

    if (!premiumPackage) {
      // Create general premium package
      premiumPackage = await prisma.packageTemplate.create({
        data: {
          ...PREDEFINED_PACKAGES.PREMIUM,
          trainerId: null,
          services: {
            create: [...PREDEFINED_PACKAGES.PREMIUM.services],
          },
        },
      })
      console.info(`Created premium package: ${premiumPackage.id}`)
    } else {
      console.info(`Premium package already exists: ${premiumPackage.id}`)
    }

    // For trainer packages, we'll create them as templates that trainers can use
    const trainerPackageTemplates = [
      PREDEFINED_PACKAGES.TRAINING_COACHING,
      PREDEFINED_PACKAGES.MEAL_COACHING,
      PREDEFINED_PACKAGES.TRAINING_MEAL_COACHING,
      PREDEFINED_PACKAGES.EXTRA_MEETING,
      PREDEFINED_PACKAGES.FULL_COMBO,
    ]

    for (const packageTemplate of trainerPackageTemplates) {
      let template = await prisma.packageTemplate.findFirst({
        where: { name: packageTemplate.name },
      })

      if (!template) {
        template = await prisma.packageTemplate.create({
          data: {
            ...packageTemplate,
            trainerId: null, // These are templates, not tied to specific trainers
            services: {
              create: [...packageTemplate.services],
            },
          },
        })
        console.info(`Created package template: ${template.name}`)
      } else {
        console.info(`Package template already exists: ${template.name}`)
      }
    }

    console.info('Package templates seeded successfully')
  } catch (error) {
    console.error('Error seeding package templates:', error)
    throw error
  }
}

/**
 * Create trainer-specific packages from templates
 */
export async function createTrainerPackagesFromTemplates(
  trainerId: string,
): Promise<PackageTemplate[]> {
  const templates = await prisma.packageTemplate.findMany({
    where: {
      trainerId: null, // Get templates
      name: {
        not: PREDEFINED_PACKAGES.PREMIUM.name, // Exclude general premium
      },
    },
    include: { services: true },
  })

  const trainerPackages: PackageTemplate[] = []

  for (const template of templates) {
    const existingPackage = await prisma.packageTemplate.findFirst({
      where: {
        trainerId,
        name: template.name,
      },
    })

    if (!existingPackage) {
      const trainerPackage = await prisma.packageTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          priceNOK: template.priceNOK,
          duration: template.duration,
          trainerId,
          services: {
            create: template.services.map((service) => ({
              serviceType: service.serviceType,
              quantity: service.quantity,
            })),
          },
        },
        include: {
          services: true,
          trainer: true,
          _count: {
            select: { subscriptions: true },
          },
        },
      })

      trainerPackages.push(new PackageTemplate(trainerPackage))
    }
  }

  return trainerPackages
}
