#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */
// Direct Parquet to CSV conversion for OpenFoodFacts data
// Skips JSON intermediate step for better performance and memory usage
import { randomUUID } from 'crypto'
import { createWriteStream } from 'fs'
import path from 'path'

import fs from 'fs/promises'

// Configuration - can be overridden via command line args
const DEFAULT_LIMIT = null // No limit by default - process all products
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith('--limit='))
const PROCESSING_LIMIT = LIMIT_ARG
  ? parseInt(LIMIT_ARG.split('=')[1])
  : DEFAULT_LIMIT

// Batch size for memory-efficient processing
const BATCH_SIZE = 10000

// DuckDB dependency check
let duckdb: any
try {
  duckdb = require('duckdb')
} catch (err) {
  console.error(
    '❌ DuckDB not found. Please install it with: npm install duckdb',
  )
  process.exit(1)
}

interface ParsedOpenFoodFactsProduct {
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
  servingQuantity?: number
  energyKcal100g?: number
  proteins100g?: number
  carbohydrates100g?: number
  fat100g?: number
  fiber100g?: number
  sugars100g?: number
  salt100g?: number
  saturatedFat100g?: number
  sodium100g?: number
  nutriScore?: string
  novaGroup?: number
  ecoScore?: string
  completeness?: number
  lastModified?: string
  scansN?: number
  uniqueScansN?: number
  imageUrl?: string
  imageFrontUrl?: string
  imageIngredientsUrl?: string
  imageNutritionUrl?: string
}

const DATA_DIR = path.join(process.cwd(), 'data', 'openfoodfacts')
const DOWNLOADS_DIR = path.join(DATA_DIR, 'downloads')
const PARSED_DIR = path.join(DATA_DIR, 'parsed')

// CSV columns matching the database schema exactly
const CSV_COLUMNS = [
  'id',
  'code',
  'productName',
  'brands',
  'categories',
  'origins',
  'countries',
  'labels',
  'packaging',
  'ingredients',
  'allergens',
  'traces',
  'servingSize',
  'servingQuantity',
  'energyKcal100g',
  'proteins100g',
  'carbohydrates100g',
  'fat100g',
  'fiber100g',
  'sugars100g',
  'salt100g',
  'saturatedFat100g',
  'sodium100g',
  'nutriScore',
  'novaGroup',
  'ecoScore',
  'completeness',
  'lastModified',
  'scansN',
  'uniqueScansN',
  'imageUrl',
  'imageFrontUrl',
  'imageIngredientsUrl',
  'imageNutritionUrl',
  'createdAt',
  'updatedAt',
  'importedAt',
]

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

function cleanString(value: any): string | undefined {
  if (value === null || value === undefined || value === '' || value === 'null')
    return undefined

  // Handle arrays - join with commas
  if (Array.isArray(value)) {
    const filtered = value.filter(
      (item) => item && item !== 'null' && item !== '',
    )
    return filtered.length > 0 ? filtered.join(', ') : undefined
  }

  // Handle objects - avoid [object Object]
  if (typeof value === 'object') {
    return undefined
  }

  const stringValue = String(value).trim()
  return stringValue && stringValue !== 'null' ? stringValue : undefined
}

function cleanArray(value: any): string | undefined {
  if (!value || value === 'null') return undefined

  if (Array.isArray(value)) {
    // Extract text from objects or use strings directly
    const items = value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          return item.text || item.name || item.id || String(item)
        }
        return String(item)
      })
      .filter((item) => item && item !== 'null' && item !== '')

    // Remove duplicates and join
    const uniqueItems = [...new Set(items)]
    return uniqueItems.length > 0 ? uniqueItems.join(', ') : undefined
  }

  return cleanString(value)
}

function cleanNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === '' || value === 'null')
    return undefined

  const num = parseFloat(value)
  return !isNaN(num) ? num : undefined
}

function calculateSodiumFromSalt(
  saltPer100g: number | undefined,
): number | undefined {
  // OpenFoodFacts stores salt, but we also want sodium
  // Sodium = Salt * 0.4 (approximately)
  if (!saltPer100g) return undefined
  return saltPer100g * 0.4
}

