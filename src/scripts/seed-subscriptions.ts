#!/usr/bin/env tsx
/**
 * Subscription System Seeder Script
 *
 * This script seeds the database with predefined package templates and
 * creates trainer-specific packages for all existing trainers.
 *
 * Usage:
 * npm run seed-subscriptions
 * or
 * npx tsx src/scripts/seed-subscriptions.ts
 */
import {
  cleanupSubscriptionData,
  seedSubscriptionSystem,
} from '@/lib/subscription/database-seeder'

async function main() {
  const command = process.argv[2]

  try {
    switch (command) {
      case 'cleanup':
        console.info('🧹 Running subscription data cleanup...')
        await cleanupSubscriptionData()
        break

      case 'seed':
      default:
        console.info('🌱 Running subscription system seeding...')
        await seedSubscriptionSystem()
        break
    }

    console.info('✅ Operation completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Operation failed:', error)
    process.exit(1)
  }
}

main()
