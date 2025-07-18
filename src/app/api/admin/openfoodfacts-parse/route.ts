import { spawn } from 'child_process'
import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'

import { updateImportStatus } from '../openfoodfacts-import-status/utils'

export async function POST() {
  try {
    // Verify admin access
    await requireAdminUser()

    // Update status to parsing
    updateImportStatus({
      isDownloading: false,
      isParsing: true,
      isImporting: false,
      progress: 0,
      currentStep: 'Initializing OpenFoodFacts Parquet → CSV conversion...',
      logs: ['🔄 Starting OpenFoodFacts Parquet → CSV conversion...'],
    })

    // Run parsing script in background with real-time progress
    runParsingProcessWithProgress()

    return NextResponse.json({ message: 'CSV conversion process started' })
  } catch (error) {
    console.error('Error starting parsing:', error)
    updateImportStatus({
      isParsing: false,
      currentStep: '❌ CSV conversion failed',
      logs: [`❌ CSV conversion error: ${error}`],
    })
    return NextResponse.json(
      { error: 'Failed to start CSV conversion process' },
      { status: 500 },
    )
  }
}

function runParsingProcessWithProgress() {
  try {
    // Spawn the direct Parquet-to-CSV script process with --force flag to avoid interactive prompts
    const scriptProcess = spawn(
      'npx',
      ['tsx', 'src/scripts/parquet-to-csv-openfoodfacts.ts', '--force'],
      {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )

    updateImportStatus({
      progress: 10,
      currentStep: 'Converting Parquet data directly to CSV with DuckDB...',
      logs: ['🔄 Converting Parquet data directly to CSV with DuckDB...'],
    })

    // Parse stdout for progress updates
    scriptProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.info('Parse stdout:', output)

      // Look for batch processing progress
      const batchMatch = output.match(
        /Processing batch: (\d+)-(\d+).*?(\d+\.\d+)%/,
      )
      if (batchMatch) {
        const endRange = parseInt(batchMatch[2])
        const percentage = parseFloat(batchMatch[3])
        const scaledPercentage = Math.min(85, 15 + (percentage / 100) * 70) // Scale to 15-85%

        updateImportStatus({
          progress: scaledPercentage,
          currentStep: `🔄 Converting products: ${endRange.toLocaleString()}`,
          logs: [
            '🔄 Converting Parquet data directly to CSV with DuckDB...',
            `Converting: ${endRange.toLocaleString()} products (${percentage}%)`,
          ],
        })
      }

      // Look for total progress updates
      const totalProgressMatch = output.match(
        /Total progress: ([\d,]+) \/ ([\d,]+) products \(([\d.]+)%\)/,
      )
      if (totalProgressMatch) {
        const processed = totalProgressMatch[1].replace(/,/g, '')
        const total = totalProgressMatch[2].replace(/,/g, '')
        const percentage = parseFloat(totalProgressMatch[3])
        const scaledPercentage = Math.min(85, 15 + (percentage / 100) * 70) // Scale to 15-85%

        updateImportStatus({
          progress: scaledPercentage,
          currentStep: `🔄 Converting to CSV: ${processed} / ${total} products`,
          logs: [
            '🔄 Converting Parquet data directly to CSV with DuckDB...',
            `Progress: ${processed} / ${total} products (${percentage}%)`,
          ],
        })
      }

      // Check for CSV header written
      if (output.includes('CSV header written')) {
        updateImportStatus({
          progress: 20,
          currentStep: '📄 CSV file initialized, starting conversion...',
          logs: [
            '🔄 Converting Parquet data directly to CSV with DuckDB...',
            '📄 CSV header written, starting conversion...',
          ],
        })
      }

      // Check for completion indicators
      if (
        output.includes('conversion completed') ||
        output.includes('Successfully processed')
      ) {
        updateImportStatus({
          progress: 95,
          currentStep: '🔄 Finalizing CSV conversion...',
          logs: [
            '🔄 Converting Parquet data directly to CSV with DuckDB...',
            '📄 CSV conversion completed, finalizing...',
          ],
        })
      }

      // Check for final completion
      if (
        output.includes('✅') &&
        (output.includes('conversion completed') ||
          output.includes('Ready for database import'))
      ) {
        // Try to extract final numbers
        const finalMatch = output.match(/(\d+,?\d*)\s+.*?products processed/)
        const finalCount = finalMatch
          ? parseInt(finalMatch[1].replace(/,/g, ''))
          : 0

        updateImportStatus({
          isParsing: false,
          progress: 100,
          currentStep: '✅ CSV conversion completed successfully',
          logs: [
            '🔄 Converting Parquet data directly to CSV with DuckDB...',
            finalCount > 0
              ? `✅ Successfully converted ${finalCount.toLocaleString()} products to CSV!`
              : '✅ OpenFoodFacts data converted to CSV successfully!',
            '📄 Ready for database import!',
          ],
        })

        // Reset status after 10 seconds
        setTimeout(() => {
          updateImportStatus({
            progress: 0,
            currentStep: '',
            logs: [],
          })
        }, 10000)
      }

      // Check for file save confirmation
      if (output.includes('CSV file saved:')) {
        updateImportStatus({
          logs: [
            '🔄 Converting Parquet data directly to CSV with DuckDB...',
            '📄 CSV file saved successfully!',
          ],
        })
      }
    })

    // Handle stderr for errors and warnings
    scriptProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString()
      console.error('Parse stderr:', errorOutput)

      // Don't treat all stderr as errors - DuckDB might output warnings
      if (errorOutput.toLowerCase().includes('error')) {
        updateImportStatus({
          logs: [
            '🔄 Converting Parquet data directly to CSV with DuckDB...',
            `❌ Error: ${errorOutput.trim()}`,
          ],
        })
      } else {
        updateImportStatus({
          logs: [
            '🔄 Converting Parquet data directly to CSV with DuckDB...',
            `ℹ️ Info: ${errorOutput.trim()}`,
          ],
        })
      }
    })

    // Handle process completion
    scriptProcess.on('close', (code) => {
      console.info(`Parse process exited with code ${code}`)

      if (code !== 0) {
        updateImportStatus({
          isParsing: false,
          currentStep: '❌ CSV conversion failed',
          logs: [
            '🔄 Converting Parquet data directly to CSV with DuckDB...',
            `❌ CSV conversion failed with exit code ${code}`,
          ],
        })
      }
    })

    // Handle process errors
    scriptProcess.on('error', (error) => {
      console.error('Parse process error:', error)
      updateImportStatus({
        isParsing: false,
        currentStep: '❌ CSV conversion failed',
        logs: [
          '🔄 Converting Parquet data directly to CSV with DuckDB...',
          `❌ Process error: ${error.message}`,
        ],
      })
    })
  } catch (error) {
    console.error('Parsing process failed:', error)
    updateImportStatus({
      isParsing: false,
      currentStep: '❌ Parsing failed',
      logs: [`❌ Parsing error: ${error}`],
    })
  }
}
