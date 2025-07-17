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

    // Update status to importing
    updateImportStatus({
      isDownloading: false,
      isParsing: false,
      isImporting: true,
      progress: 10,
      currentStep: 'Importing USDA data to database...',
      logs: ['💾 Starting database import...'],
    })

    // Run import script in background
    runImportProcess()

    return NextResponse.json({ message: 'Import process started' })
  } catch (error) {
    console.error('Error starting import:', error)
    updateImportStatus({
      isImporting: false,
      currentStep: '❌ Import failed',
      logs: [`❌ Import error: ${error}`],
    })
    return NextResponse.json(
      { error: 'Failed to start import process' },
      { status: 500 },
    )
  }
}

async function runImportProcess() {
  try {
    updateImportStatus({
      progress: 20,
      logs: ['💾 Clearing existing USDA data...'],
    })

    updateImportStatus({
      progress: 40,
      logs: ['💾 Importing parsed food data...'],
    })

    await execAsync('cd src/scripts && npx tsx import-usda-data.ts')

    updateImportStatus({
      isImporting: false,
      progress: 100,
      currentStep: '✅ Import completed',
      logs: ['✅ USDA data imported to database successfully!'],
    })

    // Reset status after 10 seconds
    setTimeout(() => {
      updateImportStatus({
        progress: 0,
        currentStep: '',
        logs: [],
      })
    }, 10000)
  } catch (error) {
    console.error('Import process failed:', error)
    updateImportStatus({
      isImporting: false,
      currentStep: '❌ Import failed',
      logs: [`❌ Import error: ${error}`],
    })
  }
}
