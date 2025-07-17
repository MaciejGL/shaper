import { exec } from 'child_process'
import { NextResponse } from 'next/server'
import { promisify } from 'util'

import { requireAdminUser } from '@/lib/admin-auth'

import { updateImportStatus } from '../usda-import-status/route'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Verify admin access
    await requireAdminUser()

    // Reset status
    updateImportStatus({
      isDownloading: true,
      isParsing: false,
      isImporting: false,
      progress: 10,
      currentStep: 'Starting full USDA data update...',
      logs: ['🚀 Starting full USDA data update process'],
    })

    // Run the full update process in the background
    runFullUpdateProcess()

    return NextResponse.json({ message: 'Full update process started' })
  } catch (error) {
    console.error('Error starting full update:', error)
    return NextResponse.json(
      { error: 'Failed to start full update process' },
      { status: 500 },
    )
  }
}

async function runFullUpdateProcess() {
  try {
    // Step 1: Download USDA data
    updateImportStatus({
      currentStep: '📥 Downloading USDA datasets...',
      progress: 20,
      logs: [
        '🚀 Starting full USDA data update process',
        '📥 Downloading USDA datasets...',
      ],
    })

    console.info('Starting download process...')
    const downloadResult = await execAsync(
      'npx tsx src/scripts/download-usda-data.ts',
      { cwd: process.cwd() },
    )
    console.info('Download stdout:', downloadResult.stdout)
    console.info('Download stderr:', downloadResult.stderr)

    updateImportStatus({
      progress: 40,
      logs: [
        '🚀 Starting full USDA data update process',
        '📥 Downloading USDA datasets...',
        '✅ Download completed',
      ],
    })

    // Step 2: Parse data
    updateImportStatus({
      isDownloading: false,
      isParsing: true,
      currentStep: '🔍 Parsing CSV files...',
      progress: 50,
      logs: [
        '🚀 Starting full USDA data update process',
        '📥 Downloading USDA datasets...',
        '✅ Download completed',
        '🔍 Parsing CSV files...',
      ],
    })

    console.info('Starting parse process...')
    const parseResult = await execAsync(
      'npx tsx src/scripts/parse-usda-data.ts',
      { cwd: process.cwd() },
    )
    console.info('Parse stdout:', parseResult.stdout)
    console.info('Parse stderr:', parseResult.stderr)

    updateImportStatus({
      progress: 70,
      logs: [
        '🚀 Starting full USDA data update process',
        '📥 Downloading USDA datasets...',
        '✅ Download completed',
        '🔍 Parsing CSV files...',
        '✅ Parsing completed',
      ],
    })

    // Step 3: Import to database
    updateImportStatus({
      isParsing: false,
      isImporting: true,
      currentStep: '💾 Importing to database...',
      progress: 80,
      logs: [
        '🚀 Starting full USDA data update process',
        '📥 Downloading USDA datasets...',
        '✅ Download completed',
        '🔍 Parsing CSV files...',
        '✅ Parsing completed',
        '💾 Importing to database...',
      ],
    })

    console.info('Starting import process...')
    const importResult = await execAsync(
      'npx tsx src/scripts/import-usda-data.ts',
      { cwd: process.cwd() },
    )
    console.info('Import stdout:', importResult.stdout)
    console.info('Import stderr:', importResult.stderr)

    updateImportStatus({
      isImporting: false,
      progress: 100,
      currentStep: '🎉 Full update completed!',
      logs: [
        '🚀 Starting full USDA data update process',
        '📥 Downloading USDA datasets...',
        '✅ Download completed',
        '🔍 Parsing CSV files...',
        '✅ Parsing completed',
        '💾 Importing to database...',
        '✅ Import completed successfully!',
      ],
    })

    // Reset status after completion
    setTimeout(() => {
      updateImportStatus({
        isDownloading: false,
        isParsing: false,
        isImporting: false,
        progress: 0,
        currentStep: '',
        logs: [],
      })
    }, 30000) // Clear status after 30 seconds
  } catch (error) {
    console.error('Full update process failed:', error)
    updateImportStatus({
      currentStep: '❌ Update failed',
      isDownloading: false,
      isParsing: false,
      isImporting: false,
      logs: ['❌ Error: ' + String(error)],
    })
  }
}

// Status is now managed by the usda-import-status endpoint
