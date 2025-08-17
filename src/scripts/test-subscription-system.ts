#!/usr/bin/env tsx
/**
 * Test Subscription System
 *
 * A simple script to test the core subscription functionality without GraphQL complexity
 */
import { prisma } from '@/lib/db'
import { seedPackageTemplates } from '@/lib/subscription/database-seeder'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { ServiceType } from '@/types/subscription'

async function testSubscriptionSystem() {
  try {
    console.log('🧪 Testing Subscription System...\n')

    // Step 1: Seed package templates
    console.log('1️⃣ Seeding package templates...')
    await seedPackageTemplates()

    // Step 2: Check if packages were created
    console.log('\n2️⃣ Verifying package templates...')
    const packages = await prisma.packageTemplate.findMany({
      include: { services: true },
    })

    console.log(`Found ${packages.length} package templates:`)
    packages.forEach((pkg) => {
      console.log(
        `  - ${pkg.name}: ${pkg.priceNOK / 100} NOK (${pkg.services.length} services)`,
      )
    })

    // Step 3: Test subscription validator (without real user)
    console.log('\n3️⃣ Testing subscription validator...')

    if (packages.length > 0) {
      // Create a mock subscription
      const premiumPackage = packages.find((p) => p.name === 'FitSpace Premium')
      if (premiumPackage) {
        console.log('Creating mock subscription for testing...')

        // Create a test user first
        const testUser = await prisma.user.upsert({
          where: { email: 'test-subscription@example.com' },
          update: {},
          create: {
            email: 'test-subscription@example.com',
            name: 'Test User',
            role: 'CLIENT',
          },
        })

        // Create mock subscription
        const result = await subscriptionValidator.createMockSubscription(
          testUser.id,
          premiumPackage.id,
          undefined, // No trainer
          1, // 1 month
        )

        if (result.success) {
          console.log(`✅ Mock subscription created: ${result.subscriptionId}`)

          // Test premium access
          const hasPremium = await subscriptionValidator.hasPremiumAccess(
            testUser.id,
          )
          console.log(`✅ Premium access check: ${hasPremium}`)

          // Test service access
          const serviceAccess = await subscriptionValidator.canUseService(
            testUser.id,
            ServiceType.PREMIUM_ACCESS,
          )
          console.log(`✅ Service access check: ${serviceAccess.hasAccess}`)
        } else {
          console.log(`❌ Failed to create mock subscription: ${result.error}`)
        }
      }
    }

    console.log('\n✅ Subscription system test completed successfully!')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')

  // Delete test subscriptions and user
  await prisma.serviceUsage.deleteMany({
    where: {
      subscription: {
        user: { email: 'test-subscription@example.com' },
      },
    },
  })

  await prisma.userSubscription.deleteMany({
    where: {
      user: { email: 'test-subscription@example.com' },
    },
  })

  await prisma.user.deleteMany({
    where: { email: 'test-subscription@example.com' },
  })

  console.log('✅ Cleanup completed')
}

async function main() {
  const command = process.argv[2]

  try {
    if (command === 'cleanup') {
      await cleanup()
    } else {
      await testSubscriptionSystem()
    }

    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Script failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
