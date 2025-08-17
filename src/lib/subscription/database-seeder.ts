/**
 * Database Seeder for Subscription System
 *
 * This file contains functions to seed the database with predefined package templates
 * and other subscription-related data needed for the system to function.
 */
import { prisma } from '@/lib/db'
import { PREDEFINED_PACKAGES } from '@/types/subscription'

/**
 * Seed predefined package templates
 */
export async function seedPackageTemplates(): Promise<void> {
  console.info('🌱 Seeding package templates...')

  try {
    // Check if premium package exists first
    let premiumPackage = await prisma.packageTemplate.findFirst({
      where: {
        name: PREDEFINED_PACKAGES.PREMIUM.name,
        trainerId: null, // General premium package has no trainer
      },
      include: { services: true },
    })

    if (!premiumPackage) {
      // Create general premium package
      premiumPackage = await prisma.packageTemplate.create({
        data: {
          name: PREDEFINED_PACKAGES.PREMIUM.name,
          description: PREDEFINED_PACKAGES.PREMIUM.description,
          priceNOK: PREDEFINED_PACKAGES.PREMIUM.priceNOK,
          duration: PREDEFINED_PACKAGES.PREMIUM.duration,
          trainerId: null,
          isActive: true,
          services: {
            create: PREDEFINED_PACKAGES.PREMIUM.services.map((service) => ({
              serviceType: service.serviceType,
              quantity: service.quantity,
            })),
          },
        },
        include: { services: true },
      })
    }

    console.info(
      `✅ Created/updated premium package: ${premiumPackage.name} (${premiumPackage.services.length} services)`,
    )

    // Create trainer package templates (these serve as templates for trainers to create their own packages)
    const trainerPackageTemplates = [
      PREDEFINED_PACKAGES.TRAINING_COACHING,
      PREDEFINED_PACKAGES.MEAL_COACHING,
      PREDEFINED_PACKAGES.TRAINING_MEAL_COACHING,
      PREDEFINED_PACKAGES.EXTRA_MEETING,
      PREDEFINED_PACKAGES.FULL_COMBO,
    ]

    for (const packageTemplate of trainerPackageTemplates) {
      let template = await prisma.packageTemplate.findFirst({
        where: {
          name: packageTemplate.name,
          trainerId: null, // These are templates, not tied to specific trainers
        },
        include: { services: true },
      })

      if (!template) {
        template = await prisma.packageTemplate.create({
          data: {
            name: packageTemplate.name,
            description: packageTemplate.description,
            priceNOK: packageTemplate.priceNOK,
            duration: packageTemplate.duration,
            trainerId: null, // These are templates, not tied to specific trainers
            isActive: true,
            services: {
              create: packageTemplate.services.map((service) => ({
                serviceType: service.serviceType,
                quantity: service.quantity,
              })),
            },
          },
          include: { services: true },
        })
        console.info(
          `✅ Created template: ${template.name} (${template.services.length} services)`,
        )
      } else {
        console.info(`⏭️ Template already exists: ${template.name}`)
      }
    }

    console.info('🎉 Package templates seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding package templates:', error)
    throw error
  }
}

/**
 * Create trainer-specific packages from templates for a specific trainer
 */
export async function createTrainerPackagesFromTemplates(
  trainerId: string,
  trainerName?: string,
): Promise<void> {
  console.info(
    `🏋️ Creating trainer packages for trainer: ${trainerId} (${trainerName || 'Unknown'})`,
  )

  try {
    // Get all template packages (those without a trainerId)
    const templates = await prisma.packageTemplate.findMany({
      where: {
        trainerId: null, // Get templates
        name: {
          not: PREDEFINED_PACKAGES.PREMIUM.name, // Exclude general premium
        },
      },
      include: { services: true },
    })

    let createdCount = 0

    for (const template of templates) {
      // Check if trainer already has this package
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
            isActive: true,
            services: {
              create: template.services.map((service) => ({
                serviceType: service.serviceType,
                quantity: service.quantity,
              })),
            },
          },
          include: {
            services: true,
          },
        })

        console.info(
          `✅ Created trainer package: ${trainerPackage.name} for trainer ${trainerId}`,
        )
        createdCount++
      } else {
        console.info(
          `⏭️ Trainer package ${template.name} already exists for trainer ${trainerId}`,
        )
      }
    }

    console.info(`🎉 Created ${createdCount} packages for trainer ${trainerId}`)
  } catch (error) {
    console.error(`❌ Error creating trainer packages for ${trainerId}:`, error)
    throw error
  }
}