function extractNutrientPer100g(
  nutriments: any[],
  nutrientName: string,
): number | undefined {
  if (!Array.isArray(nutriments)) return undefined

  const nutrient = nutriments.find((n) => n.name === nutrientName)
  if (!nutrient || !nutrient['100g']) return undefined

  const value = Number(nutrient['100g'])
  return isNaN(value) ? undefined : value
}

function formatBarcodeForImagePath(barcode: string): string {
  // OpenFoodFacts formats barcodes like: 1234567890123 -> 123/456/789/0123
  const padded = barcode.padStart(13, '0')
  const parts = []
  for (let i = 0; i < padded.length; i += 3) {
    parts.push(padded.slice(i, i + 3))
  }
  return parts.join('/')
}

function extractImageUrl(
  images: any,
  code: string,
  imageType: string,
): string | undefined {
  if (!images || typeof images !== 'object') return undefined

  // Find image by type (front, ingredients, nutrition)
  const imageEntries = Object.values(images).filter(
    (img: any) => img && img.key && img.key.includes(imageType),
  )

  if (imageEntries.length === 0) return undefined

  const image = imageEntries[0] as any
  if (!image.imgid) return undefined

  // Construct OpenFoodFacts image URL
  const formattedBarcode = formatBarcodeForImagePath(code)
  return `https://images.openfoodfacts.org/images/products/${formattedBarcode}/${image.imgid}_400.jpg`
}

function extractProductName(productNameArray: any): string | undefined {
  if (!Array.isArray(productNameArray) || productNameArray.length === 0) {
    return undefined
  }

  // First try to find "main" language
  const mainEntry = productNameArray.find(
    (entry: any) => entry && entry.lang === 'main' && entry.text,
  )

  if (mainEntry) {
    return cleanString(mainEntry.text)
  }

  // Fall back to first entry with text
  const firstEntry = productNameArray.find((entry: any) => entry && entry.text)

  return firstEntry ? cleanString(firstEntry.text) : undefined
}

function parseLastModifiedDate(
  lastModified: string | undefined,
): string | null {
  if (!lastModified) return null

  try {
    // Check if it's a Unix timestamp (number as string)
    const timestamp = Number(lastModified)

    if (!isNaN(timestamp) && timestamp > 0) {
      // OpenFoodFacts uses Unix timestamps in seconds, JavaScript Date expects milliseconds
      return new Date(timestamp * 1000).toISOString()
    }

    // Try parsing as ISO date string
    const date = new Date(lastModified)

    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }

    return null
  } catch (error) {
    return null
  }
}

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

function convertToCSVRow(product: ParsedOpenFoodFactsProduct): string {
  const now = new Date().toISOString()

  const values = [
    randomUUID(), // id
    product.code,
    product.productName,
    product.brands || null,
    product.categories || null,
    product.origins || null,
    product.countries || null,
    product.labels || null,
    product.packaging || null,
    product.ingredients || null,
    product.allergens || null,
    product.traces || null,
    product.servingSize || null,
    product.servingQuantity || null,
    product.energyKcal100g || null,
    product.proteins100g || null,
    product.carbohydrates100g || null,
    product.fat100g || null,
    product.fiber100g || null,
    product.sugars100g || null,
    product.salt100g || null,
    product.saturatedFat100g || null,
    product.sodium100g || null,
    product.nutriScore || null,
    product.novaGroup || null,
    product.ecoScore || null,
    product.completeness || null,
    parseLastModifiedDate(product.lastModified),
    product.scansN || null,
    product.uniqueScansN || null,
    product.imageUrl || null,
    product.imageFrontUrl || null,
    product.imageIngredientsUrl || null,
    product.imageNutritionUrl || null,
    now, // createdAt
    now, // updatedAt
    now, // importedAt
  ]

  return values.map(escapeCSVValue).join(',')
}

