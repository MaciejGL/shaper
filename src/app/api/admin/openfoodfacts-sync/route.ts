import { spawn } from 'child_process'
import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'

import { updateImportStatus } from '../openfoodfacts-import-status/route'

export async function POST() {
  try {
    // Verify admin access
    await requireAdminUser()

    // Update status to syncing
    updateImportStatus({
      isDownloading: false,
      isParsing: false,
      isImporting: true, // Using import flag for sync operation
      isConvertingCsv: false,
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
      ['tsx', 'src/scripts/openfoodfacts-sync-database.ts'],
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
      console.info('Sync stdout:', output)

      // CSV reading progress
      const csvReadMatch = output.match(/Reading CSV: ([\d,]+) rows/)
      if (csvReadMatch) {
        const rowCount = csvReadMatch[1]
        updateImportStatus({
          progress: 10,
          currentStep: `📄 CSV loaded: ${rowCount} products ready for sync`,
          logs: [
            '🔄 Starting database sync process...',
            `📄 CSV file loaded: ${rowCount} products`,
          ],
        })
      }

      // Database upsert progress
      const upsertMatch = output.match(
        /Upserting batch: (\d+)-(\d+).*?(\d+\.\d+)%/,
      )
      if (upsertMatch) {
        const endRange = parseInt(upsertMatch[2])
        const percentage = parseFloat(upsertMatch[3])
        const scaledPercentage = Math.min(95, 10 + (percentage / 100) * 85) // Scale to 10-95%

        updateImportStatus({
          progress: scaledPercentage,
          currentStep: `💾 Upserting to database: ${endRange.toLocaleString()} products`,
          logs: [
            '🔄 Starting database sync process...',
            `💾 Database upsert: ${endRange.toLocaleString()} products (${percentage.toFixed(1)}%)`,
          ],
        })
      }

      // Final statistics
      const statsMatch = output.match(
        /Sync completed: (\d+) new, (\d+) updated, (\d+) total/,
      )
      if (statsMatch) {
        const newCount = statsMatch[1]
        const updatedCount = statsMatch[2]
        const totalCount = statsMatch[3]

        updateImportStatus({
          progress: 100,
          currentStep: `✅ Sync completed: ${newCount} new, ${updatedCount} updated`,
          logs: [
            '🔄 Starting database sync process...',
            `✅ Sync completed successfully`,
            `📊 Results: ${newCount} new products, ${updatedCount} updated, ${totalCount} total`,
          ],
        })
      }
    })

    // Handle errors
    scriptProcess.stderr.on('data', (data) => {
      const error = data.toString()
      console.error('Sync stderr:', error)

      updateImportStatus({
        logs: [`❌ Error: ${error}`],
      })
    })

    // Handle process completion
    scriptProcess.on('close', (code) => {
      console.info(`Sync process finished with code: ${code}`)

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
      console.error('Sync process error:', error)
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
