#!/usr/bin/env node
import { randomUUID } from 'crypto'
import { parse } from 'csv-parse'
import { createReadStream, createWriteStream } from 'fs'
import path from 'path'

import fs from 'fs/promises'

// Key nutrient IDs from USDA (these are the nutrients we care about)
const ESSENTIAL_NUTRIENTS = {
  ENERGY_KCAL: 1008, // Energy (kcal)
  PROTEIN: 1003, // Protein
  CARBS: 1005, // Carbohydrate, by difference
  FAT: 1004, // Total lipid (fat)
  FIBER: 1079, // Fiber, total dietary
  SUGAR: 2000, // Sugars, total including NLEA
  SODIUM: 1093, // Sodium, Na
  CALCIUM: 1087, // Calcium, Ca
  IRON: 1089, // Iron, Fe
  POTASSIUM: 1092, // Potassium, K
  VITAMIN_C: 1162, // Vitamin C, total ascorbic acid
} as const

interface RawFood {
  fdc_id: string
  data_type: string
  description: string
  food_category_id?: string
  publication_date: string
  brand_owner?: string
  brand_name?: string
  ingredients?: string
  gtin_upc?: string
  market_country?: string
  category?: string
}

interface RawNutrient {
  id: string
  name: string
  unit_name: string
  nutrient_nbr: string
  rank?: string
}

interface RawFoodNutrient {
  fdc_id: string
  nutrient_id: string
  amount: string
  derivation_id?: string
  min?: string
  max?: string
  median?: string
  footnote?: string
  min_year_acquired?: string
}

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
const EXTRACTED_DIR = path.join(DATA_DIR, 'extracted')
const PARSED_DIR = path.join(DATA_DIR, 'parsed')

// CSV columns matching the database schema exactly
const CSV_COLUMNS = [
  'id',
  'fdcId',
  'dataType',
  'description',
  'brandOwner',
  'brandName',
  'ingredients',
  'gtinUpc',
  'marketCountry',
  'foodCategory',
  'caloriesPer100g',
  'proteinPer100g',
  'carbsPer100g',
  'fatPer100g',
  'fiberPer100g',
  'sugarPer100g',
  'sodiumPer100g',
  'calciumPer100g',
  'ironPer100g',
  'potassiumPer100g',
  'vitaminCPer100g',
  'createdAt',
  'updatedAt',
]

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = []
    createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }),
      )
      .on('data', (data: T) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

async function walkDirectory(dirPath: string): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // Recursively walk subdirectories
        const subFiles = await walkDirectory(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }

  return files
}

async function findDatasetFiles(): Promise<{
  foundationFoods: string[]
}> {
  const foundationDir = path.join(EXTRACTED_DIR, 'foundation_foods')

  let foundationFoods: string[] = []

  try {
    console.info(
      `🔍 Searching for Foundation Foods CSV files in ${foundationDir}...`,
    )
    foundationFoods = await walkDirectory(foundationDir)
    console.info(`✅ Found ${foundationFoods.length} foundation files`)
  } catch (error) {
    console.warn('Foundation Foods directory not found:', error)
  }

  return { foundationFoods }
}

function parseNutrientValue(value: string | undefined): number | undefined {
  if (!value || value === 'null' || value === '') return undefined
  const num = parseFloat(value)
  return isNaN(num) ? undefined : num
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return '"' + str.replace(/"/g, '""') + '"'
  }

  return str
}

function convertToCSVRow(food: ParsedFood): string {
  const now = new Date().toISOString()

  const values = [
    randomUUID(), // id
    food.fdcId,
    food.dataType,
    food.description,
    food.brandOwner || null,
    food.brandName || null,
    food.ingredients || null,
    food.gtinUpc || null,
    food.marketCountry || null,
    food.foodCategory || null,
    food.caloriesPer100g || null,
    food.proteinPer100g || null,
    food.carbsPer100g || null,
    food.fatPer100g || null,
    food.fiberPer100g || null,
    food.sugarPer100g || null,
    food.sodiumPer100g || null,
    food.calciumPer100g || null,
    food.ironPer100g || null,
    food.potassiumPer100g || null,
    food.vitaminCPer100g || null,
    now, // createdAt
    now, // updatedAt
  ]

  return values.map(escapeCSVValue).join(',')
}