function mapOpenFoodFactsFields(row: any): ParsedOpenFoodFactsProduct | null {
  // Skip products without basic required information
  const code = cleanString(row.code)
  const productName = extractProductName(row.product_name)

  if (!code || !productName) {
    return null
  }

  const lastModified = cleanString(row.last_modified_datetime)
  const nutriments = row.nutriments

  // Extract nutrition data from nutriments array
  const energyKcal100g = extractNutrientPer100g(nutriments, 'energy-kcal')
  const proteins100g = extractNutrientPer100g(nutriments, 'proteins')
  const carbohydrates100g = extractNutrientPer100g(nutriments, 'carbohydrates')
  const fat100g = extractNutrientPer100g(nutriments, 'fat')
  const fiber100g = extractNutrientPer100g(nutriments, 'fiber')
  const sugars100g = extractNutrientPer100g(nutriments, 'sugars')
  const salt100g = extractNutrientPer100g(nutriments, 'salt')
  const saturatedFat100g = extractNutrientPer100g(nutriments, 'saturated-fat')

  return {
    code,
    productName,
    brands: cleanString(row.brands),
    categories: cleanArray(row.categories),
    origins: cleanArray(row.origins),
    countries: cleanArray(row.countries),
    labels: cleanArray(row.labels),
    packaging: cleanString(row.packaging),
    ingredients: cleanArray(row.ingredients_text),
    allergens: cleanArray(row.allergens),
    traces: cleanArray(row.traces),
    servingSize: cleanString(row.serving_size),
    servingQuantity: cleanNumber(row.serving_quantity),

    // Nutrition per 100g
    energyKcal100g,
    proteins100g,
    carbohydrates100g,
    fat100g,
    fiber100g,
    sugars100g,
    salt100g,
    saturatedFat100g,
    sodium100g: calculateSodiumFromSalt(salt100g),

    // Quality indicators
    nutriScore: cleanString(row.nutriscore_grade)?.toUpperCase(),
    novaGroup: cleanNumber(row.nova_group),
    ecoScore: cleanString(row.ecoscore_grade)?.toUpperCase(),

    // Data quality
    completeness: cleanNumber(row.completeness),
    lastModified: lastModified,
    scansN: cleanNumber(row.scans_n),
    uniqueScansN: cleanNumber(row.unique_scans_n),

    // Images - extract from images object
    imageUrl: extractImageUrl(row.images, code, 'front'),
    imageFrontUrl: extractImageUrl(row.images, code, 'front'),
    imageIngredientsUrl: extractImageUrl(row.images, code, 'ingredients'),
    imageNutritionUrl: extractImageUrl(row.images, code, 'nutrition'),
  }
}

