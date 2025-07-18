import { spawn } from 'child_process'
import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'

import { updateImportStatus } from '../usda-import-status/utils'

export async function POST() {
  try {
    // Verify admin access
    await requireAdminUser()

    // Update status to CSV conversion
    updateImportStatus({
      isDownloading: false,
      isParsing: true,
      isImporting: false,
      progress: 0,
      currentStep: 'Initializing USDA CSV conversion...',
      logs: ['🔄 Starting USDA data to CSV conversion...'],
    })

    // Run CSV conversion script in background with real-time progress
    runCSVConversionProcessWithProgress()

    return NextResponse.json({ message: 'CSV conversion process started' })
  } catch (error) {
    console.error('Error starting CSV conversion:', error)
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

function runCSVConversionProcessWithProgress() {
  try {
    // Spawn the direct CSV conversion script process with --force flag to avoid interactive prompts
    const scriptProcess = spawn(
      'npx',
      ['tsx', 'src/scripts/usda-to-csv.ts', '--force'],
      {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )

    updateImportStatus({
      progress: 10,
      currentStep: 'Converting USDA data to CSV...',
      logs: ['🔄 Converting USDA data to CSV...'],
    })

    // Parse stdout for progress updates
    scriptProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.info('USDA CSV stdout:', output)

      // Look for dataset processing progress
      if (output.includes('Processing') && output.includes('dataset')) {
        const foundationMatch = output.match(/Processing Foundation Foods/)
        const srLegacyMatch = output.match(/Processing SR Legacy/)

        if (foundationMatch) {
          updateImportStatus({
            progress: 30,
            currentStep: '🔄 Processing Foundation Foods dataset...',
            logs: [
              '🔄 Converting USDA data to CSV...',
              '📄 Processing Foundation Foods dataset...',
            ],
          })
        }

        if (srLegacyMatch) {
          updateImportStatus({
            progress: 60,
            currentStep: '🔄 Processing SR Legacy dataset...',
            logs: [
              '🔄 Converting USDA data to CSV...',
              '📄 Processing SR Legacy dataset...',
            ],
          })
        }
      }

      // Look for progress updates within datasets
      const progressMatch = output.match(
        /Processed (\d+)\/(\d+) foods.*?(\d+\.\d+)%/,
      )
      if (progressMatch) {
        const processed = parseInt(progressMatch[1])
        const total = parseInt(progressMatch[2])
        const percentage = parseFloat(progressMatch[3])
        const scaledPercentage = Math.min(85, 20 + (percentage / 100) * 60) // Scale to 20-85%

        updateImportStatus({
          progress: scaledPercentage,
          currentStep: `🔄 Converting: ${processed.toLocaleString()} / ${total.toLocaleString()} foods`,
          logs: [
            '🔄 Converting USDA data to CSV...',
            `Progress: ${processed.toLocaleString()} / ${total.toLocaleString()} foods (${percentage}%)`,
          ],
        })
      }

      // Check for completion indicators
      if (
        output.includes('conversion completed') ||
        (output.includes('✅') && output.includes('USDA'))
      ) {
        updateImportStatus({
          progress: 95,
          currentStep: '🔄 Finalizing CSV conversion...',
          logs: [
            '🔄 Converting USDA data to CSV...',
            '📄 CSV conversion completed, finalizing...',
          ],
        })
      }

      // Check for final completion
      if (output.includes('Ready for database import')) {
        // Try to extract final numbers
        const finalMatch = output.match(/(\d+,?\d*)\s+.*?foods processed/)
        const finalCount = finalMatch
          ? parseInt(finalMatch[1].replace(/,/g, ''))
          : 0

        updateImportStatus({
          isParsing: false,
          progress: 100,
          currentStep: '✅ CSV conversion completed successfully',
          logs: [
            '🔄 Converting USDA data to CSV...',
            finalCount > 0
              ? `✅ Successfully converted ${finalCount.toLocaleString()} foods to CSV!`
              : '✅ USDA data converted to CSV successfully!',
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
            '🔄 Converting USDA data to CSV...',
            '📄 CSV file saved successfully!',
          ],
        })
      }
    })

    // Handle stderr for errors and warnings
    scriptProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString()
      console.error('USDA CSV stderr:', errorOutput)

      if (errorOutput.toLowerCase().includes('error')) {
        updateImportStatus({
          logs: [
            '🔄 Converting USDA data to CSV...',
            `❌ Error: ${errorOutput.trim()}`,
          ],
        })
      } else {
        updateImportStatus({
          logs: [
            '🔄 Converting USDA data to CSV...',
            `ℹ️ Info: ${errorOutput.trim()}`,
          ],
        })
      }
    })

    // Handle process completion
    scriptProcess.on('close', (code) => {
      console.info(`USDA CSV process exited with code ${code}`)

      if (code !== 0) {
        updateImportStatus({
          isParsing: false,
          currentStep: '❌ CSV conversion failed',
          logs: [
            '🔄 Converting USDA data to CSV...',
            `❌ CSV conversion failed with exit code ${code}`,
          ],
        })
      }
    })

    // Handle process errors
    scriptProcess.on('error', (error) => {
      console.error('USDA CSV process error:', error)
      updateImportStatus({
        isParsing: false,
        currentStep: '❌ CSV conversion failed',
        logs: [
          '🔄 Converting USDA data to CSV...',
          `❌ Process error: ${error.message}`,
        ],
      })
    })
  } catch (error) {
    console.error('CSV conversion process failed:', error)
    updateImportStatus({
      isParsing: false,
      currentStep: '❌ CSV conversion failed',
      logs: [`❌ CSV conversion error: ${error}`],
    })
  }
}
