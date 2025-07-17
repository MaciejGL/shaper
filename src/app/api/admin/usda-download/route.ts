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

    // Update status to downloading
    updateImportStatus({
      isDownloading: true,
      isParsing: false,
      isImporting: false,
      progress: 10,
      currentStep: 'Downloading USDA datasets...',
      logs: ['📥 Starting USDA dataset download...'],
    })

    // Run download script in background
    runDownloadProcess()

    return NextResponse.json({ message: 'Download process started' })
  } catch (error) {
    console.error('Error starting download:', error)
    updateImportStatus({
      isDownloading: false,
      currentStep: '❌ Download failed',
      logs: [`❌ Download error: ${error}`],
    })
    return NextResponse.json(
      { error: 'Failed to start download process' },
      { status: 500 },
    )
  }
}

async function runDownloadProcess() {
  try {
    updateImportStatus({
      progress: 20,
      logs: ['📥 Downloading Foundation Foods dataset...'],
    })

    await execAsync('cd src/scripts && npx tsx download-usda-data.ts')

    updateImportStatus({
      isDownloading: false,
      progress: 100,
      currentStep: '✅ Download completed',
      logs: ['✅ USDA datasets downloaded successfully!'],
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
    console.error('Download process failed:', error)
    updateImportStatus({
      isDownloading: false,
      currentStep: '❌ Download failed',
      logs: [`❌ Download error: ${error}`],
    })
  }
}