async function parseDatasetToCSV(
  datasetFiles: string[],
  datasetName: string,
  csvStream: NodeJS.WritableStream,
): Promise<number> {
  console.info(`\n📊 Processing ${datasetName} dataset...`)

  // Find the required CSV files
  const foodFile = datasetFiles.find((file) => file.endsWith('food.csv'))
  const foodNutrientFile = datasetFiles.find((file) =>
    file.endsWith('food_nutrient.csv'),
  )
  const nutrientFile = datasetFiles.find((file) => {
    const filename = path.basename(file)
    return filename === 'nutrient.csv'
  })

  if (!foodFile || !foodNutrientFile || !nutrientFile) {
    console.error(`❌ Missing required files for ${datasetName}:`)
    console.error(`  food.csv: ${foodFile ? '✅' : '❌'}`)
    console.error(`  food_nutrient.csv: ${foodNutrientFile ? '✅' : '❌'}`)
    console.error(`  nutrient.csv: ${nutrientFile ? '✅' : '❌'}`)
    return 0
  }

  console.info(`📄 Reading ${path.basename(foodFile)}...`)
  const foods = await parseCSV<RawFood>(foodFile)

  console.info(`📄 Reading ${path.basename(nutrientFile)}...`)
  const nutrients = await parseCSV<RawNutrient>(nutrientFile)

  console.info(`📄 Reading ${path.basename(foodNutrientFile)}...`)
  const foodNutrients = await parseCSV<RawFoodNutrient>(foodNutrientFile)

  console.info(
    `✅ Loaded ${foods.length} foods, ${nutrients.length} nutrients, ${foodNutrients.length} food-nutrient relationships`,
  )

  // Create lookup maps for efficiency
  const nutrientMap = new Map<string, RawNutrient>()
  nutrients.forEach((nutrient) => {
    nutrientMap.set(nutrient.id, nutrient)
  })

  const foodNutrientMap = new Map<string, Map<number, number>>()
  foodNutrients.forEach((fn) => {
    const nutrientId = parseInt(fn.nutrient_id)
    const amount = parseNutrientValue(fn.amount)
    if (amount !== undefined) {
      if (!foodNutrientMap.has(fn.fdc_id)) {
        foodNutrientMap.set(fn.fdc_id, new Map())
      }
      foodNutrientMap.get(fn.fdc_id)!.set(nutrientId, amount)
    }
  })

  console.info(`🔄 Converting ${foods.length} foods to CSV...`)

  let processedCount = 0
  let validCount = 0

  for (const rawFood of foods) {
    const fdcId = parseInt(rawFood.fdc_id)
    if (isNaN(fdcId)) continue

    const foodNutrients = foodNutrientMap.get(rawFood.fdc_id) || new Map()

    const parsedFood: ParsedFood = {
      fdcId,
      dataType: rawFood.data_type,
      description: rawFood.description?.trim() || '',
      brandOwner: rawFood.brand_owner?.trim() || undefined,
      brandName: rawFood.brand_name?.trim() || undefined,
      ingredients: rawFood.ingredients?.trim() || undefined,
      gtinUpc: rawFood.gtin_upc?.trim() || undefined,
      marketCountry: rawFood.market_country?.trim() || undefined,
      foodCategory: rawFood.category?.trim() || undefined,

      // Extract nutrition values
      proteinPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.PROTEIN) ?? 0,
      carbsPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.CARBS) ?? 0,
      fatPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.FAT) ?? 0,
      fiberPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.FIBER) ?? 0,
      sugarPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.SUGAR) ?? 0,
      sodiumPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.SODIUM) ?? 0,
      calciumPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.CALCIUM) ?? 0,
      ironPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.IRON) ?? 0,
      potassiumPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.POTASSIUM) ?? 0,
      vitaminCPer100g: foodNutrients.get(ESSENTIAL_NUTRIENTS.VITAMIN_C) ?? 0,
    }

    // Calculate calories if missing but macros are available
    const originalCalories = foodNutrients.get(ESSENTIAL_NUTRIENTS.ENERGY_KCAL)
    if (
      !originalCalories &&
      (parsedFood.proteinPer100g ||
        parsedFood.carbsPer100g ||
        parsedFood.fatPer100g)
    ) {
      // Standard caloric values: Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g
      const calculatedCalories =
        (parsedFood.proteinPer100g || 0) * 4 +
        (parsedFood.carbsPer100g || 0) * 4 +
        (parsedFood.fatPer100g || 0) * 9

      parsedFood.caloriesPer100g = Math.round(calculatedCalories * 100) / 100 // Round to 2 decimal places
    } else {
      parsedFood.caloriesPer100g = originalCalories ?? 0
    }

    processedCount++

    // Filter to only include foundation foods with meaningful nutrition data
    if (
      parsedFood.dataType === 'foundation_food' &&
      ((parsedFood.caloriesPer100g ?? 0) > 0 ||
        (parsedFood.proteinPer100g ?? 0) > 0 ||
        (parsedFood.carbsPer100g ?? 0) > 0 ||
        (parsedFood.fatPer100g ?? 0) > 0)
    ) {
      // Clean up description by removing unwanted text
      parsedFood.description = parsedFood.description
        .replace(
          /\s*\(Includes foods for USDA's Food Distribution Program\)/gi,
          '',
        )
        .trim()

      // Convert to CSV and write directly
      const csvRow = convertToCSVRow(parsedFood)
      csvStream.write(csvRow + '\n')
      validCount++
    }

    // Progress logging
    if (processedCount % 1000 === 0) {
      const progress = ((processedCount / foods.length) * 100).toFixed(1)
      console.info(
        `  📈 Processed ${processedCount}/${foods.length} foods (${progress}%) - ${validCount} valid`,
      )
    }
  }

  console.info(
    `✅ ${datasetName}: Processed ${processedCount} foods, ${validCount} written to CSV`,
  )

  return validCount
}

