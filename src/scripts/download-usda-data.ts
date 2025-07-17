#!/usr/bin/env node
import { createWriteStream } from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { Extract } from 'unzipper'

import fs from 'fs/promises'

// USDA FoodData Central bulk dataset URLs
const DATASETS = {
  foundationFoods: {
    name: 'Foundation Foods',
    url: 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_csv_2025-04-24.zip',
    filename: 'foundation_foods_2025.zip',
  },
  srLegacy: {
    name: 'SR Legacy',
    url: 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip',
    filename: 'sr_legacy_2018.zip',
  },
} as const

const DATA_DIR = path.join(process.cwd(), 'data', 'usda')
const DOWNLOADS_DIR = path.join(DATA_DIR, 'downloads')
const EXTRACTED_DIR = path.join(DATA_DIR, 'extracted')

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  }
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  console.log(`Downloading: ${url}`)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`)
  }

  const fileStream = createWriteStream(outputPath)

  if (!response.body) {
    throw new Error('Response body is null')
  }

  await pipeline(response.body as any, fileStream)
  console.log(`Downloaded: ${outputPath}`)
}

async function extractZipFile(
  zipPath: string,
  extractTo: string,
): Promise<void> {
  console.log(`Extracting: ${zipPath} to ${extractTo}`)

  const zip = await fs.readFile(zipPath)

  await new Promise<void>((resolve, reject) => {
    const extract = Extract({ path: extractTo })

    extract.on('close', () => {
      console.log(`Extracted: ${zipPath}`)
      resolve()
    })

    extract.on('error', reject)

    // Create a readable stream from the zip buffer
    const stream = require('stream')
    const readable = new stream.Readable()
    readable.push(zip)
    readable.push(null)

    readable.pipe(extract)
  })
}

async function downloadAndExtractDataset(
  dataset: (typeof DATASETS)[keyof typeof DATASETS],
): Promise<void> {
  const downloadPath = path.join(DOWNLOADS_DIR, dataset.filename)
  const extractPath = path.join(
    EXTRACTED_DIR,
    dataset.name.toLowerCase().replace(' ', '_'),
  )

  // Check if already downloaded
  try {
    await fs.access(downloadPath)
    console.log(`File already exists: ${downloadPath}`)
  } catch {
    // Download if doesn't exist
    await downloadFile(dataset.url, downloadPath)
  }

  // Check if already extracted
  try {
    await fs.access(extractPath)
    console.log(`Already extracted: ${extractPath}`)
  } catch {
    // Extract if doesn't exist
    await ensureDirectoryExists(extractPath)
    await extractZipFile(downloadPath, extractPath)
  }
}

async function downloadUSDAData(): Promise<void> {
  console.log('🥬 Starting USDA FoodData Central bulk data download...\n')

  try {
    // Ensure directories exist
    await ensureDirectoryExists(DOWNLOADS_DIR)
    await ensureDirectoryExists(EXTRACTED_DIR)

    // Download and extract each dataset
    for (const [key, dataset] of Object.entries(DATASETS)) {
      console.log(`\n📦 Processing ${dataset.name}...`)
      await downloadAndExtractDataset(dataset)
    }

    console.log('\n✅ USDA data download and extraction completed!')
    console.log(`\nData location: ${DATA_DIR}`)
    console.log('Next steps:')
    console.log('1. Run the data parser script to process CSV files')
    console.log(
      '2. Run the database import script to load data into PostgreSQL',
    )
  } catch (error) {
    console.error('\n❌ Error downloading USDA data:', error)
    process.exit(1)
  }
}

// Run the script if called directly
if (require.main === module) {
  downloadUSDAData()
}

export { downloadUSDAData }
