#!/usr/bin/env node
// Direct CSV to Database sync for OpenFoodFacts data
// Reads from existing CSV and does upserts with single database connection
// OPTIMIZED FOR MEMORY EFFICIENCY - Uses streaming processing
import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse'
import { createReadStream } from 'fs'
import path from 'path'
import { Pool } from 'pg'

import { formatNumber } from '@/lib/utils'

import fs from 'fs/promises'

// Database-safe bulk SQL operations (3.5M+ items)
const BATCH_SIZE = 250 // Further reduced for stability with large datasets
const PAUSE_BETWEEN_BATCHES = 200 // Increased pause to reduce database load

// START_FROM_RECORD allows resuming from a specific position (useful for debugging)
const START_FROM_RECORD = parseInt(process.env.START_FROM_RECORD || '0')

// Single Prisma instance with sync-optimized connection settings
const connectionString =
  process.env.SYNC_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

interface CSVProduct {
  id: string
  code: string
  productName: string
  brands?: string
  categories?: string
  origins?: string
  countries?: string
  labels?: string
  packaging?: string
  ingredients?: string
  allergens?: string
  traces?: string
  servingSize?: string
  servingQuantity?: string
  energyKcal100g?: string
  proteins100g?: string
  carbohydrates100g?: string
  fat100g?: string
  fiber100g?: string
  sugars100g?: string
  salt100g?: string
  saturatedFat100g?: string
  sodium100g?: string
  nutriScore?: string
  novaGroup?: string
  ecoScore?: string
  completeness?: string
  lastModified?: string
  scansN?: string
  uniqueScansN?: string
  imageUrl?: string
  imageFrontUrl?: string
  imageIngredientsUrl?: string
  imageNutritionUrl?: string
  createdAt: string
  updatedAt: string
  importedAt: string
}

const DATA_DIR = path.join(process.cwd(), 'data', 'openfoodfacts')
const PARSED_DIR = path.join(DATA_DIR, 'parsed')

function parseFloatSafe(value: string | undefined): number | undefined {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return undefined
  }
  const parsed = parseFloat(value)
  return isNaN(parsed) ? undefined : parsed
}

function parseStringSafe(value: string | undefined): string | null {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return null
  }

  // Remove null bytes and other invalid UTF-8 sequences that PostgreSQL can't handle
  const cleaned = value
    .replace(/\x00/g, '') // Remove null bytes (0x00) - the main cause of UTF-8 errors
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove other control characters
    .trim()

  return cleaned || null
}

function parseIntSafe(value: string | undefined): number | undefined {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return undefined
  }
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? undefined : parsed
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return undefined
  }
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? undefined : parsed
}

function convertCSVToProduct(row: CSVProduct) {
  return {
    id: row.id, // Include the existing ID from CSV
    code: row.code,
    productName: row.productName,
    brands: parseStringSafe(row.brands),
    categories: parseStringSafe(row.categories),
    origins: parseStringSafe(row.origins),
    countries: parseStringSafe(row.countries),
    labels: parseStringSafe(row.labels),
    packaging: parseStringSafe(row.packaging),
    ingredients: parseStringSafe(row.ingredients),
    allergens: parseStringSafe(row.allergens),
    traces: parseStringSafe(row.traces),
    servingSize: parseStringSafe(row.servingSize),
    servingQuantity: parseFloatSafe(row.servingQuantity),
    energyKcal100g: parseFloatSafe(row.energyKcal100g),
    proteins100g: parseFloatSafe(row.proteins100g),
    carbohydrates100g: parseFloatSafe(row.carbohydrates100g),
    fat100g: parseFloatSafe(row.fat100g),
    fiber100g: parseFloatSafe(row.fiber100g),
    sugars100g: parseFloatSafe(row.sugars100g),
    salt100g: parseFloatSafe(row.salt100g),
    saturatedFat100g: parseFloatSafe(row.saturatedFat100g),
    sodium100g: parseFloatSafe(row.sodium100g),
    nutriScore: parseStringSafe(row.nutriScore),
    novaGroup: parseIntSafe(row.novaGroup),
    ecoScore: parseStringSafe(row.ecoScore),
    completeness: parseFloatSafe(row.completeness),
    lastModified: parseDate(row.lastModified),
    scansN: parseIntSafe(row.scansN),
    uniqueScansN: parseIntSafe(row.uniqueScansN),
    imageUrl: parseStringSafe(row.imageUrl),
    imageFrontUrl: parseStringSafe(row.imageFrontUrl),
    imageIngredientsUrl: parseStringSafe(row.imageIngredientsUrl),
    imageNutritionUrl: parseStringSafe(row.imageNutritionUrl),
  }
}