async function main(): Promise<void> {
  console.info('🚀 Starting USDA data to CSV conversion...')

  try {
    await ensureDirectoryExists(PARSED_DIR)

    // Find all dataset files
    const { foundationFoods } = await findDatasetFiles()

    if (foundationFoods.length === 0) {
      console.error('❌ No Foundation Foods dataset files found.')
      console.error('Please run the download script first:')
      console.error('npx tsx src/scripts/download-usda-data.ts')
      process.exit(1)
    }

    // Create CSV file path
    const csvPath = path.join(PARSED_DIR, 'usda_foods_foundation_only.csv')
    const csvStream = createWriteStream(csvPath, { encoding: 'utf8' })

    // Write CSV header
    csvStream.write(CSV_COLUMNS.join(',') + '\n')
    console.info(`📄 CSV header written to: ${csvPath}`)
    console.info(
      'ℹ️  Processing ONLY Foundation Foods (foundation_food data type)',
    )
    console.info(
      'ℹ️  Cleaning up descriptions, calculating missing calories from macros, and requiring some nutrition data',
    )

    let totalValidFoods = 0
    const startTime = Date.now()

    // Process Foundation Foods only
    const foundationCount = await parseDatasetToCSV(
      foundationFoods,
      'Foundation Foods (foundation_food only)',
      csvStream,
    )
    totalValidFoods += foundationCount

    // Close CSV stream
    csvStream.end()

    const elapsed = (Date.now() - startTime) / 1000
    const rate = totalValidFoods / elapsed

    // Create summary
    const summary = {
      totalFoods: totalValidFoods,
      foundationFoods: totalValidFoods, // All foods are foundation foods now
      srLegacy: 0, // No SR Legacy foods included
      csvFile: csvPath,
      parsedAt: new Date().toISOString(),
      note: 'Only foundation_food data type included in this export',
    }

    const summaryPath = path.join(PARSED_DIR, 'parsing_summary.json')
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))

    console.info('\n✅ USDA data to CSV conversion completed successfully!')
    console.info(
      `📊 Total foods processed: ${totalValidFoods.toLocaleString()}`,
    )
    console.info(`⏱️  Total time: ${elapsed.toFixed(1)} seconds`)
    console.info(`⚡ Average rate: ${rate.toFixed(0)} foods/second`)
    console.info(`📄 CSV file saved: ${csvPath}`)
    console.info(
      `💾 File size: ~${Math.round((totalValidFoods * 800) / (1024 * 1024))}MB estimated`,
    )

    console.info('\n📋 PostgreSQL import commands:')
    console.info(`\\copy "USDAFood" FROM '${csvPath}' CSV HEADER;`)
    console.info('\nOr using psql command line:')
    console.info(
      `psql -d your_database -c "\\copy \\"USDAFood\\" FROM '${csvPath}' CSV HEADER;"`,
    )

    console.info('\nReady for database import!')
  } catch (error) {
    console.error('\n❌ Error converting USDA data to CSV:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { main as convertUSDAToCSV }