async function getTotalValidProductCount(
  db: any,
  filePath: string,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM '${filePath}'
      WHERE code IS NOT NULL 
        AND product_name IS NOT NULL
        AND array_length(product_name) > 0
      ${PROCESSING_LIMIT ? `LIMIT ${PROCESSING_LIMIT}` : ''}
    `

    db.all(countQuery, (err: any, rows: any[]) => {
      if (err) {
        reject(err)
        return
      }

      const totalCount = Number(rows[0]?.total_count || 0)
      resolve(totalCount)
    })
  })
}

async function parseParquetToCSV(
  filePath: string,
): Promise<{ totalProducts: number; summary: any }> {
  return new Promise(async (resolve, reject) => {
    console.info(`📊 Reading Parquet file: ${filePath}`)
    if (PROCESSING_LIMIT) {
      console.info(
        `🔢 Processing limit set to: ${PROCESSING_LIMIT.toLocaleString()} products`,
      )
    } else {
      console.info(`🔢 Processing ALL products (no limit)`)
    }
    console.info(
      `🔄 Converting directly to CSV in batches of ${BATCH_SIZE.toLocaleString()} to optimize memory usage`,
    )
    console.info(`📊 Counting total valid products...`)

    const db = new duckdb.Database(':memory:')
    const csvPath = path.join(PARSED_DIR, 'openfoodfacts_products.csv')

    let expectedTotal: number
    try {
      const totalInDataset = await getTotalValidProductCount(db, filePath)
      expectedTotal = PROCESSING_LIMIT
        ? Math.min(PROCESSING_LIMIT, totalInDataset)
        : totalInDataset

      if (PROCESSING_LIMIT) {
        console.info(
          `🎯 Expected total: ${expectedTotal.toLocaleString()} valid products (limited from ${totalInDataset.toLocaleString()})`,
        )
      } else {
        console.info(
          `🎯 Expected total: ${expectedTotal.toLocaleString()} valid products`,
        )
      }
      console.info(`⏳ This may take several minutes for a large dataset...`)
    } catch (err) {
      console.error('❌ Error counting products:', err)
      reject(err)
      return
    }

    let offset = 0
    let totalProcessed = 0
    let totalSkipped = 0

    // Create CSV write stream
    const csvStream = createWriteStream(csvPath, { encoding: 'utf8' })

    // Write CSV header
    csvStream.write(CSV_COLUMNS.join(',') + '\n')
    console.info(`📄 CSV header written, starting conversion...`)

    // Statistics tracking
    const stats = {
      withNutrition: 0,
      withImages: 0,
      withNutriScore: 0,
      byCountries: {} as Record<string, number>,
    }

    const startTime = Date.now()

    const processBatch = () => {
      const currentLimit = PROCESSING_LIMIT
        ? Math.min(BATCH_SIZE, PROCESSING_LIMIT - totalProcessed)
        : BATCH_SIZE

      if (PROCESSING_LIMIT && totalProcessed >= PROCESSING_LIMIT) {
        // Finished processing all requested items
        finishProcessing()
        return
      }

      const query = `
        SELECT 
          code,
          product_name,
          brands,
          categories,
          origins_tags as origins,
          countries_tags as countries,
          labels_tags as labels,
          packaging_tags as packaging,
          ingredients_text,
          allergens_tags as allergens,
          traces_tags as traces,
          serving_size,
          serving_quantity,
          nutriments,
          nutriscore_grade,
          nova_group,
          ecoscore_grade,
          completeness,
          last_modified_t as last_modified_datetime,
          scans_n,
          unique_scans_n,
          images
        FROM '${filePath}'
        WHERE code IS NOT NULL 
          AND product_name IS NOT NULL
          AND array_length(product_name) > 0
        LIMIT ${currentLimit} OFFSET ${offset}
      `

      db.all(query, async (err: any, rows: any[]) => {
        if (err) {
          console.error('❌ Error reading Parquet file:', err)
          reject(err)
          return
        }

        if (rows.length === 0) {
          // No more data to process
          finishProcessing()
          return
        }

        const progressPercent = (
          ((totalProcessed + rows.length) / expectedTotal) *
          100
        ).toFixed(1)
        console.info(
          `📊 Processing batch: ${totalProcessed + 1}-${totalProcessed + rows.length} (${rows.length} products) - ${progressPercent}%`,
        )

        let batchSkipped = 0

        for (const row of rows) {
          const mapped = mapOpenFoodFactsFields(row)
          if (mapped) {
            // Convert to CSV and write directly
            const csvRow = convertToCSVRow(mapped)
            csvStream.write(csvRow + '\n')

            // Update statistics
            if (mapped.energyKcal100g !== undefined) stats.withNutrition++
            if (mapped.imageUrl !== undefined) stats.withImages++
            if (mapped.nutriScore !== undefined) stats.withNutriScore++

            if (mapped.countries) {
              const countries = mapped.countries.split(',').map((c) => c.trim())
              countries.forEach((country) => {
                stats.byCountries[country] =
                  (stats.byCountries[country] || 0) + 1
              })
            }
          } else {
            batchSkipped++
          }
        }

        totalProcessed += rows.length - batchSkipped
        totalSkipped += batchSkipped

        console.info(
          `✅ Processed batch: ${rows.length - batchSkipped} valid products (${batchSkipped} skipped)`,
        )
        const overallProgress = (
          (totalProcessed / expectedTotal) *
          100
        ).toFixed(1)
        console.info(
          `📈 Total progress: ${totalProcessed.toLocaleString()} / ${expectedTotal.toLocaleString()} products (${overallProgress}%)`,
        )

        // Process next batch
        offset += rows.length

        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }

        // Continue with next batch
        setTimeout(processBatch, 10) // Small delay to allow GC
      })
    }

    const finishProcessing = async () => {
      try {
        // Close CSV stream
        csvStream.end()

        // Create summary
        const summary = {
          totalProducts: totalProcessed,
          withNutrition: stats.withNutrition,
          withImages: stats.withImages,
          withNutriScore: stats.withNutriScore,
          byCountries: stats.byCountries,
          parsedAt: new Date().toISOString(),
        }

        const finalProgress = ((totalProcessed / expectedTotal) * 100).toFixed(
          1,
        )
        const elapsed = (Date.now() - startTime) / 1000
        const rate = totalProcessed / elapsed

        console.info(
          `✅ Completed processing ${totalProcessed.toLocaleString()} / ${expectedTotal.toLocaleString()} valid products (${finalProgress}%)`,
        )
        if (totalSkipped > 0) {
          console.info(
            `⚠️  Skipped ${totalSkipped.toLocaleString()} products (missing required fields)`,
          )
        }
        console.info(`⏱️  Total time: ${elapsed.toFixed(1)} seconds`)
        console.info(`⚡ Average rate: ${rate.toFixed(0)} products/second`)
        console.info(`📄 CSV file saved: ${csvPath}`)
        console.info(
          `💾 File size: ~${Math.round((totalProcessed * 1200) / (1024 * 1024))}MB estimated`,
        )

        console.info('\n📋 PostgreSQL import commands:')
        console.info(
          `\\copy "OpenFoodFactsProduct" FROM '${csvPath}' CSV HEADER;`,
        )
        console.info('\nOr using psql command line:')
        console.info(
          `psql -d your_database -c "\\copy \\"OpenFoodFactsProduct\\" FROM '${csvPath}' CSV HEADER;"`,
        )

        db.close()
        resolve({ totalProducts: totalProcessed, summary })
      } catch (error) {
        reject(error)
      }
    }

    // Start processing
    processBatch()
  })
}

async function main(): Promise<void> {
  console.info('🚀 Starting OpenFoodFacts Parquet → CSV conversion...')

  try {
    await ensureDirectoryExists(PARSED_DIR)

    const parquetFile = path.join(DOWNLOADS_DIR, 'products.parquet')

    // Check if the Parquet file exists
    try {
      await fs.access(parquetFile)
    } catch {
      console.error(`❌ Parquet file not found: ${parquetFile}`)
      console.error('Please run the download script first:')
      console.error('npx tsx src/scripts/download-openfoodfacts-data.ts')
      process.exit(1)
    }

    // Convert Parquet to CSV directly
    const result = await parseParquetToCSV(parquetFile)

    if (result.totalProducts === 0) {
      console.error('❌ No valid products were processed.')
      process.exit(1)
    }

    // Save the summary
    const summaryPath = path.join(PARSED_DIR, 'parsing_summary.json')
    await fs.writeFile(summaryPath, JSON.stringify(result.summary, null, 2))

    console.info(
      '\n✅ OpenFoodFacts Parquet → CSV conversion completed successfully!',
    )
    console.info(
      `📊 Total products processed: ${result.totalProducts.toLocaleString()}`,
    )
    console.info(
      `🥗 Products with nutrition data: ${result.summary.withNutrition.toLocaleString()}`,
    )
    console.info(
      `📸 Products with images: ${result.summary.withImages.toLocaleString()}`,
    )
    console.info(
      `🏆 Products with Nutri-Score: ${result.summary.withNutriScore.toLocaleString()}`,
    )
    console.info(`📁 Files saved in: ${PARSED_DIR}`)
    console.info('\nReady for database import!')
  } catch (error) {
    console.error('\n❌ Error converting Parquet to CSV:', error)

    if (error instanceof Error && error.message?.includes('duckdb')) {
      console.error('\n💡 Hint: You may need to install DuckDB:')
      console.error('npm install duckdb')
    }

    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { main as parseParquetToCSV }