async function findLatestCSVFile(): Promise<string> {
  try {
    const files = await fs.readdir(PARSED_DIR)
    const csvFiles = files.filter(
      (f) => f.endsWith('.csv') && f.startsWith('openfoodfacts_products'),
    )

    if (csvFiles.length === 0) {
      throw new Error(
        'No OpenFoodFacts CSV files found. Please run the parquet-to-csv conversion first.',
      )
    }

    // Sort by filename (contains timestamp) and get the latest
    csvFiles.sort().reverse()
    const latestFile = path.join(PARSED_DIR, csvFiles[0])

    return latestFile
  } catch (error) {
    console.error('❌ Error finding CSV file:', error)
    throw error
  }
}

async function upsertProductsBatch(
  products: CSVProduct[],
  debugInfo?: { startRecord: number },
) {
  try {
    // Enhanced debugging for problematic area
    if (
      debugInfo?.startRecord &&
      debugInfo.startRecord >= 419000 &&
      debugInfo.startRecord <= 421000
    ) {
      // Validate batch data
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        const recordNum = debugInfo.startRecord + i

        if (!product.code) {
          console.error(`❌ Record ${recordNum}: Missing product code!`)
          throw new Error(`Record ${recordNum}: Missing product code`)
        }

        if (product.code.length > 100) {
          console.warn(
            `⚠️  Record ${recordNum}: Very long code: ${product.code.substring(0, 50)}...`,
          )
        }

        if (product.productName && product.productName.length > 2000) {
          console.warn(
            `⚠️  Record ${recordNum}: Very long product name (${product.productName.length} chars)`,
          )
        }
      }
    }

    // Convert all products to proper format
    const productDataList = products.map(convertCSVToProduct)

    // Deduplicate by code within this batch (keep the last occurrence)
    const deduplicatedProducts = new Map<string, (typeof productDataList)[0]>()
    productDataList.forEach((product) => {
      deduplicatedProducts.set(product.code, product)
    })
    const finalProductList = Array.from(deduplicatedProducts.values())

    if (finalProductList.length !== productDataList.length) {
      console.warn(
        `🔄 Deduplicated batch: ${productDataList.length} → ${finalProductList.length} products (removed ${productDataList.length - finalProductList.length} duplicates)`,
      )
    }

    // Build VALUES clause for bulk insert
    const now = new Date().toISOString()
    const values = finalProductList
      .map((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const escapeSql = (val: any) => {
          if (val === null || val === undefined) return 'NULL'
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
          if (val instanceof Date) return `'${val.toISOString()}'`
          return `'${val}'`
        }

        return `(${[
          escapeSql(data.id), // Use existing ID from CSV
          escapeSql(data.code),
          escapeSql(data.productName),
          escapeSql(data.brands),
          escapeSql(data.categories),
          escapeSql(data.origins),
          escapeSql(data.countries),
          escapeSql(data.labels),
          escapeSql(data.packaging),
          escapeSql(data.ingredients),
          escapeSql(data.allergens),
          escapeSql(data.traces),
          escapeSql(data.servingSize),
          data.servingQuantity ?? 'NULL',
          data.energyKcal100g ?? 'NULL',
          data.proteins100g ?? 'NULL',
          data.carbohydrates100g ?? 'NULL',
          data.fat100g ?? 'NULL',
          data.fiber100g ?? 'NULL',
          data.sugars100g ?? 'NULL',
          data.salt100g ?? 'NULL',
          data.saturatedFat100g ?? 'NULL',
          data.sodium100g ?? 'NULL',
          escapeSql(data.nutriScore),
          data.novaGroup ?? 'NULL',
          escapeSql(data.ecoScore),
          data.completeness ?? 'NULL',
          data.lastModified ? escapeSql(data.lastModified) : 'NULL',
          data.scansN ?? 'NULL',
          data.uniqueScansN ?? 'NULL',
          escapeSql(data.imageUrl),
          escapeSql(data.imageFrontUrl),
          escapeSql(data.imageIngredientsUrl),
          escapeSql(data.imageNutritionUrl),
          escapeSql(now), // createdAt
          escapeSql(now), // updatedAt
          escapeSql(now), // importedAt
        ].join(',')})`
      })
      .join(',')

    // Execute bulk upsert in single query
    await prisma.$executeRaw`
      INSERT INTO "OpenFoodFactsProduct" (
        id, code, "productName", brands, categories, origins, countries, labels, packaging,
        ingredients, allergens, traces, "servingSize", "servingQuantity",
        "energyKcal100g", "proteins100g", "carbohydrates100g", "fat100g", "fiber100g",
        "sugars100g", "salt100g", "saturatedFat100g", "sodium100g", "nutriScore",
        "novaGroup", "ecoScore", completeness, "lastModified", "scansN", "uniqueScansN",
        "imageUrl", "imageFrontUrl", "imageIngredientsUrl", "imageNutritionUrl",
        "createdAt", "updatedAt", "importedAt"
      )
      VALUES ${Prisma.raw(values)}
      ON CONFLICT (code) DO UPDATE SET
        "productName" = EXCLUDED."productName",
        brands = EXCLUDED.brands,
        categories = EXCLUDED.categories,
        origins = EXCLUDED.origins,
        countries = EXCLUDED.countries,
        labels = EXCLUDED.labels,
        packaging = EXCLUDED.packaging,
        ingredients = EXCLUDED.ingredients,
        allergens = EXCLUDED.allergens,
        traces = EXCLUDED.traces,
        "servingSize" = EXCLUDED."servingSize",
        "servingQuantity" = EXCLUDED."servingQuantity",
        "energyKcal100g" = EXCLUDED."energyKcal100g",
        "proteins100g" = EXCLUDED."proteins100g",
        "carbohydrates100g" = EXCLUDED."carbohydrates100g",
        "fat100g" = EXCLUDED."fat100g",
        "fiber100g" = EXCLUDED."fiber100g",
        "sugars100g" = EXCLUDED."sugars100g",
        "salt100g" = EXCLUDED."salt100g",
        "saturatedFat100g" = EXCLUDED."saturatedFat100g",
        "sodium100g" = EXCLUDED."sodium100g",
        "nutriScore" = EXCLUDED."nutriScore",
        "novaGroup" = EXCLUDED."novaGroup",
        "ecoScore" = EXCLUDED."ecoScore",
        completeness = EXCLUDED.completeness,
        "lastModified" = EXCLUDED."lastModified",
        "scansN" = EXCLUDED."scansN",
        "uniqueScansN" = EXCLUDED."uniqueScansN",
        "imageUrl" = EXCLUDED."imageUrl",
        "imageFrontUrl" = EXCLUDED."imageFrontUrl",
        "imageIngredientsUrl" = EXCLUDED."imageIngredientsUrl",
        "imageNutritionUrl" = EXCLUDED."imageNutritionUrl",
        "updatedAt" = EXCLUDED."updatedAt"
    `

    // For bulk operations, we can't easily count new vs updated
    // Return the total count as "new" for simplicity
    return { newCount: finalProductList.length, updatedCount: 0 }
  } catch (error) {
    console.error(
      `❌ Error in bulk upsert (batch size: ${products.length}):`,
      error,
    )

    // Enhanced error details
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`)
      console.error(`Error message: ${error.message}`)
      if ('code' in error) {
        console.error(`Error code: ${error.code}`)
      }
    }

    // Log problematic products for debugging
    console.error(
      `First product in batch: ${products[0]?.code} - ${products[0]?.productName}`,
    )
    console.error(
      `Last product in batch: ${products[products.length - 1]?.code} - ${products[products.length - 1]?.productName}`,
    )

    throw error
  }
}

async function forceGarbageCollection() {
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
  // Small pause to allow memory cleanup
  await new Promise((resolve) => setTimeout(resolve, PAUSE_BETWEEN_BATCHES))
}

async function refreshConnection() {
  await prisma.$disconnect()
}

async function streamProcessCSV(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let batch: CSVProduct[] = []
    let rowCount = 0
    let totalNew = 0
    let totalUpdated = 0
    let batchCount = 0

    // Track processed count for connection refresh
    let processedSinceRefresh = 0

    console.info(
      `🔄 Starting streaming CSV processing${START_FROM_RECORD > 0 ? ` from record ${formatNumber(START_FROM_RECORD)}` : ''}...`,
    )

    const stream = createReadStream(filePath).pipe(
      parse({ columns: true, skip_empty_lines: true }),
    )

    stream.on('data', async (row: CSVProduct) => {
      rowCount++

      // Skip records until we reach START_FROM_RECORD
      if (rowCount <= START_FROM_RECORD) {
        if (rowCount % 50000 === 0) {
          console.info(
            `⏭️  Skipping to start position: ${formatNumber(rowCount)}/${formatNumber(START_FROM_RECORD)}`,
          )
        }
        return
      }

      batch.push(row)

      // Process batch when it reaches BATCH_SIZE
      if (batch.length >= BATCH_SIZE) {
        batchCount++

        // Pause the stream to process the batch
        stream.pause()

        try {
          // Refresh connection every 25k records (very frequent to prevent drops)
          if (processedSinceRefresh >= 25000) {
            await refreshConnection()
            processedSinceRefresh = 0
          }

          const batchStartRecord = rowCount - batch.length + 1
          const { newCount, updatedCount } = await upsertProductsBatch(batch, {
            startRecord: batchStartRecord,
          })
          totalNew += newCount
          totalUpdated += updatedCount
          processedSinceRefresh += batch.length

          const actualProcessed = rowCount - START_FROM_RECORD
          console.info(
            `Batch ${formatNumber(batchCount)}: ${formatNumber(newCount)} new, ${formatNumber(updatedCount)} updated (Record: ${formatNumber(rowCount)}, Processed: ${formatNumber(actualProcessed)})`,
          )

          // Clear the batch to free memory
          batch = []

          // Force garbage collection
          await forceGarbageCollection()
        } catch (error) {
          const batchStartRecord = rowCount - batch.length + 1
          console.error(
            `❌ Error processing batch ${batchCount} (records ${formatNumber(batchStartRecord)}-${formatNumber(rowCount)}):`,
            error,
          )

          // Don't continue processing after error in debug mode
          if (START_FROM_RECORD > 0) {
            console.error(`💥 Stopping sync due to error in debug mode`)
            throw error
          }
        }

        // Resume the stream
        stream.resume()
      }
    })

    stream.on('end', async () => {
      // Process any remaining products in the final batch
      if (batch.length > 0) {
        batchCount++
        try {
          // Refresh connection every 25k records
          if (processedSinceRefresh >= 25000) {
            await refreshConnection()
            processedSinceRefresh = 0
          }

          const batchStartRecord = rowCount - batch.length + 1
          const { newCount, updatedCount } = await upsertProductsBatch(batch, {
            startRecord: batchStartRecord,
          })
          totalNew += newCount
          totalUpdated += updatedCount
          processedSinceRefresh += batch.length

          console.info(
            `✅ Final batch ${batchCount}: ${newCount} new, ${updatedCount} updated (Record: ${formatNumber(rowCount)})`,
          )
        } catch (error) {
          console.error(`❌ Error processing final batch:`, error)
        }
      }

      const actualProcessed = rowCount - START_FROM_RECORD
      console.info(
        `\n🎉 Sync completed: ${totalNew} new, ${totalUpdated} updated, ${actualProcessed} records processed (from record ${START_FROM_RECORD + 1} to ${rowCount})`,
      )
      console.info('✅ Database sync completed successfully')
      resolve()
    })

    stream.on('error', (error) => {
      console.error('❌ Error reading CSV:', error)
      reject(error)
    })
  })
}

async function syncDatabase() {
  console.info('🔄 Starting OpenFoodFacts database sync...')

  try {
    // Find latest CSV file
    const csvFile = await findLatestCSVFile()

    // Process CSV file with streaming
    await streamProcessCSV(csvFile)
  } catch (error) {
    console.error('❌ Database sync failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
syncDatabase().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
