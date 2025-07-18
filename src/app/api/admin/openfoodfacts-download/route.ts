import { spawn } from 'child_process'
import { NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'

import { updateImportStatus } from '../openfoodfacts-import-status/route'

export async function POST() {
  try {
    // Verify admin access
    await requireAdminUser()

    // Update status to downloading
    updateImportStatus({
      isDownloading: true,
      isParsing: false,
      isImporting: false,
      progress: 0,
      currentStep: 'Initializing OpenFoodFacts dataset download...',
      logs: ['📥 Starting OpenFoodFacts dataset download...'],
    })

    // Run download script in background with real-time progress
    runDownloadProcessWithProgress()

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

function runDownloadProcessWithProgress() {
  try {
    // Spawn the script process with --force flag to avoid interactive prompts
    const scriptProcess = spawn(
      'npx',
      ['tsx', 'src/scripts/download-openfoodfacts-data.ts', '--force'],
      {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )

    updateImportStatus({
      progress: 5,
      logs: ['📥 Downloading OpenFoodFacts Parquet dataset (4GB)...'],
    })

    // Parse stdout for progress updates
    scriptProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.info('Download stdout:', output)

      // Parse download progress from the script output
      // Format: "Downloading: 25.3% (1024.5/4014.1 MB)"
      const progressMatch = output.match(
        /Downloading:\s*(\d+\.?\d*)%\s*\((\d+\.?\d*)\s*\/\s*(\d+\.?\d*)\s*MB\)/,
      )
      if (progressMatch) {
        const percentage = parseFloat(progressMatch[1])
        const downloadedMB = parseFloat(progressMatch[2])
        const totalMB = parseFloat(progressMatch[3])

        updateImportStatus({
          progress: Math.min(95, Math.max(5, percentage)), // Keep between 5-95%
          currentStep: `📥 Downloading: ${percentage}% (${downloadedMB.toFixed(1)}/${totalMB.toFixed(1)} MB)`,
          logs: [
            '📥 Downloading OpenFoodFacts Parquet dataset (4GB)...',
            `Progress: ${percentage}% - ${downloadedMB.toFixed(1)}MB downloaded`,
          ],
        })
      }

      // Check for completion message
      if (output.includes('✅ Download completed successfully')) {
        updateImportStatus({
          isDownloading: false,
          progress: 100,
          currentStep: '✅ Download completed successfully',
          logs: [
            '📥 Downloading OpenFoodFacts Parquet dataset (4GB)...',
            '✅ OpenFoodFacts dataset downloaded successfully!',
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
    })

    // Handle stderr for errors
    scriptProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString()
      console.error('Download stderr:', errorOutput)

      updateImportStatus({
        logs: [
          '📥 Downloading OpenFoodFacts Parquet dataset (4GB)...',
          `⚠️ Warning: ${errorOutput.trim()}`,
        ],
      })
    })

    // Handle process completion
    scriptProcess.on('close', (code) => {
      console.info(`Download process exited with code ${code}`)

      if (code !== 0) {
        updateImportStatus({
          isDownloading: false,
          currentStep: '❌ Download failed',
          logs: [
            '📥 Downloading OpenFoodFacts Parquet dataset (4GB)...',
            `❌ Download failed with exit code ${code}`,
          ],
        })
      }
    })

    // Handle process errors
    scriptProcess.on('error', (error) => {
      console.error('Download process error:', error)
      updateImportStatus({
        isDownloading: false,
        currentStep: '❌ Download failed',
        logs: [
          '📥 Downloading OpenFoodFacts Parquet dataset (4GB)...',
          `❌ Process error: ${error.message}`,
        ],
      })
    })
  } catch (error) {
    console.error('Download process failed:', error)
    updateImportStatus({
      isDownloading: false,
      currentStep: '❌ Download failed',
      logs: [`❌ Download error: ${error}`],
    })
  }
}