/**
 * Create trainer packages for all existing trainers
 */
export async function createPackagesForAllTrainers(): Promise<void> {
  console.info('👥 Creating packages for all existing trainers...')

  try {
    // Get all users with trainer role
    const trainers = await prisma.user.findMany({
      where: {
        role: 'TRAINER',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    console.info(`Found ${trainers.length} trainers`)

    for (const trainer of trainers) {
      await createTrainerPackagesFromTemplates(
        trainer.id,
        trainer.name || trainer.email,
      )
    }

    console.info(
      `🎉 Finished creating packages for ${trainers.length} trainers`,
    )
  } catch (error) {
    console.error('❌ Error creating packages for all trainers:', error)
    throw error
  }
}

/**
 * Create sample subscriptions for testing (optional)
 */
export async function createSampleSubscriptions(): Promise<void> {
  console.info('🧪 Creating sample subscriptions for testing...')

  try {
    // Get a few test users and packages
    const testUsers = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
      },
      take: 3,
    })

    const premiumPackage = await prisma.packageTemplate.findFirst({
      where: {
        name: PREDEFINED_PACKAGES.PREMIUM.name,
      },
    })

    if (!premiumPackage) {
      console.info(
        '⚠️ Premium package not found, skipping sample subscriptions',
      )
      return
    }

    for (const user of testUsers) {
      // Check if user already has a subscription
      const existingSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
      })

      if (!existingSubscription) {
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1) // 1 month subscription

        await prisma.userSubscription.create({
          data: {
            userId: user.id,
            packageId: premiumPackage.id,
            status: 'ACTIVE',
            startDate,
            endDate,
            mockPaymentStatus: 'COMPLETED',
            mockTransactionId: `test_${Date.now()}_${user.id}`,
          },
        })

        console.info(`✅ Created sample subscription for user: ${user.email}`)
      } else {
        console.info(`⏭️ User ${user.email} already has an active subscription`)
      }
    }

    console.info('🎉 Sample subscriptions created successfully')
  } catch (error) {
    console.error('❌ Error creating sample subscriptions:', error)
    throw error
  }
}

/**
 * Run all seeding operations
 */
export async function seedSubscriptionSystem(): Promise<void> {
  console.info('🚀 Starting subscription system seeding...')

  try {
    await seedPackageTemplates()
    await createPackagesForAllTrainers()

    // Optionally create sample subscriptions (uncomment if needed for testing)
    // await createSampleSubscriptions()

    console.info('🎊 Subscription system seeding completed successfully!')
  } catch (error) {
    console.error('💥 Subscription system seeding failed:', error)
    throw error
  }
}

/**
 * Clean up subscription data (for development/testing)
 */
export async function cleanupSubscriptionData(): Promise<void> {
  console.info('🧹 Cleaning up subscription data...')

  try {
    // Delete in correct order due to foreign key constraints
    await prisma.serviceUsage.deleteMany()
    console.info('✅ Deleted all service usage records')

    await prisma.userSubscription.deleteMany()
    console.info('✅ Deleted all user subscriptions')

    await prisma.packageService.deleteMany()
    console.info('✅ Deleted all package services')

    await prisma.packageTemplate.deleteMany()
    console.info('✅ Deleted all package templates')

    console.info('🎉 Subscription data cleanup completed')
  } catch (error) {
    console.error('❌ Error cleaning up subscription data:', error)
    throw error
  }
}
