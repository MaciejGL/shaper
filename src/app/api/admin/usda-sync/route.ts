import { spawn } from 'child_process'
import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'

import { updateImportStatus } from '../usda-import-status/route'

export async function POST() {
  try {
    // Verify admin access
    await requireAdminUser()

    // Update status to syncing
    updateImportStatus({
      isDownloading: false,
      isParsing: false,
      isImporting: true, // Using import flag for sync operation
      progress: 0,
      currentStep: 'Initializing database sync from CSV...',
      logs: ['🔄 Starting database sync from existing CSV...'],
    })

    // Run sync process in background with real-time progress
    runSyncProcessWithProgress()

    return NextResponse.json({ message: 'Database sync from CSV started' })
  } catch (error) {
    console.error('Error starting sync:', error)
    updateImportStatus({
      isImporting: false,
      currentStep: '❌ Database sync failed',
      logs: [`❌ Database sync error: ${error}`],
    })
    return NextResponse.json(
      { error: 'Failed to start database sync process' },
      { status: 500 },
    )
  }
}

function runSyncProcessWithProgress() {
  try {
    // Spawn the direct database sync script process
    const scriptProcess = spawn(
      'npx',
      ['tsx', 'src/scripts/usda-sync-database.ts'],
      {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )

    updateImportStatus({
      progress: 5,
      currentStep: 'Reading CSV file and preparing database sync...',
      logs: ['🔄 Starting database sync process...', '📄 Reading CSV file...'],
    })

    // Parse stdout for progress updates
    scriptProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.info('USDA Sync stdout:', output)

      // CSV reading progress
      const csvReadMatch = output.match(/Found CSV file: (.+)/)
      if (csvReadMatch) {
        updateImportStatus({
          progress: 10,
          currentStep: '📄 CSV file loaded, starting sync...',
          logs: [
            '🔄 Starting database sync process...',
            '📄 CSV file found and loaded',
          ],
        })
      }

      // Database upsert progress - look for batch processing
      const batchMatch = output.match(
        /Batch (\d+): (\d+) foods processed.*?Record: (\d+)/,
      )
      if (batchMatch) {
        const batchNum = parseInt(batchMatch[1])
        const recordNum = parseInt(batchMatch[3])

        // Estimate progress based on record number (assuming ~50k total records)
        const estimatedProgress = Math.min(90, 10 + (recordNum / 50000) * 80)

        updateImportStatus({
          progress: estimatedProgress,
          currentStep: `💾 Syncing to database: ${recordNum.toLocaleString()} records processed`,
          logs: [
            '🔄 Starting database sync process...',
            `💾 Database sync: Batch ${batchNum}, ${recordNum.toLocaleString()} records processed`,
          ],
        })
      }

      // Final completion - look for sync completed message
      const completionMatch = output.match(
        /Sync completed: (\d+) foods processed/,
      )
      if (completionMatch) {
        const totalFoods = parseInt(completionMatch[1])

        updateImportStatus({
          progress: 100,
          currentStep: `✅ Sync completed: ${totalFoods.toLocaleString()} foods processed`,
          logs: [
            '🔄 Starting database sync process...',
            `✅ Sync completed successfully`,
            `📊 Total foods synced: ${totalFoods.toLocaleString()}`,
          ],
        })
      }

      // Look for error indicators
      if (output.includes('❌') || output.includes('Error')) {
        updateImportStatus({
          logs: [
            '🔄 Starting database sync process...',
            `❌ Error detected: ${output.trim()}`,
          ],
        })
      }
    })

    // Handle errors
    scriptProcess.stderr.on('data', (data) => {
      const error = data.toString()
      console.error('USDA Sync stderr:', error)

      updateImportStatus({
        logs: [`❌ Error: ${error}`],
      })
    })

    // Handle process completion
    scriptProcess.on('close', (code) => {
      console.info(`USDA sync process finished with code: ${code}`)

      if (code === 0) {
        updateImportStatus({
          isImporting: false,
          progress: 100,
          currentStep: '✅ Database sync completed successfully',
        })
      } else {
        updateImportStatus({
          isImporting: false,
          currentStep: '❌ Database sync failed',
          logs: [`❌ Process exited with code: ${code}`],
        })
      }
    })

    // Handle process errors
    scriptProcess.on('error', (error) => {
      console.error('USDA sync process error:', error)
      updateImportStatus({
        isImporting: false,
        currentStep: '❌ Database sync failed',
        logs: [`❌ Process error: ${error.message}`],
      })
    })
  } catch (error) {
    console.error('Error in runSyncProcessWithProgress:', error)
    updateImportStatus({
      isImporting: false,
      currentStep: '❌ Database sync failed',
      logs: [`❌ Sync process error: ${error}`],
    })
  }
}
