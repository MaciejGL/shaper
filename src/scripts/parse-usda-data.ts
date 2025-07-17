#!/usr/bin/env node
import { parse } from 'csv-parse'
import { createReadStream } from 'fs'
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
  VITAMIN_C: 1162, // Vitamin C, total ascorbic acid
  VITAMIN_D: 1114, // Vitamin D (D2 + D3)
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
  nutrients: Record<
    number,
    {
      amount: number
      unit: string
    }
  >
  // Calculated per 100g values
  caloriesPer100g?: number
  proteinPer100g?: number
  carbsPer100g?: number
  fatPer100g?: number
  fiberPer100g?: number
}

const DATA_DIR = path.join(process.cwd(), 'data', 'usda')
const EXTRACTED_DIR = path.join(DATA_DIR, 'extracted')
const PARSED_DIR = path.join(DATA_DIR, 'parsed')

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

async function findDatasetFiles(): Promise<{
  foundationFoods: string[]
  srLegacy: string[]
}> {
  const foundationDir = path.join(EXTRACTED_DIR, 'foundation_foods')
  const srLegacyDir = path.join(EXTRACTED_DIR, 'sr_legacy')

  let foundationFoods: string[] = []
  let srLegacy: string[] = []

  try {
    const foundationContents = await fs.readdir(foundationDir, {
      recursive: true,
    })
    foundationFoods = foundationContents
      .filter((file) => typeof file === 'string')
      .map((file) => path.join(foundationDir, file))
  } catch (error) {
    console.warn('Foundation Foods directory not found:', error)
  }

  try {
    const srContents = await fs.readdir(srLegacyDir, { recursive: true })
    srLegacy = srContents
      .filter((file) => typeof file === 'string')
      .map((file) => path.join(srLegacyDir, file))
  } catch (error) {
    console.warn('SR Legacy directory not found:', error)
  }

  return { foundationFoods, srLegacy }
}

async function parseDataset(
  datasetFiles: string[],
  datasetName: string,
): Promise<ParsedFood[]> {
  console.log(`\n📊 Parsing ${datasetName} dataset...`)

  // Find the required CSV files
  const foodFile = datasetFiles.find((file) => file.endsWith('food.csv'))
  const foodNutrientFile = datasetFiles.find((file) =>
    file.endsWith('food_nutrient.csv'),
  )
  const nutrientFile = datasetFiles.find((file) =>
    file.endsWith('nutrient.csv'),
  )

  if (!foodFile || !foodNutrientFile || !nutrientFile) {
    console.error(`❌ Missing required files for ${datasetName}:`)
    console.error(`  food.csv: ${foodFile ? '✅' : '❌'}`)
    console.error(`  food_nutrient.csv: ${foodNutrientFile ? '✅' : '❌'}`)
    console.error(`  nutrient.csv: ${nutrientFile ? '✅' : '❌'}`)
    return []
  }

  console.log(`📄 Parsing ${path.basename(foodFile)}...`)
  const foods = await parseCSV<RawFood>(foodFile)

  console.log(`📄 Parsing ${path.basename(nutrientFile)}...`)
  const nutrients = await parseCSV<RawNutrient>(nutrientFile)

  console.log(`📄 Parsing ${path.basename(foodNutrientFile)}...`)
  const foodNutrients = await parseCSV<RawFoodNutrient>(foodNutrientFile)

  console.log(
    `✅ Parsed ${foods.length} foods, ${nutrients.length} nutrients, ${foodNutrients.length} food-nutrient relationships`,
  )

  // Create nutrient lookup
  const nutrientLookup = new Map<string, RawNutrient>()
  nutrients.forEach((nutrient) => {
    nutrientLookup.set(nutrient.id, nutrient)
  })

  // Group food nutrients by fdc_id
  const foodNutrientMap = new Map<string, RawFoodNutrient[]>()
  foodNutrients.forEach((fn) => {
    if (!foodNutrientMap.has(fn.fdc_id)) {
      foodNutrientMap.set(fn.fdc_id, [])
    }
    foodNutrientMap.get(fn.fdc_id)!.push(fn)
  })

  // Process foods
  const parsedFoods: ParsedFood[] = []

  for (const food of foods) {
    const fdcId = parseInt(food.fdc_id)
    if (isNaN(fdcId)) continue

    const nutrients: ParsedFood['nutrients'] = {}
    const foodNutrientList = foodNutrientMap.get(food.fdc_id) || []

    // Process nutrients for this food
    for (const fn of foodNutrientList) {
      const nutrientId = parseInt(fn.nutrient_id)
      const amount = parseFloat(fn.amount)

      if (isNaN(nutrientId) || isNaN(amount)) continue

      const nutrient = nutrientLookup.get(fn.nutrient_id)
      if (nutrient) {
        nutrients[nutrientId] = {
          amount,
          unit: nutrient.unit_name,
        }
      }
    }

    // Calculate per 100g values for essential nutrients
    const parsedFood: ParsedFood = {
      fdcId,
      dataType: food.data_type,
      description: food.description,
      brandOwner: food.brand_owner || undefined,
      brandName: food.brand_name || undefined,
      ingredients: food.ingredients || undefined,
      gtinUpc: food.gtin_upc || undefined,
      marketCountry: food.market_country || undefined,
      foodCategory: food.category || undefined,
      nutrients,
      // Essential nutrients (assuming values are already per 100g)
      caloriesPer100g: nutrients[ESSENTIAL_NUTRIENTS.ENERGY_KCAL]?.amount,
      proteinPer100g: nutrients[ESSENTIAL_NUTRIENTS.PROTEIN]?.amount,
      carbsPer100g: nutrients[ESSENTIAL_NUTRIENTS.CARBS]?.amount,
      fatPer100g: nutrients[ESSENTIAL_NUTRIENTS.FAT]?.amount,
      fiberPer100g: nutrients[ESSENTIAL_NUTRIENTS.FIBER]?.amount,
    }

    parsedFoods.push(parsedFood)
  }

  console.log(`✅ Processed ${parsedFoods.length} foods from ${datasetName}`)
  return parsedFoods
}

