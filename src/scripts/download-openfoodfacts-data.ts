#!/usr/bin/env node
import { createWriteStream, promises as fs } from 'fs'
import https from 'https'
import * as path from 'path'
import * as readline from 'readline'

// Correct OpenFoodFacts Parquet file URL from Hugging Face
const OPENFOODFACTS_URL =
  'https://huggingface.co/datasets/openfoodfacts/product-database/resolve/main/food.parquet'
const DATA_DIR = path.join(process.cwd(), 'data', 'openfoodfacts')
const DOWNLOADS_DIR = path.join(DATA_DIR, 'downloads')
const PARQUET_FILE_PATH = path.join(DOWNLOADS_DIR, 'products.parquet')

async function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          const file = createWriteStream(outputPath)
          response.pipe(file)

          let downloadedBytes = 0
          const totalBytes = parseInt(
            response.headers['content-length'] || '0',
            10,
          )

          response.on('data', (chunk) => {
            downloadedBytes += chunk.length
            if (totalBytes > 0) {
              const percentage = ((downloadedBytes / totalBytes) * 100).toFixed(
                1,
              )
              const downloadedMB = (downloadedBytes / 1024 / 1024).toFixed(1)
              const totalMB = (totalBytes / 1024 / 1024).toFixed(1)
              process.stdout.write(
                `\rDownloading: ${percentage}% (${downloadedMB}/${totalMB} MB)`,
              )
            }
          })

          file.on('finish', () => {
            file.close()
            console.info('\n✅ Download completed successfully')
            resolve()
          })

          file.on('error', (err: Error) => {
            fs.unlink(outputPath).catch(() => {})
            reject(err)
          })
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirects
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            console.info(`Following redirect to: ${redirectUrl}`)
            downloadFile(redirectUrl, outputPath).then(resolve).catch(reject)
          } else {
            reject(new Error('Redirect without location header'))
          }
        } else {
          reject(
            new Error(
              `Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`,
            ),
          )
        }
      })
      .on('error', (err: Error) => {
        reject(err)
      })
  })
}

async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DOWNLOADS_DIR)
  } catch {
    console.info('📁 Creating data directories...')
    await fs.mkdir(DOWNLOADS_DIR, { recursive: true })
  }
}

async function checkFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath)
    return stats.size
  } catch {
    return 0
  }
}

export async function downloadOpenFoodFactsData(): Promise<void> {
  console.info('🚀 Starting OpenFoodFacts data download...')

  try {
    await ensureDataDirectory()

    // Check if file already exists
    const existingSize = await checkFileSize(PARQUET_FILE_PATH)
    if (existingSize > 0) {
      console.info(
        `📦 Existing file found (${(existingSize / 1024 / 1024).toFixed(1)} MB)`,
      )

      // Check if running in interactive mode or through API
      const isInteractive =
        process.stdin.isTTY && process.env.NODE_ENV !== 'test'
      const forceDownload =
        process.argv.includes('--force') || process.argv.includes('-f')

      if (isInteractive && !forceDownload) {
        const choice = await new Promise<string>((resolve) => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          })

          rl.question(
            'Do you want to re-download? (yes/no): ',
            (answer: string) => {
              rl.close()
              resolve(answer.toLowerCase())
            },
          )
        })

        if (choice !== 'yes' && choice !== 'y') {
          console.info('✅ Using existing file')
          return
        }
      } else {
        // Non-interactive mode (API) or force flag - automatically re-download
        console.info(
          '🔄 Non-interactive mode detected - automatically re-downloading...',
        )
      }
    }

    console.info('📥 Downloading OpenFoodFacts parquet file...')
    console.info(`🔗 URL: ${OPENFOODFACTS_URL}`)

    await downloadFile(OPENFOODFACTS_URL, PARQUET_FILE_PATH)

    // Verify the downloaded file
    const finalSize = await checkFileSize(PARQUET_FILE_PATH)
    console.info(
      `📊 Final file size: ${(finalSize / 1024 / 1024).toFixed(1)} MB`,
    )

    if (finalSize === 0) {
      throw new Error('Downloaded file is empty')
    }

    console.info('✅ OpenFoodFacts data downloaded successfully!')
    console.info(`📁 File saved to: ${PARQUET_FILE_PATH}`)
  } catch (error) {
    console.error('❌ Error downloading OpenFoodFacts data:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  downloadOpenFoodFactsData()
    .then(() => {
      console.info('🎉 Download process completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Download failed:', error)
      process.exit(1)
    })
}
