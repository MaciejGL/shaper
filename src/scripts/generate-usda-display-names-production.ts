#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * PRODUCTION SCRIPT: Generate and UPDATE user-friendly display names for USDA foods using AI
 *
 * This script processes USDA food descriptions and generates more user-friendly
 * display names using OpenAI, and UPDATES the database with the results.
 *
 * ⚠️  WARNING: This script MODIFIES the database!
 *
 * Usage:
 *   npx tsx src/scripts/generate-usda-display-names-production.ts
 *
 * Options:
 *   --limit <number>    : Process only N foods (default: 100)
 *   --category <string> : Process only foods from specific category
 *   --batch-size <number> : Foods per batch (default: 5)
 *   --force            : Skip confirmation prompt
 *   --resume           : Resume from where left off (skip foods with displayName)
 */
import * as readline from 'readline'

import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai/open-ai'

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  batchSize: 5, // Process foods in batches to avoid rate limits
  maxRetries: 3,
  delayBetweenBatches: 1500, // 1.5 second delay between batches (production safe)
  delayBetweenRequests: 500, // 0.5 second delay between individual AI requests

  // AI prompt for generating friendly names
  prompt: `You are a nutrition expert helping to make technical USDA food names more user-friendly for a meal planning app.

Transform the technical USDA food description into a simple, clear name that users would recognize and search for.

Rules:
- Keep essential information (food type, preparation method if important)
- Remove technical jargon (separable lean only, trimmed to X fat, etc.)
- Use familiar cooking terms (Raw, Cooked, Grilled instead of technical descriptions)
- Keep it concise but descriptive (max 50 characters)
- Capitalize properly for display
- Preserve important nutritional info (nonfat, whole grain, etc.)
- Avoid using "Raw" in the name, unless it's crucial to the food type

Examples:
"Beef, round, top round roast, boneless, separable lean only, trimmed to 0'' fat, select, raw" → "Beef Top Round Roast (Raw)"
"Beef, mince, 10% fat, raw" → "Beef Mince 10%"
"Milk, nonfat, fluid, with added vitamin A and vitamin D" → "Nonfat Milk 0%"
"Milk, whole, 3.25% milkfat, with added vitamin D..." → "Whole Milk 3.25%"
"Chicken, broilers or fryers, drumstick, meat only, cooked, braised" → "Chicken Drumstick (Braised)"
"Beans, snap, green, raw" → "Green Beans (Raw)"
"Oranges, raw, navels" → "Navel Oranges"
"Flour, wheat, all-purpose, unenriched, unbleached" → "All-Purpose Flour"

Transform this USDA description: "{{description}}"

Respond with ONLY the friendly name, no explanation.`,
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

async function generateFriendlyName(
  description: string,
): Promise<string | null> {
  try {
    const prompt = CONFIG.prompt.replace('{{description}}', description)

    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 10000,
      reasoning_effort: 'low',
      verbosity: 'low',
    })

    const friendlyName = response.choices[0]?.message?.content?.trim()

    // Basic validation
    if (friendlyName && friendlyName.length > 2 && friendlyName.length < 80) {
      return friendlyName
    }

    return null
  } catch (error) {
    console.error('❌ AI generation failed:', error)
    return null
  }
}

async function updateFoodDisplayName(
  id: string,
  displayName: string,
): Promise<boolean> {
  try {
    await prisma.uSDAFood.update({
      where: { id },
      data: { displayName },
    })
    return true
  } catch (error) {
    console.error('❌ Database update failed:', error)
    return false
  }
}

async function askConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