async function saveJsonFile(filePath: string, data: any): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  const stats = await fs.stat(filePath)
  console.log(
    `💾 Saved ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`,
  )
}

async function main(): Promise<void> {
  console.log('🚀 Starting USDA data parsing...')

  try {
    await ensureDirectoryExists(PARSED_DIR)

    const { foundationFoods, srLegacy } = await findDatasetFiles()

    const allParsedFoods: ParsedFood[] = []

    // Parse Foundation Foods
    if (foundationFoods.length > 0) {
      const foundationData = await parseDataset(
        foundationFoods,
        'Foundation Foods',
      )
      allParsedFoods.push(...foundationData)

      // Save Foundation Foods separately
      const foundationPath = path.join(PARSED_DIR, 'foundation_foods.json')
      await saveJsonFile(foundationPath, foundationData)
    }

    // Parse SR Legacy
    if (srLegacy.length > 0) {
      const srLegacyData = await parseDataset(srLegacy, 'SR Legacy')
      allParsedFoods.push(...srLegacyData)

      // Save SR Legacy separately
      const srLegacyPath = path.join(PARSED_DIR, 'sr_legacy.json')
      await saveJsonFile(srLegacyPath, srLegacyData)
    }

    // Save combined data
    if (allParsedFoods.length > 0) {
      const combinedPath = path.join(PARSED_DIR, 'combined_foods.json')
      await saveJsonFile(combinedPath, allParsedFoods)

      // Create summary
      const summary = {
        totalFoods: allParsedFoods.length,
        foundationFoods:
          foundationFoods.length > 0
            ? allParsedFoods.filter((f) => f.dataType === 'foundation_food')
                .length
            : 0,
        srLegacy:
          srLegacy.length > 0
            ? allParsedFoods.filter((f) => f.dataType === 'sr_legacy_food')
                .length
            : 0,
        dataTypes: [...new Set(allParsedFoods.map((f) => f.dataType))],
        parsedAt: new Date().toISOString(),
      }

      const summaryPath = path.join(PARSED_DIR, 'parsing_summary.json')
      await saveJsonFile(summaryPath, summary)

      console.log('\n✅ Data parsing completed successfully!')
      console.log(`📊 Total foods processed: ${summary.totalFoods}`)
      console.log(`📁 Files saved in: ${PARSED_DIR}`)
      console.log('\nNext steps:')
      console.log(
        '1. Run the database import script to load data into PostgreSQL',
      )
      console.log('2. Update the food search service to query local USDA data')
    } else {
      console.error('❌ No data was parsed. Please check the extracted files.')
    }
  } catch (error) {
    console.error('\n❌ Error parsing USDA data:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { main as parseUSDAData }
