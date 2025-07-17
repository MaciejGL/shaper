#!/usr/bin/env node
import path from 'path'

import { prisma } from '@/lib/db'

import fs from 'fs/promises'

interface ParsedFood {
  fdcId: number
  dataType: string
  description: string
  brandOwner?: string
  brandName?: string
  ingredients?: string
  gtinUpc?: string
  marketCountry?: string
  foodCategory?: string
  // Nutrition data per 100g
  caloriesPer100g?: number
  proteinPer100g?: number
  carbsPer100g?: number
  fatPer100g?: number
  fiberPer100g?: number
  sugarPer100g?: number
  sodiumPer100g?: number
  calciumPer100g?: number
  ironPer100g?: number
  potassiumPer100g?: number
  vitaminCPer100g?: number
}

const DATA_DIR = path.join(process.cwd(), 'data', 'usda')
const PARSED_DIR = path.join(DATA_DIR, 'parsed')

// Batch size for database operations
const BATCH_SIZE = 1000

async function clearExistingUSDAData(): Promise<void> {
  console.log('🗑️  Clearing existing USDA data...')

  try {
    const deletedFoods = await prisma.uSDAFood.deleteMany({})
    console.log(`✅ Cleared ${deletedFoods.count} USDA foods`)
  } catch (error) {
    console.error('❌ Error clearing existing data:', error)
    throw error
  }
}

async function importFoodsInBatches(foods: ParsedFood[]): Promise<void> {
  console.log(
    `📥 Importing ${foods.length} foods in batches of ${BATCH_SIZE}...`,
  )

  const totalBatches = Math.ceil(foods.length / BATCH_SIZE)

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE
    const end = start + BATCH_SIZE
    const batch = foods.slice(start, end)

    console.log(
      `  📦 Processing batch ${i + 1}/${totalBatches} (${batch.length} foods)`,
    )

    try {
      // Prepare food data for insertion
      const foodsData = batch.map((food) => ({
        fdcId: food.fdcId,
        dataType: food.dataType,
        description: food.description,
        brandOwner: food.brandOwner,
        brandName: food.brandName,
        ingredients: food.ingredients,
        foodCategory: food.foodCategory,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
        fiberPer100g: food.fiberPer100g,
        sugarPer100g: food.sugarPer100g,
        sodiumPer100g: food.sodiumPer100g,
        calciumPer100g: food.calciumPer100g,
        ironPer100g: food.ironPer100g,
        potassiumPer100g: food.potassiumPer100g,
        vitaminCPer100g: food.vitaminCPer100g,
      }))

      // Insert foods in batch
      await prisma.uSDAFood.createMany({
        data: foodsData,
        skipDuplicates: true,
      })

      // Progress indicator
      const progress = (((i + 1) / totalBatches) * 100).toFixed(1)
      console.log(`  ✅ Batch ${i + 1} completed (${progress}%)`)
    } catch (error) {
      console.error(`❌ Error importing batch ${i + 1}:`, error)
      throw error
    }
  }
}

async function loadParsedData(): Promise<ParsedFood[]> {
  const combinedPath = path.join(PARSED_DIR, 'combined_foods.json')

  try {
    console.log(`📂 Loading parsed data from ${combinedPath}...`)
    const fileContent = await fs.readFile(combinedPath, 'utf-8')
    const data = JSON.parse(fileContent) as ParsedFood[]

    console.log(`✅ Loaded ${data.length} foods from parsed data`)
    return data
  } catch (error) {
    console.error(`❌ Error loading parsed data from ${combinedPath}:`, error)

    // Try to load individual files if combined file doesn't exist
    console.log('🔄 Attempting to load individual dataset files...')

    const foundationPath = path.join(PARSED_DIR, 'foundation_foods.json')
    const srLegacyPath = path.join(PARSED_DIR, 'sr_legacy.json')

    const allFoods: ParsedFood[] = []

    try {
      const foundationContent = await fs.readFile(foundationPath, 'utf-8')
      const foundationData = JSON.parse(foundationContent) as ParsedFood[]
      allFoods.push(...foundationData)
      console.log(`✅ Loaded ${foundationData.length} Foundation Foods`)
    } catch (error) {
      console.warn('⚠️  Foundation Foods file not found:', foundationPath)
    }

    try {
      const srLegacyContent = await fs.readFile(srLegacyPath, 'utf-8')
      const srLegacyData = JSON.parse(srLegacyContent) as ParsedFood[]
      allFoods.push(...srLegacyData)
      console.log(`✅ Loaded ${srLegacyData.length} SR Legacy Foods`)
    } catch (error) {
      console.warn('⚠️  SR Legacy file not found:', srLegacyPath)
    }

    if (allFoods.length === 0) {
      throw new Error(
        'No parsed data files found. Please run the data parser first.',
      )
    }

    return allFoods
  }
}

async function verifyImport(): Promise<void> {
  console.log('\n🔍 Verifying import...')

  try {
    const foodCount = await prisma.uSDAFood.count()

    console.log(`✅ Successfully imported:`)
    console.log(`   📊 ${foodCount.toLocaleString()} USDA foods`)

    // Test search functionality
    const sampleFoods = await prisma.uSDAFood.findMany({
      take: 5,
      orderBy: { fdcId: 'asc' },
    })

    console.log('\n📄 Sample imported foods:')
    sampleFoods.forEach((food) => {
      console.log(`   • ${food.description} (FDC ID: ${food.fdcId})`)
      console.log(`     Calories: ${food.caloriesPer100g}kcal/100g`)
      console.log(`     Data Type: ${food.dataType}`)
    })
  } catch (error) {
    console.error('❌ Error verifying import:', error)
    throw error
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting USDA data import to PostgreSQL...')

  try {
    // Load the parsed data
    const foods = await loadParsedData()

    if (foods.length === 0) {
      console.error(
        '❌ No foods to import. Please check your parsed data files.',
      )
      process.exit(1)
    }

    // Clear existing data
    await clearExistingUSDAData()

    // Import the data
    await importFoodsInBatches(foods)

    // Verify the import
    await verifyImport()

    console.log('\n✅ USDA data import completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Update the food search service to query local USDA data')
    console.log('2. Test search performance with the new local data')
    console.log('3. Update the UI to show data source indicators')
  } catch (error) {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { main as importUSDAData }
