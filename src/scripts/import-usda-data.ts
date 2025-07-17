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
  console.info('🗑️  Clearing existing USDA data...')

  try {
    const deletedFoods = await prisma.uSDAFood.deleteMany({})
    console.info(`✅ Cleared ${deletedFoods.count} USDA foods`)
  } catch (error) {
    console.error('❌ Error clearing existing data:', error)
    throw error
  }
}

async function importFoodsInBatches(foods: ParsedFood[]): Promise<void> {
  console.info(
    `📥 Importing ${foods.length} foods in batches of ${BATCH_SIZE}...`,
  )

  const totalBatches = Math.ceil(foods.length / BATCH_SIZE)

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE
    const end = start + BATCH_SIZE
    const batch = foods.slice(start, end)

    console.info(
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
      console.info(`  ✅ Batch ${i + 1} completed (${progress}%)`)
    } catch (error) {
      console.error(`❌ Error importing batch ${i + 1}:`, error)
      throw error
    }
  }
}

async function loadParsedData(): Promise<ParsedFood[]> {
  const combinedPath = path.join(PARSED_DIR, 'combined_foods.json')

  try {
    const fileContent = await fs.readFile(combinedPath, 'utf-8')
    const data = JSON.parse(fileContent) as ParsedFood[]

    // Filter to only include foods with meaningful nutrition data
    const filteredData = data.filter((food) => {
      // Keep foods that have at least calories or basic macronutrients
      return (
        food.caloriesPer100g != null &&
        food.proteinPer100g != null &&
        food.carbsPer100g != null &&
        food.fatPer100g != null
      )
    })

    console.info(
      `🔍 Filtered to ${filteredData.length} foods with nutrition data`,
    )
    console.info(
      `   📊 Removed ${data.length - filteredData.length} foods without nutrition data`,
    )

    return filteredData
  } catch (error) {
    console.error(`❌ Error loading parsed data from ${combinedPath}:`, error)

    const foundationPath = path.join(PARSED_DIR, 'foundation_foods.json')
    const srLegacyPath = path.join(PARSED_DIR, 'sr_legacy.json')

    const allFoods: ParsedFood[] = []

    try {
      const foundationContent = await fs.readFile(foundationPath, 'utf-8')
      const foundationData = JSON.parse(foundationContent) as ParsedFood[]
      allFoods.push(...foundationData)
    } catch (error) {
      console.warn('⚠️  Foundation Foods file not found:', foundationPath)
    }

    try {
      const srLegacyContent = await fs.readFile(srLegacyPath, 'utf-8')
      const srLegacyData = JSON.parse(srLegacyContent) as ParsedFood[]
      allFoods.push(...srLegacyData)
    } catch (error) {
      console.warn('⚠️  SR Legacy file not found:', srLegacyPath)
    }

    if (allFoods.length === 0) {
      throw new Error(
        'No parsed data files found. Please run the data parser first.',
      )
    }

    // Filter to only include foods with meaningful nutrition data
    const filteredFoods = allFoods.filter((food) => {
      // Keep foods that have at least calories or basic macronutrients
      return (
        food.caloriesPer100g != null ||
        food.proteinPer100g != null ||
        food.carbsPer100g != null ||
        food.fatPer100g != null
      )
    })

    console.info(
      `🔍 Filtered to ${filteredFoods.length} foods with nutrition data`,
    )
    console.info(
      `   📊 Removed ${allFoods.length - filteredFoods.length} foods without nutrition data`,
    )

    return filteredFoods
  }
}

async function verifyImport(): Promise<void> {
  try {
    const foodCount = await prisma.uSDAFood.count()

    // Get breakdown by data type
    const srLegacyCount = await prisma.uSDAFood.count({
      where: { dataType: 'sr_legacy_food' },
    })
    const foundationCount = await prisma.uSDAFood.count({
      where: { dataType: 'foundation_food' },
    })

    // Count foods with complete nutrition profiles
    const withCaloriesCount = await prisma.uSDAFood.count({
      where: { caloriesPer100g: { not: null } },
    })

    console.info(`✅ Successfully imported:`)
    console.info(
      `   📊 ${foodCount.toLocaleString()} USDA foods with nutrition data`,
    )
    console.info(
      `   🥗 ${srLegacyCount.toLocaleString()} SR Legacy foods (complete nutrition)`,
    )
    console.info(
      `   🧪 ${foundationCount.toLocaleString()} Foundation foods (experimental data)`,
    )
    console.info(
      `   🔥 ${withCaloriesCount.toLocaleString()} foods with calorie information`,
    )

    // Test search functionality
    const sampleFoods = await prisma.uSDAFood.findMany({
      take: 5,
      orderBy: { fdcId: 'asc' },
      where: { caloriesPer100g: { not: null } },
    })

    console.info('\n📄 Sample imported foods with nutrition data:')
    sampleFoods.forEach((food) => {
      console.info(`   • ${food.description} (FDC ID: ${food.fdcId})`)
      console.info(`     Calories: ${food.caloriesPer100g}kcal/100g`)
      console.info(
        `     Protein: ${food.proteinPer100g}g, Carbs: ${food.carbsPer100g}g, Fat: ${food.fatPer100g}g`,
      )
      console.info(`     Data Type: ${food.dataType}`)
    })
  } catch (error) {
    console.error('❌ Error verifying import:', error)
    throw error
  }
}

async function main(): Promise<void> {
  console.info('🚀 Starting USDA data import to PostgreSQL...')

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

    console.info('\n✅ USDA data import completed successfully!')
    console.info('\nNext steps:')
    console.info('1. Update the food search service to query local USDA data')
    console.info('2. Test search performance with the new local data')
    console.info('3. Update the UI to show data source indicators')
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
