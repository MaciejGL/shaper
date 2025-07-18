#!/usr/bin/env node
// Direct CSV to Database sync for USDA data
// Reads from existing CSV and does upserts with single database connection
// OPTIMIZED FOR MEMORY EFFICIENCY - Uses streaming processing
import { Prisma, PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse'
import { createReadStream } from 'fs'
import path from 'path'

import { formatNumber } from '@/lib/utils'

import fs from 'fs/promises'

// Database-safe bulk SQL operations
const BATCH_SIZE = 250 // Reduced for stability with large datasets
const PAUSE_BETWEEN_BATCHES = 200 // Pause to reduce database load

// START_FROM_RECORD allows resuming from a specific position (useful for debugging)
const START_FROM_RECORD = parseInt(process.env.START_FROM_RECORD || '0')

// Single Prisma instance with sync-optimized connection settings
const prisma = new PrismaClient({
  datasourceUrl: process.env.SYNC_DATABASE_URL || process.env.DATABASE_URL,
})

interface CSVFood {
  id: string
  fdcId: string
  dataType: string
  description: string
  brandOwner?: string
  brandName?: string
  ingredients?: string
  gtinUpc?: string
  marketCountry?: string
  foodCategory?: string
  caloriesPer100g?: string
  proteinPer100g?: string
  carbsPer100g?: string
  fatPer100g?: string
  fiberPer100g?: string
  sugarPer100g?: string
  sodiumPer100g?: string
  calciumPer100g?: string
  ironPer100g?: string
  potassiumPer100g?: string
  vitaminCPer100g?: string
  createdAt: string
  updatedAt: string
}

const DATA_DIR = path.join(process.cwd(), 'data', 'usda')
const PARSED_DIR = path.join(DATA_DIR, 'parsed')

// Safe parsing functions
function parseStringSafe(value?: string): string | undefined {
  if (!value || value.trim() === '' || value === 'NULL') return undefined
  return value.trim()
}

function parseFloatSafe(value?: string): number | undefined {
  if (!value || value.trim() === '' || value === 'NULL') return undefined
  const parsed = parseFloat(value)
  return isNaN(parsed) ? undefined : parsed
}

function parseIntSafe(value?: string): number | undefined {
  if (!value || value.trim() === '' || value === 'NULL') return undefined
  const parsed = parseInt(value)
  return isNaN(parsed) ? undefined : parsed
}

async function findLatestCSVFile(): Promise<string> {
  const csvPath = path.join(PARSED_DIR, 'usda_foods.csv')

  try {
    await fs.access(csvPath)
    console.info(`📄 Found CSV file: ${csvPath}`)
    return csvPath
  } catch {
    throw new Error(
      `CSV file not found at ${csvPath}. Please run the CSV conversion script first.`,
    )
  }
}

function convertCSVToFood(row: CSVFood) {
  return {
    id: row.id,
    fdcId: parseIntSafe(row.fdcId)!,
    description: row.description,
    dataType: row.dataType,
    foodCategory: parseStringSafe(row.foodCategory),
    brandOwner: parseStringSafe(row.brandOwner),
    brandName: parseStringSafe(row.brandName),
    ingredients: parseStringSafe(row.ingredients),
    servingSize: undefined, // Not available in current CSV structure
    servingSizeUnit: undefined, // Not available in current CSV structure
    publishedDate: undefined, // Not available in current CSV structure
    caloriesPer100g: parseFloatSafe(row.caloriesPer100g),
    proteinPer100g: parseFloatSafe(row.proteinPer100g),
    carbsPer100g: parseFloatSafe(row.carbsPer100g),
    fatPer100g: parseFloatSafe(row.fatPer100g),
    fiberPer100g: parseFloatSafe(row.fiberPer100g),
    sugarPer100g: parseFloatSafe(row.sugarPer100g),
    sodiumPer100g: parseFloatSafe(row.sodiumPer100g),
    calciumPer100g: parseFloatSafe(row.calciumPer100g),
    ironPer100g: parseFloatSafe(row.ironPer100g),
    potassiumPer100g: parseFloatSafe(row.potassiumPer100g),
    vitaminCPer100g: parseFloatSafe(row.vitaminCPer100g),
  }
}

async function upsertFoodsBatch(
  foods: CSVFood[],
): Promise<{ newCount: number; updatedCount: number }> {
  try {
    // Convert all foods to proper format
    const foodDataList = foods.map(convertCSVToFood)

    // Deduplicate by fdcId within this batch (keep the last occurrence)
    const deduplicatedFoods = new Map<number, (typeof foodDataList)[0]>()
    foodDataList.forEach((food) => {
      deduplicatedFoods.set(food.fdcId, food)
    })
    const finalFoodList = Array.from(deduplicatedFoods.values())

    if (finalFoodList.length !== foodDataList.length) {
      console.warn(
        `🔄 Deduplicated batch: ${foodDataList.length} → ${finalFoodList.length} foods (removed ${foodDataList.length - finalFoodList.length} duplicates)`,
      )
    }

    // Build VALUES clause for bulk insert
    const now = new Date().toISOString()
    const values = finalFoodList
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
          data.fdcId,
          escapeSql(data.description),
          escapeSql(data.dataType),
          escapeSql(data.foodCategory),
          escapeSql(data.brandOwner),
          escapeSql(data.brandName),
          escapeSql(data.ingredients),
          data.servingSize ?? 'NULL',
          escapeSql(data.servingSizeUnit),
          data.publishedDate ? escapeSql(data.publishedDate) : 'NULL',
          data.caloriesPer100g ?? 'NULL',
          data.proteinPer100g ?? 'NULL',
          data.carbsPer100g ?? 'NULL',
          data.fatPer100g ?? 'NULL',
          data.fiberPer100g ?? 'NULL',
          data.sugarPer100g ?? 'NULL',
          data.sodiumPer100g ?? 'NULL',
          data.calciumPer100g ?? 'NULL',
          data.ironPer100g ?? 'NULL',
          data.potassiumPer100g ?? 'NULL',
          data.vitaminCPer100g ?? 'NULL',
          escapeSql(now), // createdAt
          escapeSql(now), // updatedAt
        ].join(',')})`
      })
      .join(',')

    // Execute bulk upsert in single query
    await prisma.$executeRaw`
      INSERT INTO "USDAFood" (
        id, "fdcId", description, "dataType", "foodCategory", "brandOwner", "brandName", 
        ingredients, "servingSize", "servingSizeUnit", "publishedDate",
        "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "fiberPer100g",
        "sugarPer100g", "sodiumPer100g", "calciumPer100g", "ironPer100g", "potassiumPer100g",
        "vitaminCPer100g", "createdAt", "updatedAt"
      )
      VALUES ${Prisma.raw(values)}
      ON CONFLICT ("fdcId") DO UPDATE SET
        description = EXCLUDED.description,
        "dataType" = EXCLUDED."dataType",
        "foodCategory" = EXCLUDED."foodCategory",
        "brandOwner" = EXCLUDED."brandOwner",
        "brandName" = EXCLUDED."brandName",
        ingredients = EXCLUDED.ingredients,
        "servingSize" = EXCLUDED."servingSize",
        "servingSizeUnit" = EXCLUDED."servingSizeUnit",
        "publishedDate" = EXCLUDED."publishedDate",
        "caloriesPer100g" = EXCLUDED."caloriesPer100g",
        "proteinPer100g" = EXCLUDED."proteinPer100g",
        "carbsPer100g" = EXCLUDED."carbsPer100g",
        "fatPer100g" = EXCLUDED."fatPer100g",
        "fiberPer100g" = EXCLUDED."fiberPer100g",
        "sugarPer100g" = EXCLUDED."sugarPer100g",
        "sodiumPer100g" = EXCLUDED."sodiumPer100g",
        "calciumPer100g" = EXCLUDED."calciumPer100g",
        "ironPer100g" = EXCLUDED."ironPer100g",
        "potassiumPer100g" = EXCLUDED."potassiumPer100g",
        "vitaminCPer100g" = EXCLUDED."vitaminCPer100g",
        "updatedAt" = EXCLUDED."updatedAt"
    `

    // Note: For USDA we can't easily determine new vs updated without additional queries
    // So we'll return the batch size as newCount for progress tracking
    return { newCount: finalFoodList.length, updatedCount: 0 }
  } catch (error) {
    console.error('❌ Error in batch upsert:', error)
    throw error
  }
}

async function refreshConnection() {
  try {
    await prisma.$disconnect()
    await prisma.$connect()
    console.info('🔄 Database connection refreshed')
  } catch (error) {
    console.warn('⚠️  Warning: Failed to refresh connection:', error)
  }
}

async function forceGarbageCollection() {
  if (global.gc) {
    global.gc()
  }
  // Small delay to allow cleanup
  await new Promise((resolve) => setTimeout(resolve, 10))
}

async function streamProcessCSV(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let batch: CSVFood[] = []
    let rowCount = 0
    let totalProcessed = 0
    let batchCount = 0

    // Track processed count for connection refresh
    let processedSinceRefresh = 0

    console.info(
      `🔄 Starting streaming CSV processing${START_FROM_RECORD > 0 ? ` from record ${formatNumber(START_FROM_RECORD)}` : ''}...`,
    )

    const stream = createReadStream(filePath).pipe(
      parse({ columns: true, skip_empty_lines: true }),
    )

    stream.on('data', async (row: CSVFood) => {
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
          // Refresh connection every 25k records
          if (processedSinceRefresh >= 25000) {
            await refreshConnection()
            processedSinceRefresh = 0
          }

          const { newCount } = await upsertFoodsBatch(batch)
          totalProcessed += newCount
          processedSinceRefresh += batch.length

          const actualProcessed = rowCount - START_FROM_RECORD
          console.info(
            `Batch ${formatNumber(batchCount)}: ${formatNumber(newCount)} foods processed (Record: ${formatNumber(rowCount)}, Total Processed: ${formatNumber(actualProcessed)})`,
          )

          // Clear the batch to free memory
          batch = []

          // Force garbage collection
          await forceGarbageCollection()

          // Small pause between batches
          await new Promise((resolve) =>
            setTimeout(resolve, PAUSE_BETWEEN_BATCHES),
          )
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
      // Process any remaining foods in the final batch
      if (batch.length > 0) {
        batchCount++
        try {
          // Refresh connection every 25k records
          if (processedSinceRefresh >= 25000) {
            await refreshConnection()
            processedSinceRefresh = 0
          }

          const { newCount } = await upsertFoodsBatch(batch)
          totalProcessed += newCount
          processedSinceRefresh += batch.length

          console.info(
            `✅ Final batch ${batchCount}: ${newCount} foods processed (Record: ${formatNumber(rowCount)})`,
          )
        } catch (error) {
          console.error(`❌ Error processing final batch:`, error)
        }
      }

      const actualProcessed = rowCount - START_FROM_RECORD
      console.info(
        `\n🎉 Sync completed: ${totalProcessed} foods processed, ${actualProcessed} records processed (from record ${START_FROM_RECORD + 1} to ${rowCount})`,
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
  console.info('🔄 Starting USDA database sync...')

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

// Run the sync if this script is executed directly
if (require.main === module) {
  syncDatabase()
}

export { syncDatabase }