async function processUSDAFoodsProduction(options: {
  limit?: number
  category?: string
  batchSize?: number
  force?: boolean
  resume?: boolean
}) {
  const {
    limit = 100,
    category,
    batchSize = CONFIG.batchSize,
    force = false,
    resume = true,
  } = options

  console.log('🚀 PRODUCTION MODE: Generating and updating USDA display names')
  console.log(
    `📊 Processing up to ${limit} foods${category ? ` from category: ${category}` : ''}`,
  )
  console.log(`🔄 Batch size: ${batchSize}`)
  console.log(
    `📝 Resume mode: ${resume ? 'ON (skip existing)' : 'OFF (regenerate all)'}`,
  )
  console.log('─'.repeat(80))

  // Build query conditions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereConditions: any = {}

  if (resume) {
    whereConditions.displayName = null // Only process foods without display names
  }

  if (category) {
    whereConditions.foodCategory = {
      contains: category,
      mode: 'insensitive',
    }
  }

  // Check how many foods we'll process
  const totalCount = await prisma.uSDAFood.count({ where: whereConditions })
  const processCount = Math.min(totalCount, limit)

  console.log(`📈 Found ${totalCount} foods matching criteria`)
  console.log(`🎯 Will process ${processCount} foods`)
  console.log()

  if (processCount === 0) {
    console.log('✅ No foods found to process')
    return
  }

  // Confirmation
  if (!force) {
    const confirmed = await askConfirmation(
      `⚠️  This will UPDATE ${processCount} food records in the database. Continue?`,
    )
    if (!confirmed) {
      console.log('❌ Operation cancelled')
      return
    }
  }

  // Fetch foods to process
  const foods = await prisma.uSDAFood.findMany({
    where: whereConditions,
    select: {
      id: true,
      fdcId: true,
      description: true,
      foodCategory: true,
      displayName: true,
    },
    take: limit,
    orderBy: { fdcId: 'asc' },
  })

  console.log(`📝 Processing ${foods.length} foods...`)
  console.log()

  // Track progress
  let processed = 0
  let successful = 0
  let failed = 0
  let skipped = 0

  const startTime = Date.now()

  // Process in batches
  for (let i = 0; i < foods.length; i += batchSize) {
    const batch = foods.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(foods.length / batchSize)

    console.log(
      `🔄 Batch ${batchNum}/${totalBatches} (${processed}/${foods.length} processed)`,
    )

    for (const food of batch) {
      processed++

      // Skip if already has display name and not forcing regeneration
      if (food.displayName && resume) {
        console.log(
          `  ⏭️  Skipping (has display name): ${food.description.substring(0, 40)}...`,
        )
        skipped++
        continue
      }

      console.log(`  🔄 Processing: ${food.description.substring(0, 50)}...`)

      let generated: string | null = null
      let retries = 0

      // Try to generate name with retries
      while (retries < CONFIG.maxRetries && !generated) {
        generated = await generateFriendlyName(food.description)
        if (!generated) {
          retries++
          console.log(`    ⚠️  Retry ${retries}/${CONFIG.maxRetries}`)
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      if (generated) {
        // Try to update database
        const updated = await updateFoodDisplayName(food.id, generated)
        if (updated) {
          successful++
          console.log(`    ✅ Updated: ${generated}`)
        } else {
          failed++
          console.log(`    ❌ Database update failed`)
        }
      } else {
        failed++
        console.log(
          `    ❌ AI generation failed after ${CONFIG.maxRetries} retries`,
        )
      }

      // Delay between requests to be nice to OpenAI
      if (processed < foods.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.delayBetweenRequests),
        )
      }
    }

    // Delay between batches
    if (i + batchSize < foods.length) {
      console.log(
        `    ⏳ Waiting ${CONFIG.delayBetweenBatches}ms before next batch...`,
      )
      await new Promise((resolve) =>
        setTimeout(resolve, CONFIG.delayBetweenBatches),
      )
    }
    console.log()
  }

  // Final summary
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(1)

  console.log('─'.repeat(80))
  console.log('🎉 PRODUCTION UPDATE COMPLETE')
  console.log('─'.repeat(80))
  console.log(`⏱️  Duration: ${duration}s`)
  console.log(`📊 Processed: ${processed}`)
  console.log(`✅ Successfully updated: ${successful}`)
  console.log(`⏭️  Skipped (existing): ${skipped}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(
    `📈 Success rate: ${processed > 0 ? ((successful / processed) * 100).toFixed(1) : 0}%`,
  )
  console.log()

  if (successful > 0) {
    console.log('🎯 Random examples of updates:')
    // Show some examples from database
    const examples = await prisma.uSDAFood.findMany({
      where: {
        displayName: { not: null },
        id: { in: foods.map((f) => f.id) },
      },
      select: {
        description: true,
        displayName: true,
      },
      take: 3,
    })

    examples.forEach((example) => {
      console.log(`📝 Original: ${example.description}`)
      console.log(`✨ Display:  ${example.displayName}`)
      console.log()
    })
  }

  console.log('🚀 Database has been updated with friendly display names!')
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    limit: 100,
    batchSize: CONFIG.batchSize,
    force: false,
    resume: true,
  }

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    switch (arg) {
      case '--limit':
        options.limit = parseInt(args[++i] || '100')
        break
      case '--category':
        options.category = args[++i]
        break
      case '--batch-size':
        options.batchSize = parseInt(args[++i] || '5')
        break
      case '--force':
        options.force = true
        break
      case '--resume':
        options.resume = true
        break
      case '--no-resume':
        options.resume = false
        break
      case '--help':
        console.log(`
Usage: npx tsx src/scripts/generate-usda-display-names-production.ts [options]

⚠️  WARNING: This script MODIFIES the database!

Options:
  --limit <number>      Process only N foods (default: 100)
  --category <string>   Process only foods from specific category
  --batch-size <number> Foods per batch (default: 5)
  --force              Skip confirmation prompt
  --resume             Skip foods with existing displayName (default)
  --no-resume          Regenerate all foods, even with existing displayName
  --help               Show this help message

Examples:
  npx tsx src/scripts/generate-usda-display-names-production.ts --limit 50
  npx tsx src/scripts/generate-usda-display-names-production.ts --category "Beef" --limit 20
  npx tsx src/scripts/generate-usda-display-names-production.ts --force --limit 1000
        `)
        process.exit(0)
      default:
        if (arg.startsWith('--')) {
          console.error(`❌ Unknown option: ${arg}`)
          process.exit(1)
        }
    }
  }

  try {
    await processUSDAFoodsProduction(options)
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}
